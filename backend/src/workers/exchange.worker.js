const { Worker } = require('bullmq');
const { connection } = require('../queue/bullmq');
const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');
const logger = require('../utils/logger');

const aggregator = new MarketAggregator();

const exchangeWorker = new Worker(
  'exchange-updates',
  async () => {
    logger.info('[Worker] Refreshing exchange data...');
    const data = await aggregator.getExchanges({ perPage: 100, page: 1 });
    await cache.set('exchanges:100:1', data, cache.TTL.EXCHANGES);
    logger.info('[Worker] Exchange data refreshed');
  },
  { connection }
);

exchangeWorker.on('failed', (job, err) => {
  logger.error(`[Worker] exchange-updates job failed: ${err.message}`);
});

exchangeWorker.on('error', (err) => {
  logger.error(`[Worker] exchange-updates error: ${err.message}`);
});

module.exports = exchangeWorker;
