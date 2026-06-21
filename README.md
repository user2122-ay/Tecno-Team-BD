# Tecno Team CTG — Plataforma de control de miembros

Web para que los coordinadores de cada subdivisión (Fotografía, Reportaje, Edición de
video, Diseño gráfico, y las que vayas creando) registren miembros, asistencia de los
sábados y actividades, mientras tú como administrador controlas quién entra y con qué rol.

## Estructura

```
tecno-team-app/
  backend/    -> API en Node/Express + MongoDB
  frontend/   -> React (Vite) + Tailwind
```

## Roles

- **admin**: sos vos. Asigna roles, crea subdivisiones, ve todo.
- **coordinador**: los profesores que coordinan todo el grupo. Ven y gestionan todas las
  subdivisiones.
- **coordinador_sub**: coordinador de una subdivisión específica. Solo puede añadir
  miembros, asistencia y actividades de SU subdivisión.
- **pendiente**: rol automático cuando alguien inicia sesión por primera vez. No puede
  hacer nada hasta que un admin le asigne un rol real desde "Usuarios y permisos".

## 1. Crear credenciales de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → crea un proyecto.
2. "APIs y servicios" → "Pantalla de consentimiento OAuth" → tipo **Externo**, llena los
   datos básicos (nombre de la app: Tecno Team CTG, tu correo).
3. "Credenciales" → "Crear credenciales" → **ID de cliente de OAuth** → tipo **Aplicación web**.
4. En "Orígenes de JavaScript autorizados" agrega:
   - `http://localhost:5173` (para probar local)
   - la URL de tu frontend en Railway cuando la tengas (ej. `https://tecnoteam.up.railway.app`)
5. Copia el **Client ID** generado — lo usas en AMBOS `.env` (backend y frontend).

## 2. Base de datos (MongoDB Atlas)

1. Crea un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Crea un usuario de base de datos y copia el connection string
   (`mongodb+srv://usuario:password@cluster.../tecnoteam`).
3. En "Network Access" agrega `0.0.0.0/0` para que Railway pueda conectarse.

## 3. Configurar variables de entorno

Copia `.env.example` a `.env` en cada carpeta y llena los valores:

**backend/.env**
- `MONGODB_URI` → el connection string de Atlas
- `GOOGLE_CLIENT_ID` → el Client ID de Google
- `JWT_SECRET` → cualquier cadena larga y aleatoria
- `FRONTEND_URL` → `http://localhost:5173` en local, luego la URL real del frontend
- `ADMIN_EMAIL` → **tu correo de Gmail**. La primera vez que inicies sesión con ese correo
  quedarás como `admin` automáticamente. Después, todos los demás entran como `pendiente`
  hasta que tú les asignes rol.

**frontend/.env**
- `VITE_API_URL` → `http://localhost:4000/api` en local, luego la URL real del backend + `/api`
- `VITE_GOOGLE_CLIENT_ID` → el mismo Client ID de Google

## 4. Probar en local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`, inicia sesión con tu cuenta de Google (la que pusiste en
`ADMIN_EMAIL`) y deberías entrar directo como administrador. Desde "Subdivisiones" crea
las 4 ramas (Fotografía, Reportaje, Edición de video, Diseño gráfico) o las que quieras —
no hay límite, puedes agregar más cuando quieras. Luego pide a tus coordinadores que
inicien sesión y, desde "Usuarios y permisos", asígnales su rol y subdivisión.

## 5. Desplegar en Railway

Vas a crear **dos servicios** dentro del mismo proyecto de Railway (uno para backend, uno
para frontend), igual que en tus otros proyectos:

1. **Backend**: nuevo servicio → "Deploy from GitHub repo" apuntando a la carpeta
   `backend/` (o sube el repo completo y configura el "Root Directory" como `backend`).
   Agrega las mismas variables de entorno del `.env` en la pestaña "Variables".
2. **Frontend**: otro servicio apuntando a `frontend/` (Root Directory `frontend`).
   Build command: `npm run build` — Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`.
   Agrega las variables `VITE_API_URL` (con la URL pública del backend) y
   `VITE_GOOGLE_CLIENT_ID`.
3. Una vez tengas las URLs públicas de ambos servicios, actualiza:
   - `FRONTEND_URL` en el backend con la URL real del frontend
   - `VITE_API_URL` en el frontend con la URL real del backend + `/api`
   - Agrega ambas URLs en "Orígenes de JavaScript autorizados" en Google Cloud Console
4. Redeploy ambos servicios después de actualizar variables.

## Ideas para después

- Permitir que un `coordinador_sub` vea una mini estadística de asistencia de su gente
  (ya está la data en Mongo, solo falta un gráfico con `recharts`, que ya está instalado).
- Subida directa de fotos (hoy se guardan como enlaces, ej. de Google Drive) usando algo
  como Cloudinary si más adelante quieres evitar copiar/pegar links.
- Notificaciones por correo cuando un usuario nuevo queda "pendiente" de aprobación.

