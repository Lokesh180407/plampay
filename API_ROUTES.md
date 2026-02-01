# PlamPay API Routes Documentation

## Base URL
- **Local**: `http://192.168.1.132:3000`
- **Production**: `https://plampay.onrender.com` (Wait for real URL)

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

### Get Wallet Balance (Simple - JWT only)
```
GET /api/wallet/balance
Authorization: Bearer <token>
```
Returns balance without PIN verification. Use for dashboard display.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1000.50,
    "currency": "INR"
  }
}
```

### Demo Top Up (Alias for test-topup)
```
POST /api/wallet/demo-topup
Authorization: Bearer <token>
```
Same as test-topup. Adds demo money directly to wallet.

### Test Top Up Wallet (Bypass Razorpay)
```
POST /api/wallet/test-topup
Authorization: Bearer <token>
```
Use this for manual testing to add money directly to your account.

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
  "message": "Test top-up successful",
  "data": {
    "transactionId": "txn_uuid",
    "newBalance": 1500.50
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

## Mall Routes (No Authentication)

### Scan and Pay (Mall/Shop)
```
POST /api/mall/scan-pay
```
Used by mall/shop app to deduct payment via palm scan. Identifies user by phone and verifies palm match.

**Request Body:**
```json
{
  "phone": "+919876543210",
  "palm_bitmap": "base64-encoded-palm-image",
  "amount": 99.99
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "userId": "uuid",
    "transactionId": "uuid",
    "amount": 99.99,
    "newBalance": 900.51
  }
}
```

**Error Cases:** Palm not matched, user not found, KYC not completed, insufficient balance.

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

### Get All Users
```
GET /api/admin/users
Authorization: Bearer <admin-token>
```
Returns a list of all registered users, their KYC status, and wallet balance.

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "USER",
      "kycStatus": "PENDING",
      "palmRegistered": false,
      "createdAt": "2024-01-30T13:36:26.000Z",
      "updatedAt": "2024-01-30T13:36:26.000Z",
      "wallet": {
        "balance": "0.00",
        "currency": "INR"
      },
      "kyc": null
    }
  ]
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
curl http://192.168.1.132:3000/api/health
```

**Test Signup:**
```bash
curl -X POST http://192.168.1.132:3000/api/auth/signup \
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
curl -X POST http://192.168.1.132:3000/api/auth/login \
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
