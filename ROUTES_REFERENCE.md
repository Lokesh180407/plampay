# Quick Reference: All PlamPay API Endpoints

## ✅ All Available Routes

### Public Routes (No Auth)
- `GET /` - API server info
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### KYC (Requires Auth)
- `POST /api/kyc/upload` - Upload KYC documents

### Palm Biometric (Requires Auth)
- `POST /api/palm/enroll` - Enroll palm print

### Wallet (Requires Auth)
- `POST /api/wallet/set-pin` - Set wallet PIN
- `POST /api/wallet/verify-pin` - Verify wallet PIN
- `POST /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/topup` - Top up wallet
- `POST /api/wallet/webhook` - Payment webhook (no auth)

### Payment (Requires Terminal Auth)
- `POST /api/payment/scan-pay` - Process palm payment

### Admin (Requires Admin Auth)
- `POST /api/admin/verify-kyc` - Approve/reject KYC
- `POST /api/admin/terminals` - Create payment terminal

---

## 🚀 Quick Test Commands

### Test Production Health
```bash
curl https://your-app.onrender.com/api/health
```

### Test Production Root
```bash
curl https://your-app.onrender.com/
```

### Test Signup
```bash
curl -X POST https://your-app.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+1234567890","password":"pass123","confirm_password":"pass123"}'
```

---

## 📋 Deployment Checklist

### Before Deploying
- [ ] Push code to Git repository
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL

### During Deployment
- [ ] Set all environment variables (see DEPLOYMENT.md)
- [ ] Set build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- [ ] Set start command: `node src/server.js`
- [ ] Set health check path: `/api/health`

### After Deployment
- [ ] Test health endpoint
- [ ] Test root endpoint
- [ ] Test signup endpoint
- [ ] Check Render logs for errors
- [ ] Verify database connection message

---

## 🔧 Troubleshooting "Route not found"

If you see `{"success":false,"message":"Route not found"}`:

1. **Check Render Logs**
   - Look for "Database connected successfully"
   - Look for "Server listening on port 10000"
   - Check for any startup errors

2. **Verify Environment Variables**
   - `DATABASE_URL` is set (Internal URL)
   - `JWT_SECRET` is set
   - `PALM_EMBEDDING_KEY` is set
   - `NODE_ENV=production`

3. **Check Build Logs**
   - Ensure `npm install` succeeded
   - Ensure `prisma generate` succeeded
   - Ensure `prisma migrate deploy` succeeded

4. **Test Specific Endpoints**
   ```bash
   # Should return server info
   curl https://your-app.onrender.com/
   
   # Should return health status
   curl https://your-app.onrender.com/api/health
   
   # Should return validation error (not 404)
   curl -X POST https://your-app.onrender.com/api/auth/signup
   ```

---

## 📚 Full Documentation

- **API Routes**: See [API_ROUTES.md](./API_ROUTES.md)
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md)

---

## 🎯 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| All routes return 404 | Server didn't start - check logs for database connection error |
| Health check fails | Database URL incorrect or database not accessible |
| Build fails | Check Prisma schema or missing dependencies |
| Routes work locally but not on Render | Environment variables not set correctly |

---

## ✨ What Was Fixed

1. **Created `render.yaml`** - Proper Render deployment configuration
2. **Enhanced Error Handler** - Now shows all available routes when 404 occurs
3. **Added Route Documentation** - Complete API reference
4. **Added Deployment Guide** - Step-by-step Render setup
5. **Created Verification Script** - Test all routes automatically

All routes are properly configured in your backend. The issue was deployment configuration, not the routes themselves!
