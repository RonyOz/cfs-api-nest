# 🚀 Guía para Probar el Flujo de la App en GraphQL Playground

Esta guía te ayudará a probar el flujo completo de la aplicación utilizando **GraphQL Playground**.

---

## 📋 **Requisitos Previos**

1. **Servidor en Ejecución**:
   - Asegúrate de que el servidor esté corriendo en `http://localhost:3000`.

2. **Acceso a GraphQL Playground**:
   - Abre tu navegador y ve a: [http://localhost:3000/graphql](http://localhost:3000/graphql).

3. **Herramientas**:
   - Navegador web o cliente GraphQL como Insomnia o Postman (opcional).

---

## 🛠️ **Flujo Completo**

### 1. **Registro de Usuario (Signup)**

```graphql
mutation Signup {
  signup(input: {
    email: "testuser@example.com"
    username: "testuser"
    password: "password123"
  }) {
    message
    token
  }
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "signup": {
      "message": "Signup succesful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

- **Nota**: Copia el `token` para usarlo en las siguientes consultas.

---

### 2. **Inicio de Sesión (Login)**

```graphql
mutation Login {
  login(input: {
    email: "testuser@example.com"
    password: "password123"
  }) {
    message
    token
  }
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "login": {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

- **Nota**: Copia el `token` para usarlo en las siguientes consultas.

---

### 3. **Habilitar 2FA (Autenticación de Dos Factores)**

```graphql
mutation Enable2FA {
  enable2FA {
    secret
    qrCode
  }
}
```

- **Headers requeridos**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

- **Respuesta esperada**:
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

- **Nota**: Escanea el código QR con una app como Google Authenticator.

---

### 4. **Verificar y Activar 2FA**

```graphql
mutation Verify2FA {
  verify2FA(input: {
    token: "123456"
  }) {
    message
  }
}
```

- **Headers requeridos**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "verify2FA": {
      "message": "2FA enabled successfully"
    }
  }
}
```

---

### 5. **Obtener Perfil de Usuario**

```graphql
query GetUser {
  user(term: "testuser@example.com") {
    id
    email
    username
    role
    twoFactorEnabled
  }
}
```

- **Headers requeridos**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "testuser@example.com",
      "username": "testuser",
      "role": "user",
      "twoFactorEnabled": true
    }
  }
}
```

---

### 6. **Actualizar Usuario**

```graphql
mutation UpdateUser {
  updateUser(
    id: "uuid",
    input: {
      username: "updateduser"
      email: "updateduser@example.com"
    }
  ) {
    id
    email
    username
    role
  }
}
```

- **Headers requeridos**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "updateUser": {
      "id": "uuid",
      "email": "updateduser@example.com",
      "username": "updateduser",
      "role": "user"
    }
  }
}
```

---

### 7. **Eliminar Usuario**

```graphql
mutation DeleteUser {
  removeUser(id: "uuid")
}
```

- **Headers requeridos**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

- **Respuesta esperada**:
```json
{
  "data": {
    "removeUser": true
  }
}
```

---

## 🛡️ **Notas de Seguridad**

1. **Tokens**:
   - Asegúrate de proteger los tokens JWT.
   - No compartas tokens en público.

2. **Roles**:
   - Algunas operaciones requieren el rol `admin`.

3. **2FA**:
   - Habilitar 2FA mejora la seguridad de las cuentas.

---

## 🎯 **Próximos Pasos**

- Experimenta con las Queries y Mutations.
- Consulta la documentación generada automáticamente en el Playground.
- Integra estas operaciones en tu cliente frontend.

¡Disfruta explorando la API GraphQL! 🚀