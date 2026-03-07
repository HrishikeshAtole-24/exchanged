const { Worker } = require('bullmq');
const { connection } = require('../queue/bullmq');
const MarketAggregator = require('../aggregator/marketAggregator');
const cache = require('../cache/cacheManager');
const db = require('../database/neonClient');
const logger = require('../utils/logger');

const aggregator = new MarketAggregator();

const marketWorker = new Worker(
  'market-updates',
  async () => {
    logger.info('[Worker] Refreshing market data...');
    const data = await aggregator.getMarkets({ vsCurrency: 'usd', perPage: 100, page: 1 });
    await cache.set('market:top:usd:100:1', data, cache.TTL.MARKETS);

    // Persist top coins as market_snapshots for historical analytics
    try {
      const top10 = data.slice(0, 10);
      for (const coin of top10) {
        await db.query(
          `INSERT INTO market_snapshots (coin_id, price, market_cap, volume)
           VALUES ($1, $2, $3, $4)`,
          [coin.id, coin.current_price, coin.market_cap, coin.total_volume]
        );
      }
    } catch (err) {
      logger.warn(`[Worker] Snapshot persist failed: ${err.message}`);
    }

    logger.info('[Worker] Market data refreshed');
  },
  { connection }
);

marketWorker.on('failed', (job, err) => {
  logger.error(`[Worker] market-updates job failed: ${err.message}`);
});

marketWorker.on('error', (err) => {
  logger.error(`[Worker] market-updates error: ${err.message}`);
});

module.exports = marketWorker;
