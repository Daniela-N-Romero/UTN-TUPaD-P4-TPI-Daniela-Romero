from typing import Annotated

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork, get_producto_uow
from fastapi import Depends


class ProductoNoEncontrado(Exception):
    """Se lanza cuando un producto activo no existe."""


class CategoriaNoEncontrada(Exception):
    """Se lanza cuando la categoría no existe o está inactiva."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar_activos(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(item) for item in items],
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, producto_in: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(producto_in.categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada(
                    "La categoría indicada no existe o está dada de baja"
                )

            nuevo = Producto(
                categoria_id=producto_in.categoria_id,
                nombre=producto_in.nombre,
                descripcion=producto_in.descripcion,
                precio_base=producto_in.precio_base,
                imagen_url=producto_in.imagen_url,
                stock=producto_in.stock,
                disponible=producto_in.disponible,
                activo=True,
            )
            uow.productos.add(nuevo)
            creado = uow.productos.get_activo_by_id(nuevo.id)  # type: ignore[arg-type]
            return ProductoRead.model_validate(creado or nuevo)

    def actualizar(
        self, producto_id: int, producto_in: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            datos = producto_in.model_dump(exclude_unset=True)
            if "categoria_id" in datos and datos["categoria_id"] is not None:
                categoria = uow.categorias.get_activa_by_id(datos["categoria_id"])
                if not categoria:
                    raise CategoriaNoEncontrada(
                        "La categoría indicada no existe o está dada de baja"
                    )

            for campo, valor in datos.items():
                setattr(producto, campo, valor)

            uow._session.add(producto)
            uow._session.flush()
            actualizado = uow.productos.get_activo_by_id(producto_id)
            return ProductoRead.model_validate(actualizado or producto)

    def actualizar_stock(
        self, producto_id: int, stock_in: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = stock_in.stock
            producto.disponible = stock_in.disponible

            uow._session.add(producto)
            uow._session.flush()
            actualizado = uow.productos.get_activo_by_id(producto_id)
            return ProductoRead.model_validate(actualizado or producto)

    def baja_logica(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.activo = False
            uow._session.add(producto)
            uow._session.flush()


def get_producto_service(
    uow: Annotated[ProductoUnitOfWork, Depends(get_producto_uow)],
) -> ProductoService:
    return ProductoService(uow)