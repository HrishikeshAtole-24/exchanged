const db = require('../database/neonClient');

const UserModel = {
  async findById(id) {
    const rows = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const rows = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },
};

module.exports = UserModel;
