"""
Utilidades de seguridad centralizadas.

Responsabilidades:
- Hashing de contraseñas usando bcrypt (a través de passlib)
- Generación y validación de JWT (firma HS256 con python-jose)

"""

# Manejo de fechas para expiración de tokens (con zona horaria UTC)
from datetime import datetime, timedelta, timezone

# Librería para JWT (encode/decode + manejo de errores)
from jose import JWTError, jwt

# Contexto de hashing (abstracción sobre bcrypt)
from passlib.context import CryptContext

# Configuración central (SECRET_KEY, ALGORITHM, expiración, etc.)
from app.core.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# -------------- HASHING DE CONTRASEÑAS (bcrypt)------------------------
# ─────────────────────────────────────────────────────────────────────────────

# Configura el contexto de hashing:
# - "bcrypt" → algoritmo seguro para contraseñas
# - deprecated="auto" → permite migraciones futuras de algoritmo
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """ Recibe una contraseña en texto plano y devuelve su hash bcrypt.    """
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con un hash. """
    return pwd_context.verify(plain, hashed)


# ─────────────────────────────────────────────────────────────────────────────
# JWT (JSON Web Tokens)
# ─────────────────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """ Genera un JWT firmado (HS256).
    
    Parámetros:
    - data: payload base (ej: {"sub": user.email, "role": role})
    - expires_delta: override opcional del tiempo de expiración

    Retorna: Token JWT firmado (string) """

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Agrega claims al payload
    to_encode.update({
        "type": "access", # distingue el access token de un futuro refresh token
        "exp": expire     # claim estándar JWT
    })

    # Firma el token:
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """ Decodifica y valida un JWT.

    - dict → payload válido
    - None → token inválido (cualquier error)

    """

    try:
        # Decodifica y valida firma + exp
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Rechaza tokens que no sean de acceso
        if payload.get("type") != "access":
            return None

        return payload

    except JWTError:
        # Cualquier problema (firma, expiración, formato, etc.)
        return None