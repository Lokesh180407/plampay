const { logger } = require('../config/logger');

function notFoundHandler(req, res, next) {
  const availableRoutes = [
    'GET /',
    'GET /api/health',
    'POST /api/auth/signup',
    'POST /api/auth/login',
    'POST /api/kyc/upload',
    'POST /api/palm/enroll',
    'POST /api/wallet/set-pin',
    'POST /api/wallet/verify-pin',
    'POST /api/wallet/balance',
    'POST /api/wallet/topup',
    'POST /api/wallet/webhook',
    'POST /api/payment/scan-pay',
    'POST /api/admin/verify-kyc',
    'POST /api/admin/terminals',
  ];

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: req.originalUrl.startsWith('/api')
      ? 'Check if the URL and HTTP method are correct'
      : 'Try prefixing the path with /api',
    availableRoutes: availableRoutes,
    requestedRoute: `${req.method} ${req.originalUrl}`,
  });
}

// Central error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message || err);

  const status = err.statusCode || 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Request failed';

  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

