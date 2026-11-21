from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria
from sqlmodel import Session, select


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)
        
    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_activas(self, offset: int = 0, limit: int = 100) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True) 
            .order_by(Categoria.id)
            .offset(offset)
            .limit(limit)
        )
        return self.session.exec(statement).all()

    def get_activa_by_id(self, categoria_id: int) -> Categoria | None:
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,  
        )
        return self.session.exec(statement).first()