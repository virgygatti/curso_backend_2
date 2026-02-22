# Programación Backend II - E-commerce (Auth + Roles + Compra)

Proyecto e-commerce con **CRUD de usuarios**, **autenticación y autorización** (Passport + JWT), **roles** (admin/user), **lógica de compra** (stock, ticket) y arquitectura en capas (DAO, DTO, Repository). Se utiliza como base el código del proyecto realizado en el curso de Programación Backend I.

## Contenido

- **Pre-entrega:** Usuarios, bcrypt, Passport, JWT, estrategia "current", ruta `/api/sessions/current`, CRUD usuarios.
- **Entrega final:** Middleware de autorización (admin → productos; user → carrito), modelo Ticket, ruta `POST /:cid/purchase`, DAO/DTO/Repository, DTO en `/current`.

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Descripción |
|----------|-------------|
| `MONGODB_URI` | Conexión a MongoDB (local o Atlas). |
| `JWT_SECRET` | Secreto para firmar el JWT. |
| `JWT_EXPIRES` | Opcional (ej: `24h`). |
| `JWT_COOKIE_NAME` | Opcional (default: `token`). |
| `PORT` | Opcional (default: `8080`). |

## API

### Sesiones y usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/sessions/register` | Registro. Body: `first_name`, `last_name`, `email`, `age`, `password`. Crea carrito vacío. |
| POST | `/api/sessions/login` | Login. Body: `email`, `password`. JWT en cookie y usuario en body. |
| GET | `/api/sessions/current` | Usuario logueado (DTO sin datos sensibles). Requiere cookie con JWT. |
| POST | `/api/sessions/logout` | Borra la cookie. |
| GET | `/api/users` | Lista usuarios (sin password). |
| GET | `/api/users/:uid` | Usuario por ID. |
| PUT | `/api/users/:uid` | Actualiza usuario (password se hashea si se envía). |
| DELETE | `/api/users/:uid` | Elimina usuario. |

### Productos

| Método | Ruta | Descripción | Autorización |
|--------|------|-------------|--------------|
| GET | `/api/products` | Lista con paginación (`?limit`, `?page`, `?query`, `?sort`). | Público |
| GET | `/api/products/:pid` | Producto por ID. | Público |
| POST | `/api/products` | Crear producto. | Admin |
| PUT | `/api/products/:pid` | Actualizar producto. | Admin |
| DELETE | `/api/products/:pid` | Eliminar producto. | Admin |

### Carritos

| Método | Ruta | Descripción | Autorización |
|--------|------|-------------|--------------|
| POST | `/api/carts` | Crear carrito. | Público |
| GET | `/api/carts/:cid` | Carrito por ID (con productos poblados). | Público |
| POST | `/api/carts/:cid/product/:pid` | Agregar producto al carrito. | User, carrito propio |
| POST | `/api/carts/:cid/purchase` | Finalizar compra (stock, ticket, actualizar carrito). | Usuario logueado, carrito propio |
| PUT | `/api/carts/:cid` | Actualizar carrito. | Público |
| PUT | `/api/carts/:cid/products/:pid` | Actualizar cantidad. Body: `{ quantity }`. | Público |
| DELETE | `/api/carts/:cid/products/:pid` | Quitar producto del carrito. | Público |
| DELETE | `/api/carts/:cid` | Vaciar carrito. | Público |

## Cómo correr

```bash
npm install
# Copiar .env.example a .env y configurar MONGODB_URI, JWT_SECRET, etc.
npm start
# o en desarrollo:
npm run dev
```

## Pruebas

1. **Usuarios de prueba** (una vez):
   ```bash
   node scripts/seed-test-users.js
   ```
   Crea: `admin@test.com` / `123456` y `user@test.com` / `123456`.

2. **Suite de pruebas API** (con el servidor corriendo):
   ```bash
   node scripts/test-api.js
   ```

## Estructura relevante

- `src/models/` – User, Product, Cart, Ticket.
- `src/dao/` – acceso a datos por entidad.
- `src/repositories/` – lógica de acceso usando DAOs.
- `src/services/` – reglas de negocio (usan repositorios).
- `src/controllers/` – rutas y respuestas HTTP.
- `src/middlewares/authorization.js` – requireAuth, requireAdmin, requireUser, requireOwnCart.
- `src/dtos/userDto.js` – DTO de usuario para `/api/sessions/current`.
