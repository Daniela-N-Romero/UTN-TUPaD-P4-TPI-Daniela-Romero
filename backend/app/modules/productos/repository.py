from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto
from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)
    
    def get_activo_by_id(self, producto_id: int) -> Producto | None:
        statement = (
            select(Producto)
            .where(
                Producto.id == producto_id,
                Producto.activo == True,
            )
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()

    def search(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        
        # Restricción base: los listados públicos solo muestran productos activos
        base_filter = [Producto.activo == True] 
        
        # Filtro opcional por texto sobre el nombre, sin distinguir mayúsculas/minúsculas (ILIKE)
        if search:
            base_filter.append(Producto.nombre.ilike(f"%{search.strip()}%"))
            
        # Filtro opcional por categoría    
        if categoria_id is not None:
            base_filter.append(Producto.categoria_id == categoria_id)
            
        # Filtro opcional por disponibilidad    
        if disponible is not None:
            base_filter.append(Producto.disponible == disponible)

        # Consulta de conteo total con los mismos filtros (necesaria para devolver { "total": N, "items": [...] })
        count_stmt = select(func.count()).select_from(Producto).where(*base_filter) # desempaquetamos los filtros
        total = int(self.session.exec(count_stmt).one())

        # Consulta paginada de los ítems, precargando `categoria` para armar `ProductoRead`
        items_stmt = (
            select(Producto)
            .where(*base_filter)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        
        # Retorna total y los items paginados para que el service construya `ProductosPaginados`
        return total, items