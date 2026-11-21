from typing import Annotated

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork, get_usuario_uow
from fastapi import Depends, HTTPException, status


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all_usuarios()
            return [UserPublic.model_validate(u) for u in usuarios]

    def cambiar_estado(
        self,
        usuario_id: int,
        disabled: bool,
        current_user_id: int,
    ) -> UserPublic:
        if disabled and usuario_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés desactivar tu propio usuario",
            )

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            usuario.disabled = disabled
            uow._session.add(usuario)
            uow._session.flush()
            uow._session.refresh(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service(
    uow: Annotated[UsuarioUnitOfWork, Depends(get_usuario_uow)],
) -> UsuarioService:
    return UsuarioService(uow)