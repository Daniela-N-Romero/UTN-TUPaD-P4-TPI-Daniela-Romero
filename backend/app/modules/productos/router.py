from typing import Annotated

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
    get_producto_service,
)
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=ProductosPaginados)
def listar_productos(
    service: Annotated[ProductoService, Depends(get_producto_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query()] = None,
    categoria_id: Annotated[int | None, Query()] = None,
    disponible: Annotated[bool | None, Query()] = None,
) -> ProductosPaginados:
    return service.listar_activos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.obtener_por_id(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc


@router.post(
    "/",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
    producto_in: ProductoCreate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.crear(producto_in)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
    producto_id: int,
    producto_in: ProductoUpdate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, producto_in)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock_producto(
    producto_id: int,
    stock_in: ProductoStockUpdate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, stock_in)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_producto(
    producto_id: int,
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> Response:
    try:
        service.baja_logica(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc),
        ) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)