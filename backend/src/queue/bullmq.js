const { Queue } = require('bullmq');
const env = require('../config/env');
const logger = require('../utils/logger');

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: null,
  ...(env.redis.tls && { tls: env.redis.tls }),
};

const createQueue = (name) => {
  const queue = new Queue(name, { connection });
  logger.info(`BullMQ queue created: ${name}`);
  return queue;
};

// ── Named queues ──
const marketQueue = createQueue('market-updates');
const trendingQueue = createQueue('trending-updates');
const exchangeQueue = createQueue('exchange-updates');
const alertQueue = createQueue('alert-checks');

module.exports = {
  marketQueue,
  trendingQueue,
  exchangeQueue,
  alertQueue,
  connection,
};
