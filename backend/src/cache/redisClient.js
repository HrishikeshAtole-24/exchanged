const { Redis } = require('@upstash/redis');
const env = require('../config/env');
const logger = require('../utils/logger');

let redis;

const getRedis = () => {
  if (!redis) {
    if (!env.upstash.url || !env.upstash.token) {
      logger.warn('Upstash credentials not set — cache will be disabled');
      return null;
    }
    redis = new Redis({
      url: env.upstash.url,
      token: env.upstash.token,
    });
    logger.info('Upstash Redis client initialized');
  }
  return redis;
};

module.exports = { getRedis };
