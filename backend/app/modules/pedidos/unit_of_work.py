from app.core.database import get_session
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository
from fastapi import Depends
from sqlmodel import Session


class PedidoUnitOfWork(UnitOfWork):
    """Unit of Work específico para el módulo de Pedidos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session)
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)


def get_pedido_uow(session: Session = Depends(get_session)) -> PedidoUnitOfWork:  # noqa: B008
    return PedidoUnitOfWork(session)