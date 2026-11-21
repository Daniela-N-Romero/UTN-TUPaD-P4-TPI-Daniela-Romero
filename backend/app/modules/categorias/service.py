from typing import Annotated

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork, get_categoria_uow
from fastapi import Depends

# ---------- EXCEPCIONES PERSONALIZADAS -------------

class CategoriaNoEncontrada(Exception):
    """Se lanza cuando una categoría activa no existe."""


class NombreDuplicado(Exception):
    """Se lanza cuando ya existe una categoría con el mismo nombre."""
    

# ---------- SERVICE CATEGORIAS -------------

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, categoria_in: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(categoria_in.nombre)
            if existente:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")

            nueva = Categoria(
                nombre=categoria_in.nombre,
                descripcion=categoria_in.descripcion,
                activo=True,
            )
            uow.categorias.add(nueva)
            uow._session.flush()
            uow._session.refresh(nueva)
            return CategoriaRead.model_validate(nueva)

    def actualizar(
        self, categoria_id: int, categoria_in: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            datos = categoria_in.model_dump(exclude_unset=True)
            if "nombre" in datos and datos["nombre"] != categoria.nombre:
                duplicada = uow.categorias.get_by_nombre(datos["nombre"])
                if duplicada and duplicada.id != categoria.id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")

            for campo, valor in datos.items():
                setattr(categoria, campo, valor)

            uow._session.add(categoria)
            uow._session.flush()
            uow._session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def baja_logica(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            categoria.activo = False
            uow._session.add(categoria)
            uow._session.flush()
            

def get_categoria_service(
    uow: Annotated[CategoriaUnitOfWork, Depends(get_categoria_uow)],
) -> CategoriaService:
    return CategoriaService(uow)