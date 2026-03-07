const { marketQueue, trendingQueue, exchangeQueue, alertQueue } = require('./queue/bullmq');
const logger = require('./utils/logger');

// Load workers so they start processing
require('./workers/market.worker');
require('./workers/trending.worker');
require('./workers/exchange.worker');
require('./workers/alert.worker');

/**
 * Schedule repeating jobs.
 * BullMQ repeatable jobs are idempotent — safe to call on every server start.
 */
const startScheduler = async () => {
  try {
    // Market data → every 30 seconds
    await marketQueue.add('refresh-markets', {}, {
      repeat: { every: 30_000 },
      removeOnComplete: 5,
      removeOnFail: 10,
    });

    // Trending → every 2 minutes
    await trendingQueue.add('refresh-trending', {}, {
      repeat: { every: 120_000 },
      removeOnComplete: 5,
      removeOnFail: 10,
    });

    // Exchanges → every 10 minutes
    await exchangeQueue.add('refresh-exchanges', {}, {
      repeat: { every: 600_000 },
      removeOnComplete: 5,
      removeOnFail: 10,
    });

    // Alert checks → every 60 seconds
    await alertQueue.add('check-alerts', {}, {
      repeat: { every: 60_000 },
      removeOnComplete: 5,
      removeOnFail: 10,
    });

    logger.info('All repeating jobs scheduled');
  } catch (err) {
    logger.error(`Scheduler failed: ${err.message}`);
  }
};

module.exports = { startScheduler };
