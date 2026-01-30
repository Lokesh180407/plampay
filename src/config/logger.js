const morgan = require('morgan');

// Simple console logger wrapper; can be replaced with Winston in production
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
};

const httpLogger = morgan('combined');

module.exports = {
  logger,
  httpLogger,
};

