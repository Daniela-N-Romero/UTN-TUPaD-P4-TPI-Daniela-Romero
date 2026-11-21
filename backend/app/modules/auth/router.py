from typing import Annotated

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import LoginMessage, UserCreate, UserPublic
from app.modules.auth.service import AuthService, get_auth_service
from app.modules.usuarios.models import Usuario
from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_in: UserCreate,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserPublic:
    return service.registrar(user_in)


@router.post("/token", response_model=LoginMessage)
def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> LoginMessage:
    token, _ = service.autenticar(
        identifier=form_data.username,
        password=form_data.password,
    )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    return LoginMessage(message="Login exitoso")


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserPublic)
def read_me(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
) -> UserPublic:
    return UserPublic.model_validate(current_user)