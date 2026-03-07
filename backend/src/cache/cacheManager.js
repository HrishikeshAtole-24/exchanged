const { getRedis } = require('./redisClient');
const logger = require('../utils/logger');

/** TTL values (seconds) for each data domain */
const TTL = {
  MARKETS: 30,
  COIN_DETAILS: 300,    // 5 min
  TRENDING: 120,        // 2 min
  EXCHANGES: 600,       // 10 min
  CHART: 300,           // 5 min
};

/**
 * Get cached value — returns parsed JSON or null.
 */
const get = async (key) => {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ?? null;
  } catch (err) {
    logger.error(`Cache GET error [${key}]: ${err.message}`);
    return null;
  }
};

/**
 * Set cached value with TTL.
 */
const set = async (key, value, ttlSeconds) => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    logger.error(`Cache SET error [${key}]: ${err.message}`);
  }
};

/**
 * Delete a cached key.
 */
const del = async (key) => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    logger.error(`Cache DEL error [${key}]: ${err.message}`);
  }
};

/**
 * Cache-aside helper.
 * Returns cached data if available, otherwise calls fetchFn and caches the result.
 */
const cacheAside = async (key, ttlSeconds, fetchFn) => {
  const cached = await get(key);
  if (cached !== null && cached !== undefined) {
    logger.debug(`Cache HIT: ${key}`);
    // Upstash auto-deserializes JSON — return as-is
    return cached;
  }
  logger.debug(`Cache MISS: ${key}`);
  const freshData = await fetchFn();
  await set(key, freshData, ttlSeconds);
  return freshData;
};

module.exports = { get, set, del, cacheAside, TTL };
