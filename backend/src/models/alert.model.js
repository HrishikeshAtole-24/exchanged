const db = require('../database/neonClient');

const AlertModel = {
  async findByUser(userId) {
    return db.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async create(userId, coinId, targetPrice, direction) {
    const rows = await db.query(
      `INSERT INTO alerts (user_id, coin_id, target_price, direction)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, coinId, targetPrice, direction]
    );
    return rows[0];
  },
};

module.exports = AlertModel;
