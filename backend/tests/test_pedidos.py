from app.core.security import hash_password
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from fastapi.testclient import TestClient
from sqlmodel import Session, select


def _crear_usuario_en_bd(
    session: Session,
    username: str,
    email: str,
    password: str = "Password123!",
    role: str = "user",
) -> tuple[int, str, str]:
    usuario = Usuario(
        username=username,
        full_name=f"Usuario {username}",
        email=email,
        hashed_password=hash_password(password),
        role=role,
        disabled=False,
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    assert usuario.id is not None
    return usuario.id, usuario.username, password


def _login(client: TestClient, username: str, password: str) -> None:
    client.cookies.clear()
    res = client.post(
        "/api/v1/auth/token",
        data={"username": username, "password": password},
    )
    assert res.status_code == 200, res.json()


def _obtener_producto_base(session: Session, nombre: str) -> tuple[int, int, float]:
    producto = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
    assert producto is not None
    assert producto.id is not None
    return producto.id, producto.stock, float(producto.precio_base)


def test_crear_pedido_descuenta_stock_y_copia_datos(
    client: TestClient, session: Session
) -> None:
    # El seed ya cargó categorías y productos con stock
    prod_1_id, stock_1_antes, precio_1 = _obtener_producto_base(
        session, "Hamburguesa Clásica"
    )
    prod_2_id, stock_2_antes, precio_2 = _obtener_producto_base(
        session, "Gaseosa Cola 500ml"
    )

    _, user_name, user_pass = _crear_usuario_en_bd(
        session, "comprador1", "comprador1@foodstore.com", role="user"
    )
    _login(client, user_name, user_pass)

    payload = {
        "forma_pago": "EFECTIVO",
        "direccion_entrega": "Calle Falsa 123, Berazategui",
        "notas": "Sin cebolla en la hamburguesa",
        "items": [
            {"producto_id": prod_1_id, "cantidad": 2},
            {"producto_id": prod_2_id, "cantidad": 3},
        ],
    }

    res = client.post("/api/v1/pedidos", json=payload)
    assert res.status_code == 201, res.json()
    data = res.json()

    subtotal_1 = precio_1 * 2
    subtotal_2 = precio_2 * 3
    total_esperado = subtotal_1 + subtotal_2

    assert data["estado"] == "PENDIENTE"
    assert data["forma_pago"] == "EFECTIVO"
    assert data["direccion_entrega"] == "Calle Falsa 123, Berazategui"
    assert data["total"] == total_esperado
    assert len(data["items"]) == 2

    items_por_prod = {item["producto_id"]: item for item in data["items"]}
    assert items_por_prod[prod_1_id]["nombre_producto"] == "Hamburguesa Clásica"
    assert items_por_prod[prod_1_id]["precio_unitario"] == precio_1
    assert items_por_prod[prod_1_id]["subtotal"] == subtotal_1
    assert items_por_prod[prod_2_id]["subtotal"] == subtotal_2

    # Verificar que el stock se descontó en la base 
    session.expire_all()
    p1 = session.get(Producto, prod_1_id)
    p2 = session.get(Producto, prod_2_id)
    assert p1 is not None and p1.stock == stock_1_antes - 2
    assert p2 is not None and p2.stock == stock_2_antes - 3


def test_crear_pedido_rechaza_repetidos_sin_stock_o_invalido(
    client: TestClient, session: Session
) -> None:
    prod_id, stock_actual, _ = _obtener_producto_base(session, "Pizza Muzzarella")
    _, user_name, user_pass = _crear_usuario_en_bd(
        session, "comprador2", "comprador2@foodstore.com", role="user"
    )
    _login(client, user_name, user_pass)

    # 1. Producto repetido en items -> 400 
    res_repetido = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "TRANSFERENCIA",
            "direccion_entrega": "Av. Mitre 450, Quilmes",
            "items": [
                {"producto_id": prod_id, "cantidad": 1},
                {"producto_id": prod_id, "cantidad": 2},
            ],
        },
    )
    assert res_repetido.status_code == 422

    # 2. Stock insuficiente -> 400 y sin descontar stock 
    res_sin_stock = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "EFECTIVO",
            "direccion_entrega": "Av. Mitre 450, Quilmes",
            "items": [{"producto_id": prod_id, "cantidad": stock_actual + 50}],
        },
    )
    assert res_sin_stock.status_code == 400

    session.expire_all()
    p_check = session.get(Producto, prod_id)
    assert p_check is not None and p_check.stock == stock_actual

    # 3. Producto inexistente -> 404
    res_no_existe = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "EFECTIVO",
            "direccion_entrega": "Av. Mitre 450, Quilmes",
            "items": [{"producto_id": 999999, "cantidad": 1}],
        },
    )
    assert res_no_existe.status_code == 404

    # 4. Validación de schema (sin ítems o dirección muy corta) -> 422 
    res_vacio = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "EFECTIVO",
            "direccion_entrega": "abc",
            "items": [],
        },
    )
    assert res_vacio.status_code == 422


def test_permisos_dueno_y_cancelacion_restituye_stock(
    client: TestClient, session: Session
) -> None:
    prod_id, stock_inicial, _ = _obtener_producto_base(session, "Empanadas de Carne x6")

    _, user_a_name, user_a_pass = _crear_usuario_en_bd(
        session, "dueno_pedido", "dueno@foodstore.com", role="user"
    )
    _, user_b_name, user_b_pass = _crear_usuario_en_bd(
        session, "otro_usuario", "otro@foodstore.com", role="user"
    )

    # Usuario A crea un pedido de 4 unidades en PENDIENTE
    _login(client, user_a_name, user_a_pass)
    res_crear = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "EFECTIVO",
            "direccion_entrega": "Calle 14 nro 220, Berazategui",
            "items": [{"producto_id": prod_id, "cantidad": 4}],
        },
    )
    assert res_crear.status_code == 201, res_crear.json()
    pedido_id = res_crear.json()["id"]

    # Usuario B no puede ver ni cancelar el pedido ajeno -> 403 
    _login(client, user_b_name, user_b_pass)
    assert client.get(f"/api/v1/pedidos/{pedido_id}").status_code == 403
    assert client.patch(f"/api/v1/pedidos/{pedido_id}/cancelar").status_code == 403

    # Usuario A cancela su propio pedido en PENDIENTE -> 200 y restituye stock
    _login(client, user_a_name, user_a_pass)
    res_cancel = client.patch(f"/api/v1/pedidos/{pedido_id}/cancelar")
    assert res_cancel.status_code == 200, res_cancel.json()
    assert res_cancel.json()["estado"] == "CANCELADO"

    session.expire_all()
    prod_despues = session.get(Producto, prod_id)
    assert prod_despues is not None and prod_despues.stock == stock_inicial


def test_maquina_de_estados_y_resumen_admin(
    client: TestClient, session: Session
) -> None:
    prod_id, _, _ = _obtener_producto_base(session, "Flan Casero con Dulce de Leche")

    _, user_name, user_pass = _crear_usuario_en_bd(
        session, "cliente_flan", "flan@foodstore.com", role="user"
    )
    _, admin_name, admin_pass = _crear_usuario_en_bd(
        session, "admin_pedidos", "admin_pedidos@foodstore.com", role="admin"
    )

    _login(client, user_name, user_pass)
    res_pedido = client.post(
        "/api/v1/pedidos",
        json={
            "forma_pago": "TRANSFERENCIA",
            "direccion_entrega": "Lisandro de la Torre 800, Hudson",
            "items": [{"producto_id": prod_id, "cantidad": 2}],
        },
    )
    assert res_pedido.status_code == 201, res_pedido.json()
    pedido_id = res_pedido.json()["id"]

    # Un usuario común no puede cambiar estado ni ver /pedidos/resumen -> 403
    assert (
        client.patch(
            f"/api/v1/pedidos/{pedido_id}/estado",
            json={"estado": "EN_PREPARACION"},
        ).status_code
        == 403
    )
    assert client.get("/api/v1/pedidos/resumen").status_code == 403

    # Admin avanza PENDIENTE -> EN_PREPARACION -> ENTREGADO 
    _login(client, admin_name, admin_pass)
    res_prep = client.patch(
        f"/api/v1/pedidos/{pedido_id}/estado",
        json={"estado": "EN_PREPARACION"},
    )
    assert res_prep.status_code == 200, res_prep.json()
    assert res_prep.json()["estado"] == "EN_PREPARACION"

    # Salto inválido PENDIENTE/EN_PREPARACION directo a ENTREGADO? No, EN_PREPARACION -> ENTREGADO es válido;
    # pero una vez ENTREGADO (estado terminal), no admite más transiciones -> 400
    res_entregado = client.patch(
        f"/api/v1/pedidos/{pedido_id}/estado",
        json={"estado": "ENTREGADO"},
    )
    assert res_entregado.status_code == 200, res_entregado.json()
    assert res_entregado.json()["estado"] == "ENTREGADO"

    res_invalida = client.patch(
        f"/api/v1/pedidos/{pedido_id}/estado",
        json={"estado": "CANCELADO"},
    )
    assert res_invalida.status_code == 400

    # Resumen del panel para admin
    res_resumen = client.get("/api/v1/pedidos/resumen")
    assert res_resumen.status_code == 200, res_resumen.json()
    resumen = res_resumen.json()
    assert resumen["entregados"] >= 1
    assert resumen["ingresos_entregados"] >= res_pedido.json()["total"]