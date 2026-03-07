const db = require('../database/neonClient');

const PortfolioModel = {
  async findByUser(userId) {
    return db.query(
      'SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async create(userId, coinId, amount, buyPrice) {
    const rows = await db.query(
      `INSERT INTO portfolios (user_id, coin_id, amount, buy_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, coinId, amount, buyPrice]
    );
    return rows[0];
  },
};

module.exports = PortfolioModel;
