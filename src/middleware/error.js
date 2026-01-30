const { logger } = require('../config/logger');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
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

