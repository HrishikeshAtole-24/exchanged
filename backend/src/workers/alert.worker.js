const { Worker } = require('bullmq');
const { connection } = require('../queue/bullmq');
const AlertService = require('../services/alert.service');
const MarketAggregator = require('../aggregator/marketAggregator');
const logger = require('../utils/logger');

const aggregator = new MarketAggregator();

const alertWorker = new Worker(
  'alert-checks',
  async () => {
    logger.info('[Worker] Checking price alerts...');
    const alerts = await AlertService.getActiveAlerts();
    if (!alerts.length) return;

    // Fetch current market data
    const markets = await aggregator.getMarkets({ vsCurrency: 'usd', perPage: 250, page: 1 });
    const priceMap = new Map(markets.map((c) => [c.id, c.current_price]));

    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.coin_id);
      if (!currentPrice) continue;

      const triggered =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (triggered) {
        await AlertService.markTriggered(alert.id);
        logger.info(
          `[Alert] Triggered: ${alert.coin_id} is ${alert.direction} ${alert.target_price} (current: ${currentPrice})`
        );
        // TODO: send notification (email / push) when notification service is added
      }
    }
    logger.info('[Worker] Alert check complete');
  },
  { connection }
);

alertWorker.on('failed', (job, err) => {
  logger.error(`[Worker] alert-checks job failed: ${err.message}`);
});

alertWorker.on('error', (err) => {
  logger.error(`[Worker] alert-checks error: ${err.message}`);
});

module.exports = alertWorker;
