from app.modules.categorias.schemas import CategoriaRead
from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


# Esquema base con campos comunes
class ProductoBase(SQLModel):
    categoria_id: int
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0)
    imagen_url: str = Field(default="")
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)

# Esquema para la creación (POST)
class ProductoCreate(ProductoBase):
    pass

# Esquema para la actualización opcional (PUT / PATCH)
class ProductoUpdate(SQLModel):
    categoria_id: int | None = None
    nombre: str | None = Field(default=None, min_length=1, max_length=120)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    activo: bool | None = None

# schema acotado para no tener que mandar ProductoUpdate cuando el admin solo cambia stock o disponibilidad
class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool

# Esquema para la lectura/respuesta (GET)
class ProductoRead(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activo: bool
    categoria: CategoriaRead | None = None

# los listados paginados devuelven { "total": N, "items": [...] }
class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]