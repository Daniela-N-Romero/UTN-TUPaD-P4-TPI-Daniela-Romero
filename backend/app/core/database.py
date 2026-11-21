from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Creamos el motor utilizando la URL configurada centralizadamente
engine = create_engine(settings.DATABASE_URL)

def create_all_tables():
    import app.modules.categorias.models  # noqa: F401, RUF100
    import app.modules.pedidos.models  # noqa: F401, RUF100
    import app.modules.productos.models  # noqa: F401, RUF100
    import app.modules.usuarios.models  # noqa: F401 
    SQLModel.metadata.create_all(engine)
    
def session_factory() -> Session:
    return Session(engine)


def get_session():
    with session_factory() as session:
        yield session