from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from fastapi.testclient import TestClient
from sqlmodel import Session


def _crear_admin_en_bd(session: Session, username: str = "admin_test", password: str = "Admin1234!") -> Usuario:
    admin = Usuario(
        username=username,
        full_name="Admin Test",
        email="admin@foodstore.local",
        hashed_password=hash_password(password),
        role="admin",
        disabled=False,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def test_registro_login_cookie_me_y_logout(client: TestClient) -> None:
    # 1. Registro con rol por defecto "user" -> 201
    res_registro = client.post(
        "/api/v1/auth/register",
        json={
            "username": "cliente1",
            "full_name": "Cliente Uno",
            "email": "cliente1@foodstore.local",
            "password": "Password123!",
        },
    )
    assert res_registro.status_code == 201
    data_registro = res_registro.json()
    assert data_registro["role"] == "user"
    assert data_registro["disabled"] is False

    # 2. Duplicado -> 409
    res_dup = client.post(
        "/api/v1/auth/register",
        json={
            "username": "cliente1",
            "full_name": "Cliente Duplicado",
            "email": "otro@foodstore.local",
            "password": "Password123!",
        },
    )
    assert res_dup.status_code == 409

    # 3. Login con OAuth2 form -> cookie HttpOnly, sin token en body
    res_login = client.post(
        "/api/v1/auth/token",
        data={"username": "cliente1", "password": "Password123!"},
    )
    assert res_login.status_code == 200
    assert res_login.json() == {"message": "Login exitoso"}
    assert "access_token" in client.cookies

    # 4. /auth/me autenticado
    res_me = client.get("/api/v1/auth/me")
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "cliente1"

    # 5. Logout borra la cookie
    res_logout = client.post("/api/v1/auth/logout")
    assert res_logout.status_code == 200
    assert "access_token" not in client.cookies


def test_401_sin_sesion_y_403_rol_user_en_admin(client: TestClient) -> None:
    # Sin cookie -> 401
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/admin/usuarios").status_code == 401

    # Registrar y loguear usuario "user"
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "user_comun",
            "full_name": "Usuario Comun",
            "email": "comun@foodstore.local",
            "password": "Password123!",
        },
    )
    client.post(
        "/api/v1/auth/token",
        data={"username": "user_comun", "password": "Password123!"},
    )

    # Rol "user" en ruta de "admin" -> 403
    res_forbidden = client.get("/api/v1/admin/usuarios")
    assert res_forbidden.status_code == 403


def test_admin_desactiva_usuario_idempotencia_y_bloqueo_auto_desactivacion(
    client: TestClient, session: Session
) -> None:
    admin = _crear_admin_en_bd(session)

    # Registrar usuario a gestionar
    res_user = client.post(
        "/api/v1/auth/register",
        json={
            "username": "a_desactivar",
            "full_name": "A Desactivar",
            "email": "desactivar@foodstore.local",
            "password": "Password123!",
        },
    )
    user_id = res_user.json()["id"]

    # Login como admin
    res_admin_login = client.post(
        "/api/v1/auth/token",
        data={"username": admin.username, "password": "Admin1234!"},
    )
    assert res_admin_login.status_code == 200

    # Admin no puede desactivarse a sí mismo -> 400
    assert admin.id is not None
    res_self = client.post(f"/api/v1/admin/usuarios/{admin.id}/desactivar")
    assert res_self.status_code == 400

    # Desactivar dos veces (idempotencia -> 200)
    assert client.post(f"/api/v1/admin/usuarios/{user_id}/desactivar").status_code == 200
    res_desact_2 = client.post(f"/api/v1/admin/usuarios/{user_id}/desactivar")
    assert res_desact_2.status_code == 200
    assert res_desact_2.json()["disabled"] is True

    # Limpiar cookies para probar login de usuario desactivado
    client.cookies.clear()
    res_login_disabled = client.post(
        "/api/v1/auth/token",
        data={"username": "a_desactivar", "password": "Password123!"},
    )
    assert res_login_disabled.status_code == 400
    assert res_login_disabled.json()["detail"] == "Cuenta de usuario desactivada"

    # Re-login admin y activar dos veces (idempotencia -> 200)
    client.post(
        "/api/v1/auth/token",
        data={"username": admin.username, "password": "Admin1234!"},
    )
    assert client.post(f"/api/v1/admin/usuarios/{user_id}/activar").status_code == 200
    res_act_2 = client.post(f"/api/v1/admin/usuarios/{user_id}/activar")
    assert res_act_2.status_code == 200
    assert res_act_2.json()["disabled"] is False