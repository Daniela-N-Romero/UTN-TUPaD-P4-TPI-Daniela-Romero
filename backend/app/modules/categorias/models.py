from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto

# Modelo de Base / Tabla
class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, nullable=False)
    descripcion: str = Field(default="", nullable=False)
    activo: bool = Field(default=True, nullable=False)

    productos: list["Producto"] = Relationship(back_populates="categoria")