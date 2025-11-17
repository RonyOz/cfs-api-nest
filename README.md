# Campus Food Sharing - GraphQL API

![NestJS](https://img.shields.io/badge/NestJS-Framework-red?logo=nestjs)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?logo=graphql)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-ORM-orange)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens)

API GraphQL desarrollada con NestJS, TypeScript y Apollo Server. Implementa gestión de usuarios y productos con autenticación JWT, autorización basada en roles (admin/user), operaciones CRUD completas, fragments reutilizables y manejo robusto de errores.

---


## Autores

* David Artunduaga ([@David104087](https://github.com/David104087))
* Jennifer Castro ([@JenniferCastrocd](https://github.com/JenniferCastrocd))
* Rony Ordoñez ([@RonyOz](https://github.com/RonyOz))
* Juan de la Pava ([@JuanJDlp](https://github.com/JuanJDlp))

---

## Despliegue

**GraphQL Playground (Producción):**
> [https://cfs-api.onrender.com/graphql](https://cfs-api.onrender.com/graphql)

**Documentación REST (Referencia):**
> [https://cfs-api.onrender.com/api-docs](https://cfs-api.onrender.com/api-docs)

---

## Sobre el Proyecto

Campus Food Sharing es una API GraphQL diseñada para facilitar el intercambio de alimentos entre estudiantes universitarios. La API permite a los usuarios publicar productos disponibles, explorar ofertas de otros vendedores, y gestionar sus propias publicaciones. El proyecto implementa las mejores prácticas de GraphQL, aprovechando sus ventajas en eficiencia y flexibilidad de consultas.

La aplicación cuenta con un sistema robusto de autenticación y autorización, permitiendo diferentes niveles de acceso según el rol del usuario. Los administradores tienen control completo sobre usuarios y productos, mientras que los usuarios regulares pueden gestionar únicamente sus propios recursos.

---

## Características Implementadas

### Gestión de Usuarios

- **Operaciones CRUD completas** con GraphQL
- **Roles diferenciados**: `user` (regular) y `admin` (superadmin)
- **Autorización granular**:
  - Superadmin: Crear, modificar y eliminar cualquier usuario
  - Usuario regular: Ver otros usuarios, modificar solo su perfil
- **Autenticación 2FA** (opcional)

### Gestión de Productos

- **CRUD completo** con GraphQL queries y mutations
- **Propiedad de recursos**: Usuarios pueden gestionar solo sus productos
- **Permisos de admin**: Superadmin puede gestionar todos los productos
- **Relaciones**: Productos vinculados a usuarios vendedores
- **Validaciones de negocio**: Stock, precios, permisos de edición

### Autenticación y Autorización

- **JWT**: Registro y login con tokens
- **Guards**: Protección de queries y mutations
- **Roles**: Middleware de autorización para operaciones sensibles
- **Headers**: `Authorization: Bearer <token>` requerido

### Implementación GraphQL

#### Consultas y Mutaciones
- **Queries**: `users`, `user`, `products`, `product`, `myProducts`, `sellers`, `sellerProfile`
- **Mutations**: `signup`, `login`, `createUser`, `updateUser`, `removeUser`, `createProduct`, `updateProduct`, `deleteProduct`
- **Paginación**: Input `PaginationInput` para límite y offset
- **Búsqueda flexible**: Por ID, email, username, o nombre de producto

#### Fragments
- **UserBasicFields**: Reutilizable para queries de usuario
- **ProductBasicFields**: Reutilizable para queries de producto
- **ProductWithSeller**: Combina producto + vendedor

#### Manejo de Errores
- **Códigos específicos**: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`
- **Mensajes descriptivos**: Contexto claro del error
- **Validaciones**: class-validator en todos los inputs

---

## Documentación GraphQL Completa

### Tipos de Datos

#### User
```graphql
type User {
  id: ID!
  email: String!
  username: String!
  role: String!
  twoFactorEnabled: Boolean!
  products: [Product!]
  productsCount: Int
}
```

#### Product
```graphql
type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  stock: Int!
  seller: User!
}
```

#### AuthResponse
```graphql
type AuthResponse {
  message: String!
  token: String!
}
```

### Inputs Disponibles

```graphql
input SignupInput {
  email: String!
  username: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
  token: String  # Para 2FA
}

input CreateUserInput {
  email: String!
  username: String!
  password: String!
  role: String
}

input UpdateUserInput {
  email: String
  username: String
  password: String
}

input CreateProductInput {
  name: String!         # Mínimo 3 caracteres
  description: String
  price: Float!         # Mínimo 0
  stock: Int           # Mínimo 0, default: 0
}

input UpdateProductInput {
  name: String          # Mínimo 3 caracteres
  description: String
  price: Float          # Mínimo 0
  stock: Int           # Mínimo 0
}

input PaginationInput {
  limit: Int           # Default: 10
  offset: Int          # Default: 0
}

input Verify2FAInput {
  token: String!
}
```

### Queries Disponibles

#### 1. Obtener Todos los Usuarios (Admin)

```graphql
query GetAllUsers {
  users(pagination: { limit: 10, offset: 0 }) {
    id
    email
    username
    role
    twoFactorEnabled
  }
}
```

**Autenticación:** Requerida (Admin)

---

#### 2. Obtener un Usuario Específico

```graphql
# Por email
query GetUser {
  user(term: "usuario@example.com") {
    id
    email
    username
    role
    twoFactorEnabled
    products {
      id
      name
      price
      stock
    }
  }
}

# Por username
query GetUserByUsername {
  user(term: "usuario123") {
    id
    email
    username
  }
}

# Por ID
query GetUserById {
  user(term: "550e8400-e29b-41d4-a716-446655440000") {
    id
    email
    username
  }
}
```

**Autenticación:** Requerida (Cualquier usuario)

---

#### 3. Obtener Todos los Productos

```graphql
query GetAllProducts {
  products(pagination: { limit: 10, offset: 0 }) {
    id
    name
    description
    price
    stock
    seller {
      id
      username
      email
    }
  }
}
```

**Autenticación:** No requerida (Público)

---

#### 4. Obtener un Producto Específico

```graphql
# Por ID
query GetProductById {
  product(term: "550e8400-e29b-41d4-a716-446655440000") {
    id
    name
    description
    price
    stock
    seller {
      username
      email
    }
  }
}

# Por nombre
query GetProductByName {
  product(term: "iPhone 15 Pro") {
    id
    name
    price
    stock
  }
}
```

**Autenticación:** No requerida (Público)

---

#### 5. Obtener Mis Productos

```graphql
query GetMyProducts {
  myProducts(pagination: { limit: 5, offset: 0 }) {
    id
    name
    description
    price
    stock
  }
}
```

**Autenticación:** Requerida (Usuario autenticado)

---

#### 6. Obtener Vendedores

```graphql
query GetSellers {
  sellers(pagination: { limit: 10, offset: 0 }) {
    id
    username
    email
    products {
      id
      name
      price
      stock
    }
    productsCount
  }
}
```

**Autenticación:** No requerida (Público)

---

#### 7. Obtener Perfil de Vendedor

```graphql
query GetSellerProfile {
  sellerProfile(id: "uuid-del-vendedor") {
    seller {
      id
      username
      twoFactorEnabled
    }
    products {
      id
      name
      description
      price
      stock
    }
    salesHistory {
      id
      status
      createdAt
      items {
        orderItemId
        productId
        productName
        quantity
        itemPrice
      }
    }
  }
}
```

**Autenticación:** No requerida (Público)

---

### Mutations Disponibles

#### 1. Registro de Usuario

```graphql
mutation Signup {
  signup(input: {
    email: "usuario@example.com"
    username: "usuario123"
    password: "Password123!"
  }) {
    message
    token
  }
}
```

**Respuesta:**
```json
{
  "data": {
    "signup": {
      "message": "Signup successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Autenticación:** No requerida

---

#### 2. Inicio de Sesión

```graphql
mutation Login {
  login(input: {
    email: "usuario@example.com"
    password: "Password123!"
  }) {
    message
    token
  }
}
```

**Autenticación:** No requerida

---

#### 3. Crear Usuario (Admin)

```graphql
mutation CreateUser {
  createUser(input: {
    email: "nuevo@example.com"
    username: "nuevo_usuario"
    password: "Password123!"
    role: "user"
  }) {
    id
    email
    username
    role
    twoFactorEnabled
  }
}
```

**Autenticación:** Requerida (Admin)

---

#### 4. Actualizar Usuario (Admin)

```graphql
mutation UpdateUser {
  updateUser(
    id: "uuid-del-usuario"
    input: {
      username: "usuario_actualizado"
      email: "actualizado@example.com"
    }
  ) {
    id
    email
    username
    role
  }
}
```

**Autenticación:** Requerida (Admin)

---

#### 5. Eliminar Usuario (Admin)

```graphql
mutation DeleteUser {
  removeUser(id: "uuid-del-usuario")
}
```

**Autenticación:** Requerida (Admin)

---

#### 6. Crear Producto

```graphql
mutation CreateProduct {
  createProduct(input: {
    name: "MacBook Pro 16"
    description: "Laptop potente con M3 Max chip"
    price: 2499.99
    stock: 15
  }) {
    id
    name
    description
    price
    stock
    seller {
      id
      username
      email
    }
  }
}
```

**Autenticación:** Requerida (Usuario autenticado)

---

#### 7. Actualizar Producto (Dueño o Admin)

```graphql
mutation UpdateProduct {
  updateProduct(
    id: "uuid-del-producto"
    input: {
      price: 2299.99
      stock: 10
    }
  ) {
    id
    name
    price
    stock
    seller {
      username
    }
  }
}
```

**Autenticación:** Requerida (Dueño del producto o Admin)

**Validación:**
- Si eres el dueño del producto: Permitido
- Si eres admin: Permitido
- Si eres otro usuario: Error 403 Forbidden

---

#### 8. Eliminar Producto (Dueño o Admin)

```graphql
mutation DeleteProduct {
  deleteProduct(id: "uuid-del-producto")
}
```

**Autenticación:** Requerida (Dueño del producto o Admin)

---

#### 9. Habilitar 2FA

```graphql
mutation Enable2FA {
  enable2FA {
    secret
    qrCode
  }
}
```

**Autenticación:** Requerida

**Respuesta:**
```json
{
  "data": {
    "enable2FA": {
      "secret": "JBSWY3DPEHPK3PXP",
      "qrCode": "data:image/png;base64,..."
    }
  }
}
```

---

#### 10. Verificar y Activar 2FA

```graphql
mutation Verify2FA {
  verify2FA(input: {
    token: "123456"
  }) {
    message
  }
}
```

**Autenticación:** Requerida

---

#### 11. Deshabilitar 2FA

```graphql
mutation Disable2FA {
  disable2FA(input: {
    token: "123456"
  }) {
    message
  }
}
```

**Autenticación:** Requerida

---

### Uso de Fragments

Los fragments permiten reutilizar partes de las consultas y evitar duplicación de código.

#### Definir Fragments

```graphql
# Fragment para campos básicos de usuario
fragment UserBasicFields on User {
  id
  email
  username
  role
}

# Fragment para campos básicos de producto
fragment ProductBasicFields on Product {
  id
  name
  description
  price
  stock
}

# Fragment para producto con información del vendedor
fragment ProductWithSeller on Product {
  ...ProductBasicFields
  seller {
    ...UserBasicFields
  }
}
```

#### Usar Fragments en Queries

```graphql
query GetAllProductsWithFragment {
  products(pagination: { limit: 10, offset: 0 }) {
    ...ProductWithSeller
  }
}

query GetUserWithFragment {
  user(term: "usuario@example.com") {
    ...UserBasicFields
    products {
      ...ProductBasicFields
    }
  }
}
```

#### Usar Fragments en Mutations

```graphql
mutation CreateProductWithFragment {
  createProduct(input: {
    name: "iPhone 15"
    description: "Smartphone de última generación"
    price: 999.99
    stock: 50
  }) {
    ...ProductWithSeller
  }
}
```

**Ubicación:** Los fragments están definidos en `src/modules/products/graphql-fragments.gql`

---

### Manejo de Errores

La API implementa un sistema robusto de manejo de errores con mensajes descriptivos.

#### Tipos de Errores

**1. Error de Autenticación (401 Unauthorized)**

```json
{
  "errors": [{
    "message": "Unauthorized",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```

**Causa:** Token JWT no proporcionado o inválido

**Solución:** Agregar header `Authorization: Bearer TOKEN`

---

**2. Error de Autorización (403 Forbidden)**

```json
{
  "errors": [{
    "message": "You can only update your own products",
    "extensions": {
      "code": "FORBIDDEN"
    }
  }]
}
```

**Causa:** Usuario intenta acceder a un recurso sin permisos

**Solución:** Verificar que seas el dueño del recurso o tengas el rol adecuado (admin)

---

**3. Error de Recurso No Encontrado (404 Not Found)**

```json
{
  "errors": [{
    "message": "Product with id xxx not found",
    "extensions": {
      "code": "NOT_FOUND"
    }
  }]
}
```

**Causa:** El recurso solicitado no existe

**Solución:** Verificar el ID del recurso

---

**4. Error de Validación (400 Bad Request)**

```json
{
  "errors": [{
    "message": "Product name must be at least 3 characters long",
    "extensions": {
      "code": "BAD_REQUEST"
    }
  }]
}
```

**Causa:** Datos de entrada no cumplen con las validaciones

**Solución:** Revisar las validaciones de cada campo

---

### Validaciones de Entrada

#### CreateProductInput
- `name`: String, mínimo 3 caracteres, requerido
- `description`: String, opcional
- `price`: Float, mínimo 0, requerido
- `stock`: Int, mínimo 0, opcional (default: 0)

#### UpdateProductInput
- `name`: String, mínimo 3 caracteres, opcional
- `description`: String, opcional
- `price`: Float, mínimo 0, opcional
- `stock`: Int, mínimo 0, opcional

#### CreateUserInput
- `email`: Email válido, requerido, único
- `username`: String, mínimo 3 caracteres, requerido
- `password`: String, mínimo 6 caracteres, requerido
- `role`: Enum ('user', 'admin'), opcional (default: 'user')

#### SignupInput
- `email`: Email válido, requerido
- `username`: String, mínimo 3 caracteres, requerido
- `password`: String, mínimo 6 caracteres, requerido

---

### Ejemplos de Flujos Completos

#### Flujo 1: Registro y Creación de Producto

```graphql
# Paso 1: Registrarse
mutation {
  signup(input: {
    email: "vendedor@example.com"
    username: "vendedor123"
    password: "VendedorPass123!"
  }) {
    message
    token
  }
}

# Copiar el token de la respuesta y agregarlo a HTTP HEADERS:
# { "Authorization": "Bearer TOKEN_AQUI" }

# Paso 2: Crear un producto
mutation {
  createProduct(input: {
    name: "iPhone 15 Pro"
    description: "Smartphone Apple de última generación"
    price: 999.99
    stock: 50
  }) {
    id
    name
    price
    seller {
      username
    }
  }
}

# Paso 3: Ver mis productos
query {
  myProducts {
    id
    name
    price
    stock
  }
}

# Paso 4: Actualizar mi producto
mutation {
  updateProduct(
    id: "ID_DEL_PASO_2"
    input: {
      price: 899.99
      stock: 45
    }
  ) {
    id
    price
    stock
  }
}
```

---

#### Flujo 2: Admin Gestiona Usuarios

```graphql
# Paso 1: Login como admin
mutation {
  login(input: {
    email: "admin@example.com"
    password: "AdminPass123!"
  }) {
    token
  }
}

# Agregar token a HTTP HEADERS

# Paso 2: Ver todos los usuarios
query {
  users(pagination: { limit: 20, offset: 0 }) {
    id
    username
    email
    role
  }
}

# Paso 3: Crear un nuevo usuario
mutation {
  createUser(input: {
    email: "nuevo@example.com"
    username: "nuevo_usuario"
    password: "Password123!"
    role: "user"
  }) {
    id
    username
    role
  }
}

# Paso 4: Actualizar usuario
mutation {
  updateUser(
    id: "UUID_DEL_USUARIO"
    input: {
      username: "usuario_actualizado"
    }
  ) {
    id
    username
  }
}

# Paso 5: Eliminar usuario
mutation {
  removeUser(id: "UUID_DEL_USUARIO")
}
```

---

#### Flujo 3: Admin Modifica Productos de Otros

```graphql
# Login como admin (paso 1 del flujo anterior)

# Ver todos los productos
query {
  products {
    id
    name
    price
    seller {
      username
    }
  }
}

# Actualizar producto de otro usuario (solo admin puede)
mutation {
  updateProduct(
    id: "UUID_PRODUCTO_DE_OTRO_USUARIO"
    input: {
      price: 799.99
      description: "Actualizado por administrador"
    }
  ) {
    id
    name
    price
    seller {
      username
    }
  }
}

# Eliminar producto de otro usuario (solo admin puede)
mutation {
  deleteProduct(id: "UUID_PRODUCTO_DE_OTRO_USUARIO")
}
```

---

#### Flujo 4: Usuario Intenta Modificar Producto Ajeno (Error)

```graphql
# Login como usuario regular
mutation {
  login(input: {
    email: "usuario@example.com"
    password: "UserPass123!"
  }) {
    token
  }
}

# Intentar actualizar producto de otro usuario
mutation {
  updateProduct(
    id: "UUID_PRODUCTO_DE_OTRO_USUARIO"
    input: {
      price: 100
    }
  ) {
    id
    price
  }
}

# Resultado esperado: Error 403 Forbidden
# {
#   "errors": [{
#     "message": "You can only update your own products",
#     "extensions": { "code": "FORBIDDEN" }
#   }]
# }
```

---

### Matriz de Permisos

| Operación | Público | Usuario | Admin |
|-----------|---------|---------|-------|
| Ver productos | ✓ | ✓ | ✓ |
| Ver un producto | ✓ | ✓ | ✓ |
| Ver vendedores | ✓ | ✓ | ✓ |
| Ver perfil vendedor | ✓ | ✓ | ✓ |
| Ver mis productos | ✗ | ✓ | ✓ |
| Crear producto | ✗ | ✓ | ✓ |
| Actualizar mi producto | ✗ | ✓ | ✓ |
| Actualizar producto ajeno | ✗ | ✗ | ✓ |
| Eliminar mi producto | ✗ | ✓ | ✓ |
| Eliminar producto ajeno | ✗ | ✗ | ✓ |
| Ver un usuario | ✗ | ✓ | ✓ |
| Ver todos los usuarios | ✗ | ✗ | ✓ |
| Crear usuario | ✗ | ✗ | ✓ |
| Actualizar usuario | ✗ | ✗ | ✓ |
| Eliminar usuario | ✗ | ✗ | ✓ |
| Signup | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ |
| Habilitar 2FA | ✗ | ✓ | ✓ |

---

## Inicio Rápido

### Prerrequisitos

- Node.js v18+
- PostgreSQL
- npm o bun

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/RonyOz/cfs-api-nest.git
   cd cfs-api-nest
   git checkout graphql
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (`.env`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=cfs
   TYPEORM_SYNCHRONIZE=true
   JWT_SECRET=your_secret_key
   PORT=3000
   ```

4. **Ejecutar el servidor**:
   ```bash
   npm run start:dev
   ```

5. **Acceder al GraphQL Playground**:
   - Abrir: [http://localhost:3000/graphql](http://localhost:3000/graphql)

### Uso del GraphQL Playground

**1. Estructura del Playground**

- **Panel izquierdo**: Escribe tus queries y mutations
- **Panel central**: Resultados de la ejecución
- **Panel derecho**: Documentación automática (Schema)
- **HTTP HEADERS**: Sección inferior para agregar headers

**2. Configurar Autenticación**

Después de hacer login o signup, copia el token y agrégalo en **HTTP HEADERS**:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**3. Explorar el Schema**

Haz clic en **"DOCS"** o **"SCHEMA"** en el panel derecho para ver:
- Todos los tipos disponibles
- Todas las queries disponibles
- Todas las mutations disponibles
- Descripción de cada campo

**4. Autocompletado**

Presiona `Ctrl + Espacio` para ver sugerencias de campos y tipos mientras escribes.

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | NestJS |
| **Lenguaje** | TypeScript (Strict) |
| **API** | GraphQL + Apollo Server |
| **Base de Datos** | PostgreSQL |
| **ORM** | TypeORM |
| **Autenticación** | JWT + Passport |
| **Validación** | class-validator + class-transformer |
| **Testing** | Jest |
| **Despliegue** | Render |
| **CI/CD** | GitHub Actions |

## Testing

Para ejecutar los tests automatizados:

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Testing Manual en Playground

Iniciar el servidor:
```bash
npm run start:dev
```

Abrir el navegador en [http://localhost:3000/graphql](http://localhost:3000/graphql) y seguir los ejemplos de flujos completos en la sección **Documentación GraphQL Completa**.

---

## Resumen de Operaciones GraphQL

### Queries (Consultas)

| Query | Descripción | Autenticación | Rol Requerido |
|-------|-------------|---------------|---------------|
| `users` | Lista todos los usuarios | ✅ | Admin |
| `user(term)` | Obtiene un usuario por ID/email/username | ✅ | Cualquiera |
| `products` | Lista todos los productos | ❌ | Público |
| `product(term)` | Obtiene un producto por ID/nombre | ❌ | Público |
| `myProducts` | Lista productos del usuario autenticado | ✅ | Cualquiera |
| `sellers` | Lista usuarios con productos | ❌ | Público |
| `sellerProfile(id)` | Perfil público de vendedor | ❌ | Público |

### Mutations (Modificaciones)

| Mutation | Descripción | Autenticación | Rol Requerido |
|----------|-------------|---------------|---------------|
| `signup` | Registro de usuario | ❌ | Público |
| `login` | Inicio de sesión | ❌ | Público |
| `createUser` | Crear usuario con rol específico | ✅ | Admin |
| `updateUser` | Actualizar usuario | ✅ | Admin |
| `removeUser` | Eliminar usuario | ✅ | Admin |
| `createProduct` | Crear producto | ✅ | Cualquiera |
| `updateProduct` | Actualizar producto | ✅ | Dueño o Admin |
| `deleteProduct` | Eliminar producto | ✅ | Dueño o Admin |
| `enable2FA` | Habilitar 2FA | ✅ | Cualquiera |
| `verify2FA` | Verificar 2FA | ✅ | Cualquiera |
| `disable2FA` | Deshabilitar 2FA | ✅ | Cualquiera |