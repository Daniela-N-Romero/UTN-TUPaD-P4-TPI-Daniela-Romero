from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.modules.categorias.models as categoria_models  # noqa
import app.modules.pedidos.models as pedido_models  # noqa
import app.modules.productos.models as producto_models  # noqa
import app.modules.usuarios.models as usuarios_models  # noqa
from app.core.config import settings
from app.core.database import create_all_tables, get_session
from app.db.seed import ejecutar_seed
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Evento que se ejecuta al iniciar la app para crear las tablas
@app.on_event("startup")
def on_startup():
    create_all_tables()
    with next(get_session()) as session:
        ejecutar_seed(session)

API_PREFIX = "/api/v1"

# Incluimos las rutas de categorías
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(auth_router, prefix=API_PREFIX)

@app.get("/")
def read_root():
    return {"message": "Food Store API funcionando"}