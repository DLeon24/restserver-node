# restserver-node

A RESTful API built with Node.js, Express, and MongoDB for managing users, products, and categories. It features JWT-based authentication, Google OAuth2 sign-in, role-based access control, and image upload capabilities.

## Table of Contents

- [Technical Description](#technical-description)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Categories](#categories)
  - [Products](#products)
  - [File Upload](#file-upload)
  - [Image Retrieval](#image-retrieval)
- [Usage Examples](#usage-examples)
- [Security Considerations](#security-considerations)

## Technical Description

This is a monolithic REST API that exposes CRUD endpoints for three core domain entities: **Users**, **Products**, and **Categories**. Authentication is handled through JSON Web Tokens (JWT), with support for both email/password credentials and Google OAuth2 sign-in. The API enforces role-based access control with two roles (`ADMIN_ROLE` and `USER_ROLE`) and implements a soft-delete strategy — records are marked as inactive rather than permanently removed from the database. File uploads are supported for user avatars and product images, with server-side validation for type and extension.

## Architecture

```
┌──────────────┐       ┌──────────────────────────────────────────┐       ┌───────────┐
│              │       │            Express Server                │       │           │
│   Client     │ HTTP  │                                          │       │  MongoDB  │
│  (Browser /  │──────▶│  Middleware ──▶ Routes ──▶ Models (ODM)  │──────▶│           │
│   Postman)   │◀──────│  (auth, body-parser, file-upload)        │◀──────│           │
│              │       │                                          │       │           │
└──────────────┘       └──────────────────────────────────────────┘       └───────────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │  File System   │
                                │  (uploads/)    │
                                └───────────────┘
```

This is a **monolithic** application with a single Express process. There are no microservices, message queues, or event-driven patterns in the current implementation. The architecture follows a layered approach:

| Layer | Responsibility | Location |
|---|---|---|
| **Routes** | HTTP method handling, request validation, response formatting | `server/routes/` |
| **Models** | Data schema definition, validation rules, Mongoose ODM | `server/models/` |
| **Middleware** | JWT verification, role authorization | `server/middlewares/` |
| **Config** | Environment variables and defaults | `server/config/` |

> **Assumption:** In production, the `MONGO_URI` environment variable is expected to point to a managed MongoDB instance (e.g., MongoDB Atlas), though this is not explicitly configured in the codebase.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 4** | HTTP framework and routing |
| **MongoDB** | NoSQL document database |
| **Mongoose 5** | MongoDB ODM (Object Data Modeling) |
| **JSON Web Tokens** | Stateless authentication (`jsonwebtoken`) |
| **bcryptjs** | Password hashing |
| **Google Auth Library** | Google OAuth2 token verification |
| **express-fileupload** | Multipart file upload handling |
| **Underscore.js** | Utility library (request body whitelisting) |

## Project Structure

```
restserver-node/
├── public/
│   └── index.html              # Google Sign-In demo page
├── server/
│   ├── assets/
│   │   └── image-not-found.jpg # Fallback image for missing files
│   ├── config/
│   │   └── config.js           # Environment variable defaults
│   ├── middlewares/
│   │   └── authentication.js   # JWT validation and role check
│   ├── models/
│   │   ├── category.js         # Category schema
│   │   ├── product.js          # Product schema
│   │   └── user.js             # User schema
│   ├── routes/
│   │   ├── category.js         # CRUD /category
│   │   ├── image.js            # GET /image/:type/:image
│   │   ├── index.js            # Route aggregator
│   │   ├── login.js            # POST /login, POST /google
│   │   ├── product.js          # CRUD /product
│   │   ├── upload.js           # PUT /upload/:type/:id
│   │   └── user.js             # CRUD /user
│   └── server.js               # Application entry point
├── uploads/
│   ├── products/               # Uploaded product images
│   └── users/                  # Uploaded user avatars
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- **Node.js** >= 14.x
- **MongoDB** >= 4.x (running locally or a remote instance)

For local development, you can start MongoDB with Docker:

```bash
docker run -d --name mongo-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=123 \
  mongo:4.4
```

## Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/restserver-node.git
cd restserver-node

# Install dependencies
npm install
```

## Configuration

The application reads environment variables with fallback defaults defined in `server/config/config.js`:

| Variable | Default (dev) | Description |
|---|---|---|
| `PORT` | `3000` | Server listening port |
| `NODE_ENV` | `dev` | Environment (`dev` or `production`) |
| `MONGO_URI` | — | MongoDB connection string (production only) |
| `SEED` | `this-is-the-dev-seed` | Secret key for JWT signing |
| `EXPIRATION_TOKEN` | `48h` | JWT token expiration time |
| `CLIENT_ID` | *(Google OAuth2 client ID)* | Google Sign-In client ID |

In development mode (`NODE_ENV=dev`), the database connection defaults to:

```
mongodb://root:123@localhost:27017/cafe?authSource=admin
```

For production, set these environment variables before starting the server:

```bash
export NODE_ENV=production
export MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
export SEED=your-production-secret-key
export CLIENT_ID=your-google-client-id
```

## Running the Server

```bash
# Start the server
npm start

# Expected output:
# Listen on port:3000
# Database online
```

The server will be available at `http://localhost:3000`.

## API Reference

All protected endpoints require a valid JWT token in the `Authorization` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | No | Authenticate with email and password |
| `POST` | `/google` | No | Authenticate with Google OAuth2 token |

### Users

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/user?from=0&limit=5` | Token | Any | List active users (paginated) |
| `POST` | `/user` | Token | Admin | Create a new user |
| `PUT` | `/user/:id` | Token | Admin | Update user fields |
| `DELETE` | `/user/:id` | Token | Admin | Soft-delete user (sets `status: false`) |

### Categories

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/category` | Token | Any | List all categories |
| `GET` | `/category/:id` | Token | Any | Get a category by ID |
| `POST` | `/category` | Token | Any | Create a new category |
| `PUT` | `/category/:id` | Token | Any | Update category description |
| `DELETE` | `/category/:id` | Token | Admin | Permanently remove a category |

### Products

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/product?from=0&limit=5` | Token | Any | List available products (paginated) |
| `GET` | `/product/:id` | Token | Any | Get a product by ID |
| `GET` | `/product/find/:term` | Token | Any | Search products by name (regex) |
| `POST` | `/product` | Token | Any | Create a new product |
| `PUT` | `/product/:id` | Token | Any | Update product fields |
| `DELETE` | `/product/:id` | Token | Any | Soft-delete product (sets `available: false`) |

### File Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `PUT` | `/upload/:type/:id` | No* | Upload an image for a user or product |

`type` must be `users` or `products`. Allowed extensions: `png`, `jpg`, `gif`, `jpeg`.

> *\*Assumption: This endpoint currently has no authentication middleware. Consider adding `validateToken` for production use.*

### Image Retrieval

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/image/:type/:image?token=<jwt>` | Token (query) | Retrieve an uploaded image |

This endpoint validates the JWT via query parameter instead of the `Authorization` header. Returns a fallback image if the file does not exist.

## Usage Examples

### 1. Login and obtain a token

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

**Response:**

```json
{
  "ok": true,
  "user": {
    "role": "ADMIN_ROLE",
    "status": true,
    "google": false,
    "_id": "64a...",
    "name": "Admin",
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Create a user (Admin only)

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -H "Authorization: <your-jwt-token>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePass123",
    "role": "USER_ROLE"
  }'
```

### 3. List users with pagination

```bash
curl http://localhost:3000/user?from=0&limit=10 \
  -H "Authorization: <your-jwt-token>"
```

### 4. Create a category

```bash
curl -X POST http://localhost:3000/category \
  -H "Content-Type: application/json" \
  -H "Authorization: <your-jwt-token>" \
  -d '{
    "description": "Electronics"
  }'
```

### 5. Create a product

```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -H "Authorization: <your-jwt-token>" \
  -d '{
    "name": "Wireless Mouse",
    "unitPrice": 29.99,
    "description": "Ergonomic wireless mouse",
    "category": "<category-id>"
  }'
```

### 6. Search products by name

```bash
curl http://localhost:3000/product/find/mouse \
  -H "Authorization: <your-jwt-token>"
```

### 7. Upload a product image

```bash
curl -X PUT http://localhost:3000/upload/products/<product-id> \
  -F "file=@/path/to/image.jpg"
```

### 8. Retrieve an image

```bash
curl http://localhost:3000/image/products/<filename>?token=<your-jwt-token> \
  --output image.jpg
```

## Security Considerations

| Area | Current State | Recommendation |
|---|---|---|
| **Password hashing** | bcryptjs with salt rounds of 10 | Adequate for most use cases |
| **JWT secret** | Hardcoded fallback in dev (`this-is-the-dev-seed`) | Use a strong, unique secret via environment variable in production |
| **Token expiration** | Set to 48 hours | Consider shorter expiration (1-4h) with refresh token rotation |
| **Upload endpoint** | No authentication middleware | Add `validateToken` to prevent unauthorized uploads |
| **Role check on delete** | Missing `validateAdminRole` on product delete | Add admin validation to prevent unauthorized deletions |
| **Password in `toJSON`** | Excluded via `toJSON` override on User model | Good practice; password is never returned in responses |
| **Input whitelisting** | User update uses `_.pick()` to whitelist fields | Good practice; prevents mass-assignment attacks |
| **Soft delete** | Users and products use soft delete; categories use hard delete | Consider making category deletion consistent (soft delete) |
| **CORS** | Not configured | Add CORS middleware if the API will be consumed by external clients |
| **Rate limiting** | Not implemented | Consider adding `express-rate-limit` to protect against brute-force attacks |
| **HTTPS** | Not enforced | Always use HTTPS in production (handled at reverse proxy or cloud level) |
