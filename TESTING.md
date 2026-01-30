# Testing Your Render Deployment

## ⚠️ IMPORTANT: HTTP Methods Matter!

Your routes are **POST** routes, not **GET** routes!

### ❌ Wrong (will return 404):
```bash
curl https://your-app.onrender.com/api/auth/signup
# This is a GET request - won't work!
```

### ✅ Correct (will return 400 validation error):
```bash
curl -X POST https://your-app.onrender.com/api/auth/signup
# This is a POST request - will work!
```

---

## Quick Test Commands

### Test 1: Health Check (GET - should work)
```bash
curl https://your-app.onrender.com/api/health
```
**Expected:** `{"success":true,"status":"healthy",...}`

### Test 2: Root Endpoint (GET - should work)
```bash
curl https://your-app.onrender.com/
```
**Expected:** `{"success":true,"message":"PlamPay API Server is running",...}`

### Test 3: Signup (POST - should return validation error)
```bash
curl -X POST https://your-app.onrender.com/api/auth/signup \
  -H "Content-Type: application/json"
```
**Expected:** `{"success":false,"message":"Validation error",...}` (400 status)
**NOT Expected:** `{"success":false,"message":"Route not found"}` (404 status)

### Test 4: Login (POST - should return validation error)
```bash
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json"
```
**Expected:** `{"success":false,"message":"Validation error",...}` (400 status)

---

## Using the Test Script

### Test Locally:
```bash
npm start
# In another terminal:
node scripts/fast-verify.js
```

### Test Production:
```bash
TEST_URL=https://your-app.onrender.com node scripts/fast-verify.js
```

---

## Understanding the Responses

| Status | Meaning | Is it working? |
|--------|---------|----------------|
| 200 | Success | ✅ Yes |
| 400 | Validation error | ✅ Yes (route exists, just needs valid data) |
| 401 | Unauthorized | ✅ Yes (route exists, just needs auth token) |
| 404 with wrong method | Route not found | ✅ Yes (you used GET instead of POST) |
| 404 with correct method | Route not found | ❌ No (route is broken) |

---

## All Route Methods

| Route | Method | Auth Required |
|-------|--------|---------------|
| `/` | GET | No |
| `/api/health` | GET | No |
| `/api/auth/signup` | **POST** | No |
| `/api/auth/login` | **POST** | No |
| `/api/kyc/upload` | **POST** | Yes |
| `/api/palm/enroll` | **POST** | Yes |
| `/api/wallet/set-pin` | **POST** | Yes |
| `/api/wallet/verify-pin` | **POST** | Yes |
| `/api/wallet/balance` | **POST** | Yes |
| `/api/wallet/topup` | **POST** | Yes |
| `/api/wallet/webhook` | **POST** | No |
| `/api/payment/scan-pay` | **POST** | Yes (Terminal) |
| `/api/admin/verify-kyc` | **POST** | Yes (Admin) |
| `/api/admin/terminals` | **POST** | Yes (Admin) |

---

## Common Mistakes

### ❌ Mistake 1: Using GET instead of POST
```bash
curl https://your-app.onrender.com/api/auth/signup
```
This will return 404 because signup is POST only!

### ✅ Fix: Use POST
```bash
curl -X POST https://your-app.onrender.com/api/auth/signup
```

### ❌ Mistake 2: Testing in browser address bar
Browser address bar = GET request
Most API routes = POST request

### ✅ Fix: Use Postman, Thunder Client, or curl

---

## If Routes Still Don't Work

1. **Check Render Logs**
   - Look for "Database connected successfully"
   - Look for "Server listening on port 10000"

2. **Verify Environment Variables**
   - DATABASE_URL is set
   - JWT_SECRET is set
   - All required vars are present

3. **Check Build Logs**
   - npm install succeeded
   - prisma generate succeeded
   - prisma migrate deploy succeeded

4. **Test with the script**
   ```bash
   TEST_URL=https://your-app.onrender.com node scripts/fast-verify.js
   ```
