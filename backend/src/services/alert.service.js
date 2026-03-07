const db = require('../database/neonClient');

const AlertService = {
  /**
   * Get all alerts for a user.
   */
  async getUserAlerts(userId) {
    return db.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  /**
   * Create a new price alert.
   */
  async createAlert(userId, { coinId, targetPrice, direction }) {
    const rows = await db.query(
      `INSERT INTO alerts (user_id, coin_id, target_price, direction)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, coinId, targetPrice, direction]
    );
    return rows[0];
  },

  /**
   * Delete an alert.
   */
  async deleteAlert(id, userId) {
    const rows = await db.query(
      'DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return rows[0] || null;
  },

  /**
   * Mark an alert as triggered.
   */
  async markTriggered(id) {
    await db.query(
      'UPDATE alerts SET triggered = TRUE WHERE id = $1',
      [id]
    );
  },

  /**
   * Get all active (non-triggered) alerts — used by the alert worker.
   */
  async getActiveAlerts() {
    return db.query(
      'SELECT * FROM alerts WHERE triggered = FALSE'
    );
  },

  /**
   * Get triggered alerts for a user — so they can see notifications.
   */
  async getTriggeredAlerts(userId) {
    return db.query(
      'SELECT * FROM alerts WHERE user_id = $1 AND triggered = TRUE ORDER BY created_at DESC',
      [userId]
    );
  },
};

module.exports = AlertService;
