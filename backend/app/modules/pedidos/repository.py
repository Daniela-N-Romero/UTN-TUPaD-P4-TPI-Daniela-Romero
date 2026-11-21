from datetime import datetime, timezone

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido
from sqlalchemy import selectinload
from sqlmodel import Session, func, select


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    ## PEDIDO CON SUS DETALLES
    def get_by_id_with_items(self, pedido_id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
        )
        return self.session.exec(statement).first()

    ## LISTADOS
    
    def list_by_usuario(  ##DEVUELVE EL LISTADO DE PEDIDOS DE UN USUARIO
        self,
        usuario_id: int,
        *,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        
         # filtro base: los listados públicos solo muestran pedidos del usuario
        filters = [Pedido.usuario_id == usuario_id]
        
        # Filtro opcional: se filtras por estado del pedido
        if estado:
            filters.append(Pedido.estado == estado)
            
        # Consulta de conteo total con los mismos filtros (necesaria para devolver { "total": N, "items": [...] })
        count_stmt = select(func.count()).select_from(Pedido).where(*filters)
        total = int(self.session.exec(count_stmt).one())

        # Consulta paginada de los ítems, precargando los detalles del pedido para armar `PedidoRead`
        items_stmt = (
            select(Pedido)
            .where(*filters)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        items = self.session.exec(items_stmt).all()
        return total, items

    def list_paginated( ## DEVUELVE TODOS LOS PEDIDOS (UTIL PARA ADMIN)
        self, 
        *,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        
        #lista de filtros inicial vacia
        filters = []
        
        #filtro de estado
        if estado:
            filters.append(Pedido.estado == estado)

        # Consulta paginada de los ítems, precargando `categoria` para armar `ProductoRead`
        count_stmt = select(func.count()).select_from(Pedido).where(*filters)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .where(*filters)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        items = self.session.exec(items_stmt).all()
        return total, items


    ## CONTEOS

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        rows = self.session.exec(statement).all()
        conteos = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado_codigo, cantidad in rows:
            conteos[str(estado_codigo)] = int(cantidad)
        return conteos

    def count_pedidos_hoy(self) -> int:
        hoy_utc = datetime.now(timezone.utc).date()
        inicio_dia = datetime(
            hoy_utc.year, hoy_utc.month, hoy_utc.day, tzinfo=timezone.utc
        )
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_dia)
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .select_from(Pedido)
            .where(Pedido.estado == "ENTREGADO")
        )
        return float(self.session.exec(statement).one())