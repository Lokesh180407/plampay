const http = require('http');
const app = require('./app');
const { logger } = require('./config/logger');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Test database connection on startup
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    server.listen(PORT, () => {
      logger.info(`🚀 Server listening on port ${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}/api`);
      logger.info(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error.message);
    logger.error('Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect().then(() => {
      logger.info('Database disconnected');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect().then(() => {
      logger.info('Database disconnected');
      process.exit(0);
    });
  });
});

