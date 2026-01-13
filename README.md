# Cabañas Córdoba

Plataforma web para **alquiler de cabañas**

---

<img width="1019" height="910" alt="cc" src="https://github.com/user-attachments/assets/4316447f-42fd-4e9e-b5ad-ed3589fba238" />
<img width="1019" height="870" alt="ca1" src="https://github.com/user-attachments/assets/2ef91e55-5fec-43dc-a28d-98b7d7f7837e" />
<img width="1019" height="909" alt="ca2" src="https://github.com/user-attachments/assets/eefc26b0-e4e3-4bf9-a9cf-f19ea3cb0834" />
<img width="1019" height="820" alt="ca3" src="https://github.com/user-attachments/assets/52efc31f-cb11-4e8f-9dea-4ad1cf4a8851" />
<img width="1019" height="903" alt="ca4" src="https://github.com/user-attachments/assets/3eb3390c-9652-41bf-b437-89c78d59e146" />
<img width="1019" height="907" alt="ca5" src="https://github.com/user-attachments/assets/271ac02c-56cc-48c2-aa35-f509153639a7" />


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
