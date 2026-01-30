# PlamPay API Routes Documentation

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-app.onrender.com`

## Public Routes (No Authentication Required)

### Root Endpoint
```
GET /
```
Returns API server information and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "PlamPay API Server is running",
  "endpoints": {
    "health": "/api/health",
    "docs": "/api/auth/login (Example)"
  }
}
```

### Health Check
```
GET /api/health
```
Check server and database health status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-30T13:36:26.000Z",
  "database": "connected"
}
```

---

## Authentication Routes

### User Signup
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "confirm_password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+1234567890"
    },
    "token": "jwt-token-here"
  }
}
```

### User Login
```
POST /api/auth/login
```

**Request Body (Email):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Body (Phone):**
```json
{
  "phone": "+1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

---

## KYC Routes (Authentication Required)

### Upload KYC Documents
```
POST /api/kyc/upload
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "aadhaar_image_url": "https://example.com/aadhaar.jpg",
  "pan_image_url": "https://example.com/pan.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "KYC documents uploaded successfully",
  "data": {
    "kyc_status": "pending"
  }
}
```

---

## Palm Biometric Routes (Authentication Required)

### Enroll Palm Print
```
POST /api/palm/enroll
Authorization: Bearer <token>
```

**Request Body (Embedding):**
```json
{
  "palm_embedding": [0.123, 0.456, 0.789, ...]
}
```

**Request Body (Bitmap):**
```json
{
  "palm_bitmap": "base64-encoded-image-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Palm enrolled successfully"
}
```

---

## Wallet Routes (Authentication Required)

### Set Wallet PIN
```
POST /api/wallet/set-pin
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet PIN set successfully"
}
```

### Verify Wallet PIN
```
POST /api/wallet/verify-pin
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN verified successfully"
}
```

### Get Wallet Balance
```
POST /api/wallet/balance
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1000.50
  }
}
```

### Top Up Wallet
```
POST /api/wallet/topup
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Razorpay order created",
  "data": {
    "order_id": "order_xyz123",
    "amount": 50000,
    "currency": "INR"
  }
}
```

### Payment Webhook
```
POST /api/wallet/webhook
```
Razorpay webhook endpoint for payment confirmations. No authentication required (verified via signature).

---

## Payment Routes (Terminal Authentication Required)

### Scan and Pay
```
POST /api/payment/scan-pay
```

**Request Body (Embedding):**
```json
{
  "terminal_id": "TERMINAL_001",
  "api_key": "terminal-api-key",
  "palm_embedding": [0.123, 0.456, ...],
  "amount": 99.99
}
```

**Request Body (Bitmap):**
```json
{
  "terminal_id": "TERMINAL_001",
  "api_key": "terminal-api-key",
  "palm_bitmap": "base64-encoded-image",
  "amount": 99.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "transaction_id": "txn_xyz",
    "amount": 99.99,
    "new_balance": 900.51
  }
}
```

---

## Admin Routes (Admin Authentication Required)

### Verify KYC
```
POST /api/admin/verify-kyc
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "decision": "approve"
}
```

**Response:**
```json
{
  "success": true,
  "message": "KYC approved successfully"
}
```

### Create Terminal
```
POST /api/admin/terminals
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "terminal_id": "TERMINAL_002",
  "api_key": "secure-api-key",
  "merchant": "Coffee Shop",
  "location": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Terminal created successfully",
  "data": {
    "terminal_id": "TERMINAL_002",
    "merchant": "Coffee Shop"
  }
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Route GET /api/invalid not found",
  "suggestion": "Check if the URL and HTTP method are correct"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "details": {
    "field": "email",
    "message": "must be a valid email"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing Routes

### Using cURL

**Test Health:**
```bash
curl https://your-app.onrender.com/api/health
```

**Test Signup:**
```bash
curl -X POST https://your-app.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

**Test Login:**
```bash
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman or Thunder Client

1. Import the base URL
2. Set up environment variables for tokens
3. Test each endpoint with the examples above
