const { query } = require('./neonClient');
const logger = require('../utils/logger');

const migrations = [
  // ── users ──
  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );`,

  // ── cached_coins (reference data) ──
  `CREATE TABLE IF NOT EXISTS cached_coins (
    coin_id      VARCHAR(100) PRIMARY KEY,
    symbol       VARCHAR(20) NOT NULL,
    name         VARCHAR(255) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
  );`,

  // ── portfolios ──
  `CREATE TABLE IF NOT EXISTS portfolios (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    coin_id    VARCHAR(100) NOT NULL,
    amount     NUMERIC(20,8) NOT NULL DEFAULT 0,
    buy_price  NUMERIC(20,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // ── alerts ──
  `CREATE TABLE IF NOT EXISTS alerts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
    coin_id      VARCHAR(100) NOT NULL,
    target_price NUMERIC(20,8) NOT NULL,
    direction    VARCHAR(10) NOT NULL CHECK (direction IN ('above', 'below')),
    triggered    BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  );`,

  // ── market_snapshots (time-series) ──
  `CREATE TABLE IF NOT EXISTS market_snapshots (
    id         SERIAL PRIMARY KEY,
    coin_id    VARCHAR(100) NOT NULL,
    price      NUMERIC(20,8) NOT NULL,
    market_cap NUMERIC(30,2),
    volume     NUMERIC(30,2),
    timestamp  TIMESTAMPTZ DEFAULT NOW()
  );`,

  // ── indexes ──
  `CREATE INDEX IF NOT EXISTS idx_portfolios_user   ON portfolios(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_user        ON alerts(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_snapshots_coin_ts  ON market_snapshots(coin_id, timestamp DESC);`,
];

const migrate = async () => {
  logger.info('Running database migrations...');
  for (const sql of migrations) {
    try {
      await query(sql);
    } catch (err) {
      logger.error(`Migration failed: ${err.message}`);
      throw err;
    }
  }
  logger.info('All migrations applied successfully');
};

// Run directly: node src/database/migrate.js
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrate };
