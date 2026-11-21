from typing import Annotated

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork, get_usuario_uow
from fastapi import Depends, HTTPException, status


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, user_in: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(user_in.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )
            if uow.usuarios.get_by_email(user_in.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            nuevo_usuario = Usuario(
                username=user_in.username,
                full_name=user_in.full_name,
                email=user_in.email,
                hashed_password=hash_password(user_in.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def autenticar(self, identifier: str, password: str) -> tuple[str, UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(identifier)
            if usuario is None:
                usuario = uow.usuarios.get_by_email(identifier)

            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            token = create_access_token(data={"sub": usuario.username})
            return token, UserPublic.model_validate(usuario)


def get_auth_service(
    uow: Annotated[UsuarioUnitOfWork, Depends(get_usuario_uow)],
) -> AuthService:
    return AuthService(uow)