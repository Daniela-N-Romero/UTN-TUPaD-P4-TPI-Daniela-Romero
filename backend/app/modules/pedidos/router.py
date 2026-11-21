from typing import Annotated

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
    get_pedido_service,
)
from app.modules.usuarios.models import Usuario
from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    assert current_user.id is not None
    try:
        return service.crear_pedido(data, usuario_id=current_user.id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get("/", response_model=PedidosPaginados)
def listar_pedidos(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Annotated[str | None, Query()] = None,
) -> PedidosPaginados:
    assert current_user.id is not None
    return service.listar_pedidos(
        usuario_id=current_user.id,
        rol=current_user.role,  ## segun el rol listara solo los del usuario o todos si es admin
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    dependencies=[Depends(require_role(["admin"]))],
)
def obtener_resumen_pedidos(
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> ResumenPedidos:
    return service.obtener_resumen() 


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    assert current_user.id is not None
    try:
        return service.obtener_por_id(
            pedido_id, usuario_id=current_user.id, rol=current_user.role
        )
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    try:
        return service.cambiar_estado_admin(pedido_id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    assert current_user.id is not None
    try:
        return service.cancelar_propio(pedido_id, usuario_id=current_user.id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc