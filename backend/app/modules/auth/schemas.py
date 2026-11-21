from app.modules.usuarios.schemas import UserCreate, UserPublic
from pydantic import BaseModel

__all__ = ["LoginMessage", "UserCreate", "UserPublic"]


class LoginMessage(BaseModel):
    message: str