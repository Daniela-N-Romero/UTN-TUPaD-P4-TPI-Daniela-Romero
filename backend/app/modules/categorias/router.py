from typing import Annotated

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)
from fastapi import APIRouter, Depends, HTTPException, Response, status

router = APIRouter(prefix="/categorias", tags=["Categorias"])


# ----------------- RUTAS PÚBLICAS ---------------------

@router.get("/", response_model=list[CategoriaRead])
def listar_categorias(
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> list[CategoriaRead]:
    return service.listar_activas()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> CategoriaRead:
    try:
        return service.obtener_por_id(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc


# ----------------- RUTAS ADMIN ---------------------

@router.post(
    "/",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
    categoria_in: CategoriaCreate,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> CategoriaRead:
    try:
        return service.crear(categoria_in)
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc),
        ) from exc


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
    categoria_id: int,
    categoria_in: CategoriaUpdate,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, categoria_in)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,  detail=str(exc),
        ) from exc
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc),
        ) from exc


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_categoria(
    categoria_id: int,
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> Response:
    try:
        service.baja_logica(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)