# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador — **Programación 4** (UTN TUPaD)  
Aplicación web full-stack compuesta por un backend en **FastAPI + SQLModel** (PostgreSQL) y un frontend en **React + TypeScript + Vite + Tailwind CSS**.

- **Repositorio:** `https://github.com/Daniela-N-Romero/UTN-TUPaD-P4-TPI-Daniela-Romero.git` 
- **Video de demostración:** `https://...` TODO : subir video

---

## Requisitos

### Backend
- **Python** 3.11 a 3.13
- **PostgreSQL** 15 o superior

### Frontend
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior

---

## Variables de entorno

### Backend (`backend/.env.example` → `backend/.env`)

| Variable | Descripción | Ejemplo |
| :--- | :----- | :--- |
| `POSTGRES_USER` | Usuario para la cadena de conexión a PostgreSQL | `POSTGRES_USER=juan123`
| `POSTGRES_PASSWORD` | Contraseña para la cadena de conexión a PostgreSQL | `POSTGRES_PASSWORD=12345678`
| `POSTGRES_DB` | Nombre para la cadena de conexión a PostgreSQL | `POSTGRES_DB=foodstore_TPI`
| `POSTGRES_HOST` | Host para la cadena de conexión a PostgreSQL | `POSTGRES_HOST=localhost`
| `POSTGRES_PORT` | Puerto para la cadena de conexión a PostgreSQL | `POSTGRES_PORT=5432`
| `SECRET_KEY` | Clave secreta para firmar JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres`
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256`|
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración en minutos de la cookie/token | `30`|
| `FRONTEND_ORIGIN` | Origen permitido para CORS con credenciales| `http://localhost:5173`


### Frontend (`frontend/.env.example` → `frontend/.env`)

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base de la API REST bajo `/api/v1` | `http://localhost:8000/api/v1` |

---


## Instalación y Ejecución del Backend

1. **Crear y activar el entorno virtual e instalar dependencias:**
   ```powershell
   cd backend
   python -m venv .venv
   
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate


   pip install -r requirements.txt
   ```
2. Copiar `backend/.env.example` a `backend/.env` y configurar las variables de entorno (asegurándose de que exista la base de datos en PostgreSQL).

3. **Ejecutar el seed idempotente:** crea el usuario administrador, categorías iniciales y productos con stock**
   ```powershell
   python -m app.db.seed
   ```

4. **Ejecutar el servidor de desarrollo** (compatible tanto con **Uvicorn** como con **FastAPI CLI**):
   NOTA: recorda **crear la base de datos antes** para que no de error de conexión. 
   ```powershell
   uvicorn app.main:app --reload
   ```
   o bien:
   ```powershell
   fastapi dev app/main.py
   ```
   La API quedará disponible en `http://127.0.0.1:8000` y la documentación interactiva en `http://127.0.0.1:8000/docs`.

---

### Pruebas automatizadas (opcional)

Las pruebas corren con pytest utilizando SQLite en memoria mediante dependency_overrides, sin modificar la base de datos PostgreSQL:
   ```powershell
   cd backend

   python -m pytest
   ```

---

### Credenciales Iniciales: Usuario administrador (seed)

Al ejecutar python -m app.db.seed se crea el usuario administrador por defecto:
- Usuario (username): admin
- Email: admin@foodstore.com
- Contraseña: Admin1234!
- Rol: admin

---

## Instalación y ejecución del frontend

1. Copiar `frontend/.env.example` a `frontend/.env` con VITE_API_URL=http://localhost:8000/api/v1.   
2. Instalar dependencias, verificar compilación de tipos y arrancar el servidor de desarrollo:
   ```powershell
   cd frontend
   pnpm install
   pnpm build
   pnpm dev
   ```