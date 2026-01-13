# Cabañas Córdoba

Plataforma web para **alquiler de cabañas**

---

## Funcionalidades

### Sitio público
- **Landing** con cabañas destacadas y acceso rápido a **“Ver cabañas”**.
- Página **/cabanas**
  - Búsqueda por fechas (check-in / check-out).
  - Filtros: huéspedes mín., precio mín/máx, orden.
  - Paginación.
- Detalle **/cabanas/[id]**
  - Fotos + descripción.
  - Selector de fechas.
  - Cálculo de total: **noches × precio/noche** (mínimo 1 noche).


### Admin (usuario fijo)
- Login / Logout (cookie httpOnly).
- CRUD de cabañas: crear / editar / activar-desactivar / destacar.
- Bloqueos de mantenimiento por cabaña:
  - Crear / eliminar rangos.
  - Estos bloqueos determinan la disponibilidad del buscador.

---

## Regla de disponibilidad

Una cabaña está **NO disponible** si existe al menos un bloqueo que solape con el rango buscado:


Requisitos de fechas:
- `check_out` debe ser **posterior** a `check_in` (**mínimo 1 noche**).

---

## Stack

### Web (Frontend)
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- `next/image` para imágenes (locales o dominios permitidos)

### API (Backend)
- Node.js + Express + TypeScript
- MySQL con `mysql2` (sin ORM)
- Auth Admin: **JWT en cookie httpOnly**

### Database
- MySQL (scripts en `database/`)

---

## Estructura del repo

cabañas-cordoba/
api/
src/
.env
package.json
tsconfig.json
database/
schema.sql
seed.sql
web/
public/
src/
.env
next.config.mjs
package.json
tailwind.config.ts
tsconfig.json

## Correr en local 

### 1) Base de datos
1. Crear la DB (ej: `cabanas_cordoba`)
2. Ejecutar en este orden:
- `database/schema.sql`
- `database/seed.sql`

### 2) API
```bash
cd api
npm install
npm run dev


Variables de entorno


PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
COOKIE_NAME=
COOKIE_SECURE=
