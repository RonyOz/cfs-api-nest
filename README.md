# Campus Food Sharing API (NestJS)

![NestJS](https://img.shields.io/badge/NestJS-Framework-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-ORM-orange)
![Coverage >80%](https://img.shields.io/badge/Coverage-%3E80%25-success?logo=jest)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-green?logo=swagger)
![GitHub Actions](https://img.shields.io/badge/CI-CD_Automation-black?logo=github)

> **Note:**
> This API was developed with **NestJS** and aims to facilitate the purchase and sale of food within a university campus, managing users, products, and orders with JWT authentication, role-based authorization, PostgreSQL persistence, and Swagger documentation.

> **GraphQL Implementation:**
> A GraphQL implementation of this API is available in the `graph` branch.

---

## Authors

* David Artunduaga ([@David104087](https://github.com/David104087))
* Jennifer Castro ([@JenniferCastrocd](https://github.com/JenniferCastrocd))
* Rony Ordoñez ([@RonyOz](https://github.com/RonyOz))
* Juan de la Pava ([@JuanJDlp](https://github.com/JuanJDlp))

---

## Deployment

The API was deployed at:

> [https://cfs-api.onrender.com/api-docs](https://cfs-api.onrender.com/api-docs)

---

## Campus Food Sharing — Nest.js

This repository includes modules for **auth**, **users**, **products**, and **orders**, a **TypeORM** configuration template, a **seed** endpoint, and a **GitHub Actions** workflow to run automated tests before deployment.

**Key Points:**

* API base path: `/api/v1`
* Swagger UI: `/api-docs`
* Seed endpoint (placeholder): `POST /api/v1/seed/run` — implements initial data loading to create an admin and example products.

**How to Run:**

1. Install dependencies:

   ```bash
   bun install
   # or
   npm install
   ```

2. Start the server in development mode:

   ```bash
   bun run start:dev
   # or
   npm run start:dev
   ```

3. Access Swagger UI:
   [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Main Features

1. **User Management:** Registration, authentication, and user profile administration.
2. **Defined Roles:** `buyer`, `seller`, and `admin` with differentiated permissions.
3. **JWT Authentication:** Route protection and user extraction from token.
4. **Products Module:** Creation, update, and deletion by sellers and administrators.
5. **Product Images:** Image upload to Supabase Storage via signed URLs.
6. **Orders Module:** Buyers can place orders and sellers manage their status.
7. **Atomic Transactions:** Ensure consistency when creating or canceling orders.
8. **Business Validations:** Prevents self-purchases, controls stock, and preserves historical prices.
9. **Automated Tests:** Coverage over 80% with Jest and Supertest.
10. **Complete Documentation:** Swagger (OpenAPI) available to visualize and test endpoints.
11. **CI/CD:** GitHub Actions runs tests before each push.

---

## Tech Stack

* **Backend:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Authentication:** JWT + Passport
* **Storage:** Supabase Storage
* **Testing:** Jest and Supertest
* **Documentation:** Swagger (OpenAPI)
* **Deployment:** Render
* **Continuous Integration:** GitHub Actions

---

## Getting Started

> **Tip:** Follow these steps to configure and run the project locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/) v18 or higher
* [Bun](https://bun.sh/) or npm
* [PostgreSQL](https://www.postgresql.org/)
* [Nest CLI](https://docs.nestjs.com/cli/overview)

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=cfs
TYPEORM_SYNCHRONIZE=true

# JWT
JWT_SECRET=secret_key

# Server
PORT=3000

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note:** To obtain Supabase credentials:
>
> 1. Go to your project in [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Settings > API
> 3. Copy the `URL` and the `service_role key` (DO NOT use the anon key for the backend)

### 3. Running

```bash
npm run start:dev
```

The server will run at [http://localhost:3000](http://localhost:3000).

---

## Tests

The API includes unit and integration tests that ensure the reliability of business logic.

```bash
npm run test:cov
```

> **Coverage:** over 80%.
> Tests include services, controllers, and business rule validations.

---

## API Documentation

Documentation is available at:

> [https://cfs-api.onrender.com/api-docs](https://cfs-api.onrender.com/api-docs)

---

## Endpoints Summary

<details>
<summary><strong>View main endpoints table</strong></summary>

The following shows a general description of the available endpoints.
For complete details on request bodies and responses, see the [Swagger documentation](https://cfs-api.onrender.com/api-docs).

### Auth

| Method   | Endpoint        | Description                                             | Access       |
| :------- | :-------------- | :------------------------------------------------------ | :----------- |
| `POST`   | `/auth/signup`  | Registers a new user (default role: `buyer`).           | Public       |
| `POST`   | `/auth/login`   | Logs in and returns a JWT token.                        | Public       |
| `GET`    | `/auth/profile` | Gets the authenticated user profile.                    | Authenticated|

---

### Users

| Method   | Endpoint      | Description                | Access        |
| :------- | :------------ | :------------------------- | :------------ |
| `GET`    | `/users`      | Lists all users.           | Admin         |
| `GET`    | `/users/{id}` | Gets a user by ID.         | Authenticated |
| `PUT`    | `/users/{id}` | Updates a user by ID.      | Authenticated |
| `DELETE` | `/users/{id}` | Deletes a user by ID.      | Admin         |

---

### Products

| Method   | Endpoint         | Description                     | Access        |
| :------- | :--------------- | :------------------------------ | :------------ |
| `GET`    | `/products`      | Lists all available products.   | Public        |
| `POST`   | `/products`      | Creates a new product.          | Seller, Admin |
| `GET`    | `/products/{id}` | Gets a product by ID.           | Public        |
| `PUT`    | `/products/{id}` | Updates a product by ID.        | Seller, Admin |
| `DELETE` | `/products/{id}` | Deletes a product by ID.        | Seller, Admin |

---

### Orders

| Method   | Endpoint              | Description                  | Access       |
| :------- | :-------------------- | :--------------------------- | :----------- |
| `GET`    | `/orders`             | Lists all orders.            | Admin        |
| `POST`   | `/orders`             | Creates a new order.         | Buyer        |
| `GET`    | `/orders/{id}`        | Gets an order by ID.         | Involved     |
| `PUT`    | `/orders/{id}/status` | Updates an order status.     | Seller, Admin|
| `DELETE` | `/orders/{id}`        | Cancels an order.            | Involved     |

---

### Seller

| Method | Endpoint       | Description                                          | Access |
| :----- | :------------- | :--------------------------------------------------- | :----- |
| `GET`  | `/seller`      | Lists all users with role that have products.        | Public |
| `GET`  | `/seller/{id}` | Gets the public profile of a seller.                 | Public |

---

### Admin

| Method | Endpoint      | Description                        | Access |
| :----- | :------------ | :--------------------------------- | :----- |
| `POST` | `/admin/user` | Creates a user with a specific role.| Admin  |

---

### Storage

| Method | Endpoint              | Description                                           | Access        |
| :----- | :-------------------- | :---------------------------------------------------- | :------------ |
| `POST` | `/storage/upload-url` | Generates a signed URL to upload product images.      | Authenticated |

</details>

---

### Example `Product` document (for `POST` / `PUT`)

```json
{
  "name": "Chicken Sandwich",
  "description": "Made with artisan bread and roasted chicken",
  "price": 12000,
  "stock": 10,
  "imageUrl": "https://xxx.supabase.co/storage/v1/object/public/product-images/products/1234567890-image.jpg"
}
```

### Example `Order` document (for `POST`)

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

---

## Image Upload Flow

To add images to products, follow this flow:

### 1. Request signed URL

```bash
POST /api/v1/storage/upload-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileName": "product.jpg"
}
```

**Response:**
```json
{
  "uploadUrl": "https://xxx.supabase.co/storage/v1/object/upload/sign/product-images/...",
  "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "path": "products/1234567890-product.jpg",
  "publicUrl": "https://xxx.supabase.co/storage/v1/object/public/product-images/products/1234567890-product.jpg"
}
```

### 2. Upload the image (Frontend)

```javascript
// Using Supabase SDK in the frontend
const { data, error } = await supabase.storage
  .from('product-images')
  .uploadToSignedUrl(path, token, file);
```

### 3. Create product with imageUrl

```bash
POST /api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Chicken Sandwich",
  "description": "Made with artisan bread and roasted chicken",
  "price": 12000,
  "stock": 10,
  "imageUrl": "https://xxx.supabase.co/storage/v1/object/public/product-images/products/1234567890-product.jpg"
}
```

### Supabase Bucket Configuration

1. Go to your project in Supabase Dashboard
2. Storage > Create new bucket
3. Name: `product-images`
4. Configuration:
   * Public: `true`
   * File size limit: `5MB`
   * Allowed MIME types: `image/*`
5. Configure security policies (RLS):
   * **INSERT**: Allow authenticated users
   * **SELECT**: Public

