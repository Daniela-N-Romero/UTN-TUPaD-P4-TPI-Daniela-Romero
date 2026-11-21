from collections.abc import Generator

import app.core.database as db_module
import app.main as main_module
import pytest
from app.core.database import get_session
from app.db.seed import ejecutar_seed
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture()
def test_engine():
    # Creamos un motor SQLite en memoria ("sqlite://") exclusivo para cada prueba.
    # - check_same_thread=False: permite que FastAPI / TestClient y el hilo de pytest compartan la conexión.
    # - StaticPool: mantiene viva la misma conexión en memoria durante todo el ciclo del test;
    #   sin esto, SQLite en memoria abriría bases vacías distintas en cada conexión.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Crea todas las tablas definidas en los modelos SQLModel sobre la BD de prueba en memoria
    SQLModel.metadata.create_all(engine)
    yield engine
    # Al terminar el test, limpia el esquema y cierra el pool de conexiones en memoria
    SQLModel.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture()
def session(test_engine, monkeypatch: pytest.MonkeyPatch) -> Generator[Session, None, None]:
    # Parcheamos `engine` y `get_session` en memoria (solo mientras dura este test) para que
    # la aplicación y su evento startup usen SQLite en memoria y NO toquen PostgreSQL.
    monkeypatch.setattr(db_module, "engine", test_engine)
    if hasattr(main_module, "engine"):
        monkeypatch.setattr(main_module, "engine", test_engine)

    def _get_test_session() -> Generator[Session, None, None]:
        with Session(test_engine) as db_session:
            yield db_session

    monkeypatch.setattr(db_module, "get_session", _get_test_session)
    if hasattr(main_module, "get_session"):
        monkeypatch.setattr(main_module, "get_session", _get_test_session)

    # Cargamos los datos iniciales (admin, categorías, productos) en la BD en memoria
    with Session(test_engine, expire_on_commit=False) as db_session:
        ejecutar_seed(db_session)
        db_session.commit()

    
    # Entregamos una sesión limpia para que el test consulte o inserte datos de prueba
    with Session(test_engine) as db_session:
        yield db_session


@pytest.fixture()
def client(session: Session) -> Generator[TestClient, None, None]:
    # Sobrescribimos la dependencia `get_session` de FastAPI para que todos los endpoints
    # trabajen sobre la misma sesión de prueba (y vean los mismos datos del test).
    def _override_get_session() -> Generator[Session, None, None]:
        yield session

    app.dependency_overrides[get_session] = _override_get_session
    # `with TestClient(app)` dispara el ciclo de vida/startup de la app usando el engine ya parcheado
    with TestClient(app) as test_client:
        yield test_client
    # Limpiamos los overrides al finalizar el test para no afectar otras pruebas
    app.dependency_overrides.clear()