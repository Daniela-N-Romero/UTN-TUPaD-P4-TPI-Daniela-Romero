from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


# Esquema base con campos comunes
class CategoriaBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str

# Esquema para la creación (POST)
class CategoriaCreate(CategoriaBase):
    pass

# Esquema para la lectura/respuesta (GET) 
class CategoriaRead(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activo: bool

# Esquema para la actualización opcional (PUT / PATCH)
class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None
    activo: bool | None = None