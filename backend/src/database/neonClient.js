const { neon } = require('@neondatabase/serverless');
const env = require('../config/env');
const logger = require('../utils/logger');

let sql;

const getClient = () => {
  if (!sql) {
    if (!env.databaseUrl) {
      logger.warn('DATABASE_URL not set — database queries will fail');
      return null;
    }
    sql = neon(env.databaseUrl);
    logger.info('Neon PostgreSQL client initialized');
  }
  return sql;
};

/**
 * Execute a parameterized query against Neon.
 * Always use parameterized queries to prevent SQL injection.
 */
const query = async (text, params = []) => {
  const client = getClient();
  if (!client) throw new Error('Database not configured');
  try {
    const result = await client(text, params);
    return result;
  } catch (err) {
    logger.error(`DB query failed: ${err.message}`);
    throw err;
  }
};

/**
 * Health check — verifies the database connection.
 */
const ping = async () => {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

module.exports = { query, ping, getClient };
