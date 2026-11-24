from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from sqlmodel import Session, select

CATEGORIAS_INICIALES: list[dict[str, str]] = [
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales y combos"},
    {"nombre": "Pizzas y Empanadas", "descripcion": "Pizzas al molde y empanadas"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y jugos"},
    {"nombre": "Postres", "descripcion": "Postres y opciones dulces"},
]

PRODUCTOS_INICIALES: list[dict] = [
    {
        "categoria_nombre": "Hamburguesas",
        "nombre": "Hamburguesa Clásica",
        "descripcion": "Medallón de carne, lechuga, tomate y aderezo de la casa",
        "precio_base": 4500.0,
        "imagen_url": "/images/hamburguesa-clasica.webp",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Hamburguesas",
        "nombre": "Doble Cheddar y Bacon",
        "descripcion": "Doble carne, doble cheddar y panceta crocante",
        "precio_base": 5800.0,
        "imagen_url": "/images/doble-cheddar-bacon.webp",
        "stock": 15,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Hamburguesas",
        "nombre": "Veggie Mediterránea",
        "descripcion": "Medallón vegetal, rúcula, tomates secos y queso",
        "precio_base": 4700.0,
        "imagen_url": "/images/veggie-mediterranea.webp",
        "stock": 12,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Pizzas y Empanadas",
        "nombre": "Pizza Muzzarella",
        "descripcion": "Salsa de tomate, muzzarella y orégano",
        "precio_base": 6200.0,
        "imagen_url": "/images/pizza-muzzarella.webp",
        "stock": 18,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Pizzas y Empanadas",
        "nombre": "Empanadas de Carne x6",
        "descripcion": "Seis empanadas de carne cortada a cuchillo",
        "precio_base": 5400.0,
        "imagen_url": "/images/empanadas-carne.webp",
        "stock": 25,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Pizzas y Empanadas",
        "nombre": "Empanadas JyQ x6",
        "descripcion": "Seis empanadas de jamón y queso horneadas",
        "precio_base": 5100.0,
        "imagen_url": "/images/empanadas-jyq.webp",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Bebidas",
        "nombre": "Gaseosa Cola 500ml",
        "descripcion": "Botella fría de 500ml",
        "precio_base": 1500.0,
        "imagen_url": "/images/gaseosa-cola.webp",
        "stock": 40,
        "disponible": True,
        "activo": True,
    },
    {
        "categoria_nombre": "Postres",
        "nombre": "Flan Casero con Dulce de Leche",
        "descripcion": "Porción individual con dulce de leche y crema",
        "precio_base": 2600.0,
        "imagen_url": "/images/flan-casero.webp",
        "stock": 14,
        "disponible": True,
        "activo": True,
    },
]


## SEED DE USUARIO ADMIN


def _seed_admin(session: Session) -> None:
    admin_existente = session.exec(
        select(Usuario).where(Usuario.username == "admin")
    ).first()
    if not admin_existente:
        admin = Usuario(
            username="admin",
            full_name="Administrador Food Store",
            email="admin@foodstore.com",
            hashed_password=hash_password("Admin1234!"),
            role="admin",
            disabled=False,
        )
        session.add(admin)
        session.commit()



## SEED DE PRODUCTOS Y CATEGORIAS 

def _seed_categorias(session: Session) -> dict[str, Categoria]:
    categorias_map: dict[str, Categoria] = {}
    hubo_cambios = False

    for item in CATEGORIAS_INICIALES:
        existente = session.exec(
            select(Categoria).where(Categoria.nombre == item["nombre"])
        ).first()
        if not existente:
            existente = Categoria(
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                activo=True,
            )
            session.add(existente)
            hubo_cambios = True
        categorias_map[item["nombre"]] = existente

    if hubo_cambios:
        session.commit()
        for nombre, cat in categorias_map.items():
            session.refresh(cat)
            categorias_map[nombre] = cat

    return categorias_map

def _seed_productos(session: Session, categorias_map: dict[str, Categoria]) -> None:
    hubo_cambios = False

    for item in PRODUCTOS_INICIALES:
        existente = session.exec(
            select(Producto).where(Producto.nombre == item["nombre"])
        ).first()
        categoria = categorias_map.get(item["categoria_nombre"])
        if not existente and categoria and categoria.id is not None:
            producto = Producto(
                categoria_id=categoria.id,
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                precio_base=item["precio_base"],
                imagen_url=item["imagen_url"],
                stock=item["stock"],
                disponible=item["disponible"],
                activo=item["activo"],
            )
            session.add(producto)
            hubo_cambios = True

    if hubo_cambios:
        session.commit()


def ejecutar_seed(session: Session) -> None:
    _seed_admin(session)
    categorias_map = _seed_categorias(session)
    _seed_productos(session, categorias_map)


if __name__ == "__main__":
    from app.core.database import create_all_tables, engine

    create_all_tables()
    with Session(engine) as db_session:
        ejecutar_seed(db_session)