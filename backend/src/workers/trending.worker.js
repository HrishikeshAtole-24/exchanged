const { Worker } = require('bullmq');
const { connection } = require('../queue/bullmq');
const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');
const logger = require('../utils/logger');

const aggregator = new MarketAggregator();

const trendingWorker = new Worker(
  'trending-updates',
  async () => {
    logger.info('[Worker] Refreshing trending data...');
    const data = await aggregator.getTrending();
    await cache.set('trending:coins', data, cache.TTL.TRENDING);
    logger.info('[Worker] Trending data refreshed');
  },
  { connection }
);

trendingWorker.on('failed', (job, err) => {
  logger.error(`[Worker] trending-updates job failed: ${err.message}`);
});

trendingWorker.on('error', (err) => {
  logger.error(`[Worker] trending-updates error: ${err.message}`);
});

module.exports = trendingWorker;
