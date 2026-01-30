# Deploying PlamPay to Render

This guide walks you through deploying the PlamPay backend to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- A PostgreSQL database (can be created on Render)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Create PostgreSQL Database

1. Log in to your Render dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `plampay-db`
   - **Database**: `plampay`
   - **User**: `plampay_user`
   - **Region**: Choose closest to your users (e.g., Oregon)
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

## Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your Git repository
3. Configure the service:
   - **Name**: `plampay-backend`
   - **Region**: Same as database (e.g., Oregon)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or specify if backend is in subfolder)
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     node src/server.js
     ```
   - **Plan**: Free (or paid for production)

## Step 3: Configure Environment Variables

In the **Environment** section, add these variables:

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `10000` | Render's default port |
| `DATABASE_URL` | `<Internal Database URL>` | From Step 1 |
| `JWT_SECRET` | `<random-string>` | Generate with: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `BCRYPT_SALT_ROUNDS` | `10` | Password hashing rounds |
| `PALM_EMBEDDING_KEY` | `<random-string>` | Generate with: `openssl rand -hex 32` |

### Payment Gateway Variables (if using Razorpay)

| Variable | Value | Notes |
|----------|-------|-------|
| `RAZORPAY_KEY_ID` | `<your-key-id>` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | `<your-key-secret>` | From Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | `<your-webhook-secret>` | From Razorpay dashboard |

### Generating Secrets

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate PALM_EMBEDDING_KEY
openssl rand -hex 32
```

## Step 4: Configure Health Check

1. In the service settings, find **Health Check Path**
2. Set it to: `/api/health`
3. This ensures Render knows your service is running correctly

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies (`npm install`)
   - Generate Prisma client (`npx prisma generate`)
   - Run database migrations (`npx prisma migrate deploy`)
   - Start the server (`node src/server.js`)

3. Monitor the deployment logs for any errors

## Step 6: Verify Deployment

Once deployed, test your endpoints:

### Test Health Check
```bash
curl https://your-app-name.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-30T...",
  "database": "connected"
}
```

### Test Root Endpoint
```bash
curl https://your-app-name.onrender.com/
```

Expected response:
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

### Test Auth Signup
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

## Troubleshooting

### Issue: "Route not found" for all routes

**Possible Causes:**
1. Server failed to start due to missing environment variables
2. Database connection failed
3. Build command failed

**Solutions:**
1. Check Render logs for startup errors
2. Verify all environment variables are set correctly
3. Ensure `DATABASE_URL` is the **Internal Database URL**
4. Check that Prisma migrations completed successfully

### Issue: Database connection failed

**Solutions:**
1. Use the **Internal Database URL** (not External)
2. Ensure database and web service are in the same region
3. Check database is running and accessible
4. Verify `DATABASE_URL` format:
   ```
   postgresql://user:password@host/database
   ```

### Issue: Build fails

**Solutions:**
1. Check that `package.json` includes all dependencies
2. Ensure Node version compatibility (check `engines` in package.json)
3. Verify Prisma schema is correct
4. Check build logs for specific errors

### Issue: Health check fails

**Solutions:**
1. Verify health check path is `/api/health`
2. Check that server is listening on `PORT` environment variable
3. Ensure database connection is working
4. Check server logs for errors

### Viewing Logs

1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Look for:
   - ✅ Database connected successfully
   - 🚀 Server listening on port 10000
   - ❤️ Health check: http://localhost:10000/api/health

## Post-Deployment Setup

### 1. Create Admin User

Run the admin seed script (you may need to do this locally with production DATABASE_URL):

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="<your-render-database-url>"

# Run admin seed
npm run seed:admin
```

### 2. Update CORS Settings (if needed)

If you have a frontend, update CORS in `src/app.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend.com'],
  credentials: true
}));
```

### 3. Set Up Custom Domain (Optional)

1. Go to service settings
2. Click **"Custom Domain"**
3. Add your domain and configure DNS

## Monitoring

### Check Service Health

Render provides:
- **Metrics**: CPU, Memory, Request count
- **Logs**: Real-time application logs
- **Alerts**: Set up notifications for downtime

### Set Up Alerts

1. Go to service settings
2. Click **"Notifications"**
3. Add email or Slack notifications for:
   - Deploy failures
   - Service crashes
   - High error rates

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will:
1. Pull latest code
2. Run build command
3. Run migrations
4. Restart service with zero downtime

## Environment-Specific Configuration

### Development
```bash
npm run dev
```

### Production (Render)
- Uses environment variables from Render dashboard
- Runs migrations automatically on deploy
- Serves on port 10000

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT_SECRET is strong and unique
- [ ] PALM_EMBEDDING_KEY is strong and unique
- [ ] Database uses strong password
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is configured for your frontend only
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active

## Cost Optimization

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free (enough for 1 service)

### Upgrading to Paid
- No spin-down
- Better performance
- More resources
- Custom domains included

## Support

If you encounter issues:
1. Check Render logs first
2. Review this troubleshooting guide
3. Check Render status page: https://status.render.com
4. Contact Render support: https://render.com/support

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [API Routes Documentation](./API_ROUTES.md)
