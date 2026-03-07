const { query } = require('./neonClient');
const logger = require('../utils/logger');

const seed = async () => {
  logger.info('Seeding database...');

  // Seed some cached coins for reference
  const coins = [
    { coin_id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    { coin_id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    { coin_id: 'tether', symbol: 'usdt', name: 'Tether' },
    { coin_id: 'binancecoin', symbol: 'bnb', name: 'BNB' },
    { coin_id: 'solana', symbol: 'sol', name: 'Solana' },
    { coin_id: 'ripple', symbol: 'xrp', name: 'XRP' },
    { coin_id: 'cardano', symbol: 'ada', name: 'Cardano' },
    { coin_id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
    { coin_id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
    { coin_id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
  ];

  for (const coin of coins) {
    await query(
      `INSERT INTO cached_coins (coin_id, symbol, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (coin_id) DO UPDATE SET symbol = $2, name = $3, last_updated = NOW()`,
      [coin.coin_id, coin.symbol, coin.name]
    );
  }

  logger.info('Seed complete');
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err.message);
      process.exit(1);
    });
}

module.exports = { seed };
