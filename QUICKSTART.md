# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database

The database is already configured in `.env`. Just run:

```bash
npm run setup
```

This will:
- Generate Prisma Client
- Run database migrations
- Create all tables

### Step 3: Start Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Step 4: Test API

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## 📝 Next Steps

1. **Set Wallet PIN:**
   ```bash
   curl -X POST http://localhost:3000/api/wallet/set-pin \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"pin": "1234"}'
   ```

2. **Enroll Palm:**
   ```bash
   curl -X POST http://localhost:3000/api/palm/enroll \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "palm_embedding": [0.123, 0.456, 0.789, ...]
     }'
   ```

3. **Upload KYC:**
   ```bash
   curl -X POST http://localhost:3000/api/kyc/upload \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "aadhaar_image_url": "https://...",
       "pan_image_url": "https://..."
     }'
   ```

## 🔑 Admin Access

Create admin user:
```bash
npm run seed:admin
```

Login with:
- Email: `admin@plampay.com`
- Password: `Admin@123`

## 📊 View Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

## 🐳 Docker

```bash
docker-compose up -d
```

## 📚 Full Documentation

See [README.md](./README.md) for complete API documentation.
