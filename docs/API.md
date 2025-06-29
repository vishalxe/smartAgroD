# AGRO-SMART API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

### User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

### User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

### Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "adminpass"
}
```

### Logout
**GET** `/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Products

### Get All Products
**GET** `/products`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "productName": "Fresh Tomatoes",
      "imageUrl": "/uploads/1234567890-tomatoes.jpg",
      "description": "Fresh organic tomatoes from local farms",
      "price": 45.99,
      "category": "vegetables",
      "unit": "kg",
      "stock": 100,
      "isAvailable": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Product by ID
**GET** `/products/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "productName": "Fresh Tomatoes",
    "imageUrl": "/uploads/1234567890-tomatoes.jpg",
    "description": "Fresh organic tomatoes from local farms",
    "price": 45.99,
    "category": "vegetables",
    "unit": "kg",
    "stock": 100,
    "isAvailable": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Products by Category
**GET** `/products/category/:category`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "productName": "Fresh Tomatoes",
      "imageUrl": "/uploads/1234567890-tomatoes.jpg",
      "description": "Fresh organic tomatoes from local farms",
      "price": 45.99,
      "category": "vegetables",
      "unit": "kg",
      "stock": 100,
      "isAvailable": true
    }
  ]
}
```

### Create Product (Admin Only)
**POST** `/products`

**Request Body (multipart/form-data):**
```
productName: Fresh Tomatoes
description: Fresh organic tomatoes from local farms
price: 45.99
category: vegetables
unit: kg
stock: 100
image: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "productName": "Fresh Tomatoes",
    "imageUrl": "/uploads/1234567890-tomatoes.jpg",
    "description": "Fresh organic tomatoes from local farms",
    "price": 45.99,
    "category": "vegetables",
    "unit": "kg",
    "stock": 100,
    "isAvailable": true
  }
}
```

### Update Product (Admin Only)
**PUT** `/products/:id`

**Request Body:**
```json
{
  "productName": "Updated Product Name",
  "description": "Updated description",
  "price": 50.99,
  "category": "fruits",
  "unit": "pieces",
  "stock": 75,
  "isAvailable": true
}
```

### Delete Product (Admin Only)
**DELETE** `/products/:id`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Payments

### Create Checkout Session
**POST** `/payments/create-session`

**Request Body:**
```json
{
  "amount": 150.50,
  "items": [
    {
      "name": "Fresh Tomatoes",
      "description": "Fresh organic tomatoes",
      "price": 45.99,
      "quantity": 2
    },
    {
      "name": "Organic Carrots",
      "description": "Fresh organic carrots",
      "price": 58.52,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_..."
}
```

## Availability

### Get Product Availability
**GET** `/availability/:product`

**Response:**
```json
{
  "product": "Mango",
  "availability": [
    {
      "date": "2025-05-19",
      "status": "available",
      "quantity": 50
    },
    {
      "date": "2025-05-24",
      "status": "coming",
      "quantity": 30
    }
  ]
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Product name is required",
    "Valid price is required"
  ]
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Product not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Categories

Available product categories:
- `fruits`
- `vegetables`
- `dairy`
- `grains`
- `herbs`
- `other`

## Units

Available product units:
- `kg` - Kilograms
- `g` - Grams
- `pieces` - Individual pieces
- `liters` - Liters
- `dozen` - Dozen

## Availability Status

Available status values:
- `available` - Product is available
- `coming` - Product will be available soon
- `not_available` - Product is not available 