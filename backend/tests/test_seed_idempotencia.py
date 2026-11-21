from app.db.seed import ejecutar_seed
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from sqlmodel import Session, func, select


def test_seed_es_idempotente(session: Session) -> None:
    # La fixture `session` ya ejecutó el seed una vez; contamos lo insertado inicialmente
    usuarios_antes = session.exec(select(func.count()).select_from(Usuario)).one()
    categorias_antes = session.exec(select(func.count()).select_from(Categoria)).one()
    productos_antes = session.exec(select(func.count()).select_from(Producto)).one()

    # Comprobamos mínimos esperados (al menos 1 admin, >= 3 categorías, >= 8 productos)
    assert usuarios_antes >= 1
    assert categorias_antes >= 3
    assert productos_antes >= 8

    # Ejecutamos el seed nuevamente sobre la misma base
    ejecutar_seed(session)
    session.commit()

    # Verificamos que los totales no se duplicaron
    usuarios_despues = session.exec(select(func.count()).select_from(Usuario)).one()
    categorias_despues = session.exec(select(func.count()).select_from(Categoria)).one()
    productos_despues = session.exec(select(func.count()).select_from(Producto)).one()

    assert usuarios_despues == usuarios_antes
    assert categorias_despues == categorias_antes
    assert productos_despues == productos_antes

    # Verificamos que el usuario admin siga existiendo una sola vez con rol "admin"
    admins = session.exec(select(Usuario).where(Usuario.username == "admin")).all()
    assert len(admins) == 1
    assert admins[0].role == "admin"
    assert admins[0].disabled is False