from typing import Annotated

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService, get_usuario_service
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de Usuarios"])


@router.get(
    "/",
    response_model=list[UserPublic],
    dependencies=[Depends(require_role(["admin"]))],
)
def listar_usuarios(
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> list[UserPublic]:
    return service.listar_usuarios()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
    dependencies=[Depends(require_role(["admin"]))],
)
def activar_usuario(
    usuario_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> UserPublic:
    assert current_user.id is not None
    return service.cambiar_estado(
        usuario_id=usuario_id,
        disabled=False,
        current_user_id=current_user.id,
    )


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    dependencies=[Depends(require_role(["admin"]))],
)
def desactivar_usuario(
    usuario_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> UserPublic:
    assert current_user.id is not None
    return service.cambiar_estado(
        usuario_id=usuario_id,
        disabled=True,
        current_user_id=current_user.id,
    )