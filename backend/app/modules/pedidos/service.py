from datetime import datetime, timezone
from typing import Annotated

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork, get_pedido_uow
from fastapi import Depends


class PedidoNoEncontrado(Exception):
    """404 - El pedido no existe."""


class ProductoNoEncontrado(Exception):
    """404 - Algún producto del pedido no existe o está inactivo."""


class PedidoAjeno(Exception):
    """403 - El pedido pertenece a otro usuario."""


class StockInsuficiente(Exception):
    """400 - No hay stock suficiente para la cantidad solicitada."""


class ProductoNoDisponible(Exception):
    """400 - El producto no está disponible para la venta."""


class ProductoRepetido(Exception):
    """400 - Se envió el mismo producto más de una vez en el pedido."""


class TransicionInvalida(Exception):
    """400 - La transición de estado no es válida según RN-02 / RN-03 / RN-04."""


TRANSICIONES_ADMIN: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            
            ## CREACIÓN DEL PEDIDO CON AL MENOS 1 ITEM
            if not data.items:
                raise TransicionInvalida("El pedido debe contener al menos un ítem.")

            ids_vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in ids_vistos:
                    raise ProductoRepetido(
                        f"Producto duplicado en el pedido: {item.producto_id}"
                    )
                ids_vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None
            
            total_calculado = 0.0
            
            ## CREACIÓN DE DETALLES CON VERIFICACIÓN DE PRODUCTOS VÁLIDOS NO REPETIDOS
            for item in data.items:
                producto = uow.productos.get_activo_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(
                        "Producto no encontrado o inactivo."
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible."
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {item.cantidad}."
                    )

                producto.stock -= item.cantidad ## ACTUALIZACION DE STOCK
                uow._session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,  # type: ignore[arg-type]
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow._session.add(detalle)
                total_calculado = round(total_calculado + subtotal, 2)

            ## ACTUALIZACIÓN DE TOTAL DE PEDIDO UNA VEZ CREADOS LOS DETALLES
            pedido.total = total_calculado
            pedido.updated_at = datetime.now(timezone.utc)
            uow._session.add(pedido)
            uow._session.flush()

            creado = uow.pedidos.get_by_id_with_items(pedido.id)
            return PedidoRead.model_validate(creado or pedido)

    def listar_pedidos(
        self,
        *,
        usuario_id: int,
        rol: str,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            if rol == "admin":
                total, pedidos = uow.pedidos.list_paginated(
                    skip=skip, limit=limit, estado=estado
                )
            else:
                total, pedidos = uow.pedidos.list_by_usuario(
                    usuario_id, skip=skip, limit=limit, estado=estado
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener_por_id(
        self, pedido_id: int, *, usuario_id: int, rol: str
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")
            if rol != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tenés permiso para ver este pedido.")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado_admin(
        self, pedido_id: int, data: CambioEstado
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")

            estado_actual = pedido.estado
            nuevo_estado = data.estado

            ##SOLO SE PERMITEN TRANSICIONES VALIDAS
            if nuevo_estado not in TRANSICIONES_ADMIN.get(estado_actual, set()):
                raise TransicionInvalida(
                    f"No se puede pasar de {estado_actual} a {nuevo_estado}."
                )

            ##RESTITUCION DE STOCK SI SE CANCELA EL PEDIDO
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow._session.add(pedido)
            uow._session.flush()

            actualizado = uow.pedidos.get_by_id_with_items(pedido_id)
            return PedidoRead.model_validate(actualizado or pedido)

    def cancelar_propio(self, pedido_id: int, *, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado.")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario.")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo podés cancelar un pedido mientras está en estado PENDIENTE."
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow._session.add(pedido)
            uow._session.flush()

            actualizado = uow.pedidos.get_by_id_with_items(pedido_id)
            return PedidoRead.model_validate(actualizado or pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos = uow.pedidos.sum_ingresos_entregados()
            return ResumenPedidos(
                pendientes=conteos["PENDIENTE"],
                en_preparacion=conteos["EN_PREPARACION"],
                entregados=conteos["ENTREGADO"],
                cancelados=conteos["CANCELADO"],
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos,
            )

    ##ANTE UNA CANCELACION SE RESTITUYE EL STOCK DEL PRODUCTO
    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow._session.add(producto)


def get_pedido_service(
    uow: Annotated[PedidoUnitOfWork, Depends(get_pedido_uow)],
) -> PedidoService:
    return PedidoService(uow)