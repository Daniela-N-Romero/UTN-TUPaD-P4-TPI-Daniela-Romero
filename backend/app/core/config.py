from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Obtiene la ruta de la carpeta actual (app/core) y sube dos niveles para llegar a backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str  # Obligatoria: se lee de .env
    VERSION: str
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ─── Base de datos (PostgreSQL) ──────────────────────────────────────────
    postgres_user: str = "postgres"
    postgres_password: str  # Obligatoria: se lee de .env
    postgres_db: str = "foodstore_u9"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    
    @property
    def DATABASE_URL(self) -> str:
        """
        Construye la URL de conexión a PostgreSQL sin exponer la contraseña
        """
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
    

    # ─── JWT ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str = Field(min_length=32)  # Obligatoria, sin valor por defecto
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
settings = Settings()