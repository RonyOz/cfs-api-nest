# Campus Food Sharing API (NestJS)

![NestJS](https://img.shields.io/badge/NestJS-Framework-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-ORM-orange)
![Coverage >80%](https://img.shields.io/badge/Coverage-%3E80%25-success?logo=jest)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-green?logo=swagger)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?logo=graphql)
![GitHub Actions](https://img.shields.io/badge/CI-CD_Automation-black?logo=github)

> **Nota:**
> Esta API fue desarrollada con **NestJS** y tiene como propósito facilitar la compra y venta de alimentos dentro de un campus universitario, gestionando usuarios, productos y pedidos con autenticación JWT, autorización por roles, persistencia con PostgreSQL, documentación Swagger y **ahora con soporte GraphQL**.

## Autores

* David Artunduaga ([@David104087](https://github.com/David104087))
* Jennifer Castro ([@JenniferCastrocd](https://github.com/JenniferCastrocd))
* Rony Ordoñez ([@RonyOz](https://github.com/RonyOz))
* Juan de la Pava ([@JuanJDlp](https://github.com/JuanJDlp))

---

## Despliegue

La API se encuentra desplegada en el siguiente enlace:

> [https://cfs-api.onrender.com/api-docs](https://cfs-api.onrender.com/api-docs)

---

## Campus Food Sharing — Nest.js

Este repositorio incluye módulos para **auth**, **users**, **products** y **orders**, una plantilla de configuración **TypeORM**, un endpoint **seed** y un workflow de **GitHub Actions** para ejecutar pruebas automáticas antes del despliegue.

**Puntos principales:**

* API base path: `/api/v1`
* Swagger UI: `/api-docs`
* Endpoint seed (placeholder): `POST /api/v1/seed/run` — implementa un cargue inicial para crear un admin y productos de ejemplo.

**Cómo ejecutar:**

1. Instalar dependencias:

   ```bash
   bun install
   # o
   npm install
   ```

2. Iniciar el servidor en modo desarrollo:

   ```bash
   bun run start:dev
   # o
   npm run start:dev
   ```

3. Acceder a Swagger UI:
   [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Características Principales

1. **Gestión de Usuarios:** Registro, autenticación y administración de perfiles de usuario.
2. **Roles Definidos:** `buyer`, `seller` y `admin` con permisos diferenciados.
3. **Autenticación JWT:** Protección de rutas y extracción del usuario desde el token.
4. **Módulo de Productos:** Creación, actualización y eliminación por parte de vendedores y administradores.
5. **Módulo de Pedidos:** Los compradores pueden realizar pedidos y los vendedores gestionar su estado.
6. **Transacciones Atómicas:** Garantizan la consistencia al crear o cancelar pedidos.
7. **Validaciones de Negocio:** Evita compras propias, controla stock y conserva precios históricos.
8. **Pruebas Automatizadas:** Cobertura superior al 80% con Jest y Supertest.
9. **Documentación Completa:** Swagger (OpenAPI) disponible para visualizar y probar endpoints.
10. **CI/CD:** GitHub Actions ejecuta pruebas antes de cada push.

---

## Nueva Funcionalidad: GraphQL API

Este proyecto ahora soporta **GraphQL** además de la API REST tradicional. Puedes elegir la opción que mejor se adapte a tus necesidades:

- **REST API**: `/api/v1/*` - Endpoints tradicionales
- **GraphQL API**: `/graphql` - API GraphQL con playground interactivo

**Documentación completa de GraphQL**: Ver [GRAPHQL.md](./GRAPHQL.md)  
**Ejemplos de queries**: Ver [graphql-examples.gql](./graphql-examples.gql)

### Acceso rápido:
- **GraphQL Playground**: [http://localhost:3000/graphql](http://localhost:3000/graphql)
- **REST Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Stack Tecnológico

* **Backend:** NestJS (TypeScript)
* **Base de Datos:** PostgreSQL
* **ORM:** TypeORM
* **Autenticación:** JWT + Passport
* **Testing:** Jest y Supertest
* **Documentación:** Swagger (OpenAPI)
* **Despliegue:** Render
* **Integración Continua:** GitHub Actions

---

## Puesta en Marcha

> **Tip:** Sigue estos pasos para configurar y ejecutar el proyecto localmente.

### 1. Prerrequisitos

* [Node.js](https://nodejs.org/) v18 o superior
* [Bun](https://bun.sh/) o npm
* [PostgreSQL](https://www.postgresql.org/)
* [Nest CLI](https://docs.nestjs.com/cli/overview)

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=cfs
TYPEORM_SYNCHRONIZE=true
JWT_SECRET=secret_key
PORT=3000
```

### 3. Ejecución

```bash
npm run start:dev
```

El servidor se ejecutará en [http://localhost:3000](http://localhost:3000).

---

## Pruebas

La API cuenta con pruebas unitarias e integradas que aseguran la fiabilidad de la lógica de negocio.

```bash
npm run test:cov
```

> **Cobertura:** superior al 80%.
> Los tests incluyen servicios, controladores y validaciones de reglas de negocio.

---

## Documentación de la API

La documentación está disponible en:

> [https://cfs-api.onrender.com/api-docs](https://cfs-api.onrender.com/api-docs)

---

## Resumen de Endpoints

<details>
<summary><strong>Ver tabla de endpoints principales</strong></summary>

A continuación se muestra una descripción general de los endpoints disponibles.
Para ver detalles completos sobre cuerpos de solicitud y respuestas, consulta la [documentación de Swagger](https://cfs-api.onrender.com/api-docs).

### Auth

| Método | Endpoint        | Descripción                                           | Acceso   |
| :----- | :-------------- | :---------------------------------------------------- | :------- |
| `POST` | `/auth/signup`  | Registra un nuevo usuario (rol por defecto: `buyer`). | Público  |
| `POST` | `/auth/login`   | Inicia sesión y devuelve un token JWT.                | Público  |
| `GET`  | `/auth/profile` | Obtiene el perfil del usuario autenticado.            | Logueado |

---

### Users

| Método   | Endpoint      | Descripción                     | Acceso   |
| :------- | :------------ | :------------------------------ | :------- |
| `GET`    | `/users`      | Lista todos los usuarios.       | Admin    |
| `GET`    | `/users/{id}` | Obtiene un usuario por su ID.   | Logueado |
| `PUT`    | `/users/{id}` | Actualiza un usuario por su ID. | Logueado |
| `DELETE` | `/users/{id}` | Elimina un usuario por su ID.   | Admin    |

---

### Products

| Método   | Endpoint         | Descripción                            | Acceso        |
| :------- | :--------------- | :------------------------------------- | :------------ |
| `GET`    | `/products`      | Lista todos los productos disponibles. | Público       |
| `POST`   | `/products`      | Crea un nuevo producto.                | Seller, Admin |
| `GET`    | `/products/{id}` | Obtiene un producto por su ID.         | Público       |
| `PUT`    | `/products/{id}` | Actualiza un producto por su ID.       | Seller, Admin |
| `DELETE` | `/products/{id}` | Elimina un producto por su ID.         | Seller, Admin |

---

### Orders

| Método   | Endpoint              | Descripción                       | Acceso        |
| :------- | :-------------------- | :-------------------------------- | :------------ |
| `GET`    | `/orders`             | Lista todos los pedidos.          | Admin         |
| `POST`   | `/orders`             | Crea un nuevo pedido.             | Buyer         |
| `GET`    | `/orders/{id}`        | Obtiene un pedido por su ID.      | Involucrados  |
| `PUT`    | `/orders/{id}/status` | Actualiza el estado de un pedido. | Seller, Admin |
| `DELETE` | `/orders/{id}`        | Cancela un pedido.                | Involucrados  |

---

### Seller

| Método | Endpoint       | Descripción                                | Acceso  |
| :----- | :------------- | :----------------------------------------- | :------ |
| `GET`  | `/seller`      | Lista todos los usuarios con rol que tenga productos. | Público |
| `GET`  | `/seller/{id}` | Obtiene el perfil público de un vendedor.  | Público |

---

### Admin

| Método | Endpoint      | Descripción                            | Acceso |
| :----- | :------------ | :------------------------------------- | :----- |
| `POST` | `/admin/user` | Crea un usuario con un rol específico. | Admin  |

</details>

---

### Ejemplo de documento `Product` (para `POST` / `PUT`):

```json
{
  "name": "Sandwich de pollo",
  "description": "Hecho con pan artesanal y pollo asado",
  "price": 12000,
  "stock": 10
}
```

### Ejemplo de documento `Order` (para `POST`):

```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}
```

