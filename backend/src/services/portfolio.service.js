const db = require('../database/neonClient');

const PortfolioService = {
  /**
   * Get all portfolio entries for a user.
   */
  async getUserPortfolio(userId) {
    return db.query(
      'SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  /**
   * Add a new coin to user's portfolio.
   */
  async addCoin(userId, { coinId, amount, buyPrice }) {
    const rows = await db.query(
      `INSERT INTO portfolios (user_id, coin_id, amount, buy_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, coinId, amount, buyPrice]
    );
    return rows[0];
  },

  /**
   * Update an existing portfolio entry.
   */
  async updateCoin(id, userId, { amount, buyPrice }) {
    const rows = await db.query(
      `UPDATE portfolios SET amount = $1, buy_price = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [amount, buyPrice, id, userId]
    );
    return rows[0] || null;
  },

  /**
   * Remove a coin from user's portfolio.
   */
  async removeCoin(id, userId) {
    const rows = await db.query(
      'DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return rows[0] || null;
  },
};

module.exports = PortfolioService;
