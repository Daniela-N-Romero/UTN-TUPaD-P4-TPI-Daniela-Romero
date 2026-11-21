from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field
from sqlmodel import SQLModel

RoleType = Literal["user", "admin"]

class UserBase(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserPublic(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    disabled: bool
    created_at: datetime