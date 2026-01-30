# PlamPay Backend

AI-powered palm payment system backend built with Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Features

- **Authentication**: JWT-based auth with signup/login
- **KYC System**: Document upload and admin verification
- **Palm Enrollment**: Secure storage of palm embeddings with AES encryption
- **Wallet System**: Balance management with PIN protection
- **Payment Gateway**: Razorpay integration for top-ups
- **Palm Payment**: Touchless payment via palm scan with 90% similarity threshold
- **Terminal Security**: API key authentication for payment terminals
- **Security**: bcrypt hashing, AES encryption, rate limiting, input validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Razorpay account (for payments)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd plampay
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with your Render PostgreSQL database. For local development or changing credentials, update `.env`:

**Production Database (Render example):**
```env
DATABASE_URL=postgresql://plampay_user:<PASSWORD>@dpg-d5u5cgchg0os73bpv0og-a.oregon-postgres.render.com/plampay
```

**Required Environment Variables:**

```env
DATABASE_URL=postgresql://plampay_user:<PASSWORD>@dpg-d5u5cgchg0os73bpv0og-a.oregon-postgres.render.com/plampay
JWT_SECRET=your-secret-key
PALM_EMBEDDING_KEY=your-32-byte-hex-key
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

**Generate Palm Embedding Key:**
```bash
openssl rand -hex 32
```

### 3. Database Setup

```bash
# Setup database (generates Prisma Client + runs migrations)
npm run setup

# Or manually:
npm run prisma:generate
npm run prisma:deploy
```

### 4. Seed Admin User (Optional)

```bash
npm run seed:admin
```

This creates an admin user:
- Email: `admin@plampay.com`
- Password: `Admin@123`

### 5. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 6. Verify Setup

Check health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
docker build -t plampay-backend .
docker run -p 3000:3000 --env-file .env plampay-backend
```

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securepassword",
  "confirm_password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+1234567890",
      "kycStatus": "PENDING",
      "palmRegistered": false
    },
    "token": "jwt-token"
  }
}
```

#### POST `/api/auth/login`
Login with email/phone and password.

**Request:**
```json
{
  "email": "user@example.com",  // OR "phone": "+1234567890"
  "password": "securepassword"
}
```

### KYC

#### POST `/api/kyc/upload`
Upload KYC documents (requires auth).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "aadhaar_image_url": "https://...",
  "pan_image_url": "https://..."
}
```

### Palm Enrollment

#### POST `/api/palm/enroll`
Enroll palm for payment (requires auth).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "palm_embedding": [0.123, 0.456, ...]  // Feature vector from Android SDK
}
```

**Note:** The Android app should use [Palmprint-Recognition-Android](https://github.com/kby-ai/Palmprint-Recognition-Android) SDK to extract embeddings on-device before sending to backend.

### Wallet

#### POST `/api/wallet/set-pin`
Set wallet PIN (requires auth).

**Request:**
```json
{
  "pin": "1234"
}
```

#### POST `/api/wallet/verify-pin`
Verify PIN (requires auth).

#### POST `/api/wallet/balance`
Get wallet balance (requires auth + PIN).

**Request Body:**
```json
{
  "pin": "1234"
}
```

#### POST `/api/wallet/topup`
Create top-up order with Razorpay (requires auth).

**Request:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "orderId": "razorpay_order_id",
    "amount": 1000,
    "currency": "INR",
    "keyId": "razorpay_key_id"
  }
}
```

### Payment

#### POST `/api/payment/scan-pay`
Process payment via palm scan (requires terminal auth).

**Headers:**
- `X-Terminal-ID: <terminal_id>` OR in body
- `X-API-Key: <api_key>` OR in body

**Request:**
```json
{
  "terminal_id": "TERM001",
  "api_key": "terminal-api-key",
  "palm_embedding": [0.123, 0.456, ...],
  "amount": 100.50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "userId": "uuid",
    "transactionId": "uuid",
    "newBalance": 899.50,
    "similarity": 0.95
  }
}
```

### Admin

#### POST `/api/admin/verify-kyc`
Verify KYC (requires admin auth).

**Request:**
```json
{
  "user_id": "uuid",
  "decision": "approve"  // or "reject"
}
```

#### POST `/api/admin/terminals`
Create payment terminal (requires admin auth).

**Request:**
```json
{
  "terminal_id": "TERM001",
  "api_key": "secure-api-key",
  "merchant": "Store Name",
  "location": "City, State"
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **PIN Protection**: bcrypt hashing for wallet PINs
- **Palm Encryption**: AES-256-GCM encryption for palm embeddings
- **JWT Authentication**: Secure token-based auth
- **Terminal Security**: API key hashing for payment terminals
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **HTTPS Ready**: Configure reverse proxy (nginx/traefik) in production

## 🏗️ Architecture

```
src/
├── config/          # Configuration (Prisma, Razorpay, Logger)
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── routes/          # Express route definitions
├── services/        # Business logic
├── utils/           # Utilities (crypto, palm helpers)
├── app.js           # Express app setup
└── server.js        # HTTP server
```

## 🧪 Testing Payment Flow

1. **Signup** → Get JWT token
2. **Set PIN** → Protect wallet
3. **Upload KYC** → Admin approves
4. **Enroll Palm** → Store encrypted embedding
5. **Top-up Wallet** → Add funds via Razorpay
6. **Scan & Pay** → Terminal scans palm, processes payment

## 🚢 Deployment

### Railway

1. Connect GitHub repo
2. Add environment variables
3. Railway auto-detects Dockerfile
4. Deploy!

### Render

1. Create new Web Service
2. Connect repo
3. Set build command: `npm install && npm run prisma:generate`
4. Set start command: `npm run prisma:deploy && npm start`
5. Add PostgreSQL database
6. Set environment variables

## 📝 Notes

- Palm embeddings are extracted on-device using the Android SDK
- Backend stores encrypted embeddings only (no raw images)
- Cosine similarity threshold: 90% (0.9) for palm matching
- KYC must be approved before payments
- Wallet PIN required for balance checks
- Terminal API keys are hashed with bcrypt

## 🔗 References

- [Palmprint Recognition Android SDK](https://github.com/kby-ai/Palmprint-Recognition-Android)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 📄 License

MIT
