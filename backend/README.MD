# Inventory Management System

Backend REST API for managing inventory and products.

## Setup

1. Clone and install:
```bash
git clone <repo-url>
cd inventory-management/backend
npm install
```

2. Create `.env` file:
```env
MONGODB_URI=url
JWT_SECRET=password
```

3. Start server:
```bash
npm run dev
```

Server runs on: `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /register` - Register user
- `POST /login` - Login user (returns JWT token)

### Products (requires Authorization header)
- `POST /products` - Add product
- `GET /products` - Get all products (supports pagination)
- `PUT /products/:id/quantity` - Update product quantity

## Usage Examples

### 1. Register User
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"username": "username", "password": "password"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "username", "password": "password"}'
```

### 3. Add Product (use token from login)
```bash
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Phone",
    "type": "Electronics", 
    "sku": "PHN-001",
    "quantity": 5,
    "price": 999.99
  }'
```

### 4. Get Products
```bash
curl -X GET http://localhost:8080/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Quantity
```bash
curl -X PUT http://localhost:8080/products/PRODUCT_ID/quantity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"quantity": 15}'
```



## Database Schema

**Users**: username, password, role, timestamps  
**Products**: name, type, sku, image_url, description, quantity, price, timestamps

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose  
- JWT Authentication
- bcrypt for password hashing