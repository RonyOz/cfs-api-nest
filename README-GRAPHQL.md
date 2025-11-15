# 🚀 GraphQL API - Campus Food Sharing

## 🔐 Autenticación

### **1. Registro de Usuario**

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

### **2. Login**

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

### **3. Configurar Headers de Autenticación**

Una vez obtenido el token, agrégalo en la sección **HTTP HEADERS** del Playground:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📊 Endpoints GraphQL

### **Tipos de Datos**

#### **User**
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

#### **Product**
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

#### **AuthResponse**
```graphql
type AuthResponse {
  message: String!
  token: String!
}
```

---

### **Queries (Consultas)**

#### **1. Obtener Todos los Usuarios (Admin)**

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

**Autenticación requerida:** ✅ (Admin)

---

#### **2. Obtener un Usuario por ID/Email/Username**

```graphql
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
```

**Autenticación requerida:** ✅ (Cualquier usuario autenticado)

---

#### **3. Obtener Todos los Productos (Público)**

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

**Autenticación requerida:** ❌ (Público)

---

#### **4. Obtener un Producto por ID o Nombre (Público)**

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

**Autenticación requerida:** ❌ (Público)

---

#### **5. Obtener Mis Productos**

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

**Autenticación requerida:** ✅ (Usuario autenticado)

---

#### **6. Obtener Vendedores (Usuarios con Productos)**

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

**Autenticación requerida:** ❌ (Público)

---

#### **7. Obtener Perfil Público de Vendedor**

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

**Autenticación requerida:** ❌ (Público)

---

### **Mutations (Modificaciones)**

#### **1. Crear Usuario (Admin)**

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

**Autenticación requerida:** ✅ (Admin)

---

#### **2. Actualizar Usuario (Admin)**

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

**Autenticación requerida:** ✅ (Admin)

---

#### **3. Eliminar Usuario (Admin)**

```graphql
mutation DeleteUser {
  removeUser(id: "uuid-del-usuario")
}
```

**Autenticación requerida:** ✅ (Admin)

---

#### **4. Crear Producto**

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

**Autenticación requerida:** ✅ (Usuario autenticado)

---

#### **5. Actualizar Producto (Dueño o Admin)**

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

**Autenticación requerida:** ✅ (Dueño del producto o Admin)

**Validación de Autorización:**
- Si eres el dueño del producto: ✅ Permitido
- Si eres admin: ✅ Permitido
- Si eres otro usuario: ❌ Error `403 Forbidden`

---

#### **6. Eliminar Producto (Dueño o Admin)**

```graphql
mutation DeleteProduct {
  deleteProduct(id: "uuid-del-producto")
}
```

**Autenticación requerida:** ✅ (Dueño del producto o Admin)

---

#### **7. Habilitar Autenticación 2FA**

```graphql
mutation Enable2FA {
  enable2FA {
    secret
    qrCode
  }
}
```

**Autenticación requerida:** ✅ (Usuario autenticado)

---

#### **8. Verificar y Activar 2FA**

```graphql
mutation Verify2FA {
  verify2FA(input: {
    token: "123456"
  }) {
    message
  }
}
```

**Autenticación requerida:** ✅ (Usuario autenticado)

---

#### **9. Deshabilitar 2FA**

```graphql
mutation Disable2FA {
  disable2FA(input: {
    token: "123456"
  }) {
    message
  }
}
```

**Autenticación requerida:** ✅ (Usuario autenticado)

---

## 🔄 Uso de Fragments

Los fragments permiten reutilizar partes de las consultas y evitar duplicación de código.

### **Definir Fragments**

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

### **Usar Fragments en Queries**

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

### **Usar Fragments en Mutations**

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

### **Archivo de Fragments Reutilizables**

Los fragments están definidos en: `src/modules/products/graphql-fragments.gql`

---

## ⚠️ Manejo de Errores

La API implementa un sistema robusto de manejo de errores con mensajes descriptivos.

### **Tipos de Errores**

#### **1. Error de Autenticación (401 Unauthorized)**

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

#### **2. Error de Autorización (403 Forbidden)**

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

**Solución:** 
- Verificar que seas el dueño del recurso
- Verificar que tengas el rol adecuado (admin)

---

#### **3. Error de Recurso No Encontrado (404 Not Found)**

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

#### **4. Error de Validación (400 Bad Request)**

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

### **Validaciones de Entrada**

#### **CreateProductInput**
- `name`: String, mínimo 3 caracteres, requerido
- `description`: String, opcional
- `price`: Float, mínimo 0, requerido
- `stock`: Int, mínimo 0, opcional (default: 0)

#### **UpdateProductInput**
- `name`: String, mínimo 3 caracteres, opcional
- `description`: String, opcional
- `price`: Float, mínimo 0, opcional
- `stock`: Int, mínimo 0, opcional

#### **CreateUserInput**
- `email`: Email válido, requerido, único
- `username`: String, mínimo 3 caracteres, requerido
- `password`: String, mínimo 6 caracteres, requerido
- `role`: Enum ('user', 'admin'), opcional (default: 'user')

#### **SignupInput**
- `email`: Email válido, requerido
- `username`: String, mínimo 3 caracteres, requerido
- `password`: String, mínimo 6 caracteres, requerido

---

## 📝 Ejemplos Completos

### **Flujo 1: Registro y Creación de Producto**

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

### **Flujo 2: Admin Gestiona Usuarios**

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

### **Flujo 3: Admin Modifica Productos de Otros Usuarios**

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

### **Flujo 4: Usuario Intenta Modificar Producto de Otro (Error)**

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

## 🧪 Testing en GraphQL Playground

### **1. Acceder al Playground**

```
http://localhost:3000/graphql
```

### **2. Estructura del Playground**

- **Panel izquierdo**: Escribe tus queries/mutations
- **Panel central**: Resultados de la ejecución
- **Panel derecho**: Documentación automática (Schema)
- **HTTP HEADERS**: Sección inferior para agregar headers

### **3. Configurar Autenticación**

Después de hacer login/signup, copia el token y agrégalo en **HTTP HEADERS**:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjMxMjM0NTY3LCJleHAiOjE2MzEyMzgxNjd9.xyz"
}
```

### **4. Explorar el Schema**

Haz clic en **"DOCS"** o **"SCHEMA"** en el panel derecho para ver:
- Todos los tipos disponibles
- Todas las queries disponibles
- Todas las mutations disponibles
- Descripción de cada campo

### **5. Autocompletado**

Presiona `Ctrl + Espacio` para ver sugerencias de campos y tipos mientras escribes.

---

## 📚 Inputs y Tipos Disponibles

### **Inputs**

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
  name: String!
  description: String
  price: Float!
  stock: Int
}

input UpdateProductInput {
  name: String
  description: String
  price: Float
  stock: Int
}

input PaginationInput {
  limit: Int  # Default: 10
  offset: Int  # Default: 0
}

input Verify2FAInput {
  token: String!
}
```

---

## 🔒 Matriz de Permisos

| Operación | Público | Usuario | Admin |
|-----------|---------|---------|-------|
| Ver productos | ✅ | ✅ | ✅ |
| Ver un producto | ✅ | ✅ | ✅ |
| Ver vendedores | ✅ | ✅ | ✅ |
| Ver perfil vendedor | ✅ | ✅ | ✅ |
| Ver mis productos | ❌ | ✅ | ✅ |
| Crear producto | ❌ | ✅ | ✅ |
| Actualizar mi producto | ❌ | ✅ | ✅ |
| Actualizar producto ajeno | ❌ | ❌ | ✅ |
| Eliminar mi producto | ❌ | ✅ | ✅ |
| Eliminar producto ajeno | ❌ | ❌ | ✅ |
| Ver un usuario | ❌ | ✅ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |
| Crear usuario | ❌ | ❌ | ✅ |
| Actualizar usuario | ❌ | ❌ | ✅ |
| Eliminar usuario | ❌ | ❌ | ✅ |
| Signup | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Habilitar 2FA | ❌ | ✅ | ✅ |

---

