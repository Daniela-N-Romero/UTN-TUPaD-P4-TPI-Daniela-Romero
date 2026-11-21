from app.core.database import get_session
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from fastapi import Depends
from sqlmodel import Session


class CategoriaUnitOfWork(UnitOfWork):
    """
    Unit of Work específico para el módulo de Categorías.
    """
    def __init__(self, session: Session) -> None:
        super().__init__(session)
        self.categorias = CategoriaRepository(session)
        
def get_categoria_uow(session: Session = Depends(get_session)) -> CategoriaUnitOfWork:  # noqa: B008
    return CategoriaUnitOfWork(session)