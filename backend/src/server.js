const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { startScheduler } = require('./scheduler');

const PORT = env.port;
let server;

const start = async () => {
  try {
    // Start background job scheduler (if Redis is configured)
    if (env.redis.host) {
      startScheduler();
      logger.info('Background job scheduler started');
    } else {
      logger.warn('Redis not configured — background workers disabled');
    }

    server = app.listen(PORT, () => {
      logger.info(`🚀 exchanged API running on port ${PORT} [${env.nodeEnv}]`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
