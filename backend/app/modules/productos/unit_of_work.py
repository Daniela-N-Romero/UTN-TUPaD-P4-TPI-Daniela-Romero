from app.core.database import get_session
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository
from fastapi import Depends
from sqlmodel import Session


class ProductoUnitOfWork(UnitOfWork):
    """
    Unit of Work específico para el módulo de Productos.
    """
    def __init__(self, session: Session) -> None:
        super().__init__(session)
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
        
def get_producto_uow(
    session: Session = Depends(get_session),  # noqa: B008
) -> ProductoUnitOfWork:
    return ProductoUnitOfWork(session)