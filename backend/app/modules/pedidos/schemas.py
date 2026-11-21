from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, Field, model_validator
from sqlmodel import SQLModel

FormaPagoType = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedidoType = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]

#Representa un ítem enviado al crear un pedido desde el carrito.
class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPagoType
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str = Field(default="")

    #revisamos que no venga el mismo producto repetido en la lista de ítems
    @model_validator(mode="after")
    def validar_items_sin_repetidos(self) -> "PedidoCreate":
        ids = [item.producto_id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("No se puede repetir el mismo producto en un pedido.")
        return self

#Detalle de pedido devuelto en la respuesta, nombre de producto, cantidad, precio y subtotal
class DetallePedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float

#presentación completa de un pedido
class PedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []

#Respuesta paginada para el listado de pedidos
class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]

#payload para avanzar o cancelar un pedido como administrador
class CambioEstado(SQLModel):
    estado: EstadoPedidoType

# indicadores del panel de administración
class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float