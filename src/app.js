require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { httpLogger } = require('./config/logger');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');

const app = express();

// Trust proxy for Render/proxies (required for express-rate-limit)
app.set('trust proxy', 1);

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (basic global limiter)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Logging
app.use(httpLogger);

// Basic root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PlamPay API Server is running',
    endpoints: {
      health: '/api/health',
      docs: '/api/auth/login (Example)'
    }
  });
});

// Mount routes
app.use('/api', routes);

// 404 & error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

