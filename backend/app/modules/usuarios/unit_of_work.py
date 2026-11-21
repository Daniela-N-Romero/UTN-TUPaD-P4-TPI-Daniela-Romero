from app.core.database import get_session
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository
from fastapi import Depends
from sqlmodel import Session


class UsuarioUnitOfWork(UnitOfWork):
    """
    Unit of Work específico para el módulo de Usuarios e Identidad & Acceso.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session)
        self.usuarios = UsuarioRepository(session)

def get_usuario_uow(session: Session = Depends(get_session)) -> UsuarioUnitOfWork:
    return UsuarioUnitOfWork(session)
