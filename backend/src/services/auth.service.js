const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/neonClient');
const env = require('../config/env');

const SALT_ROUNDS = 12;

const AuthService = {
  /**
   * Register a new user.
   */
  async register(email, password) {
    // Check for existing user
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.length > 0) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const rows = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    const user = rows[0];
    const token = AuthService._generateToken(user.id);
    return { user, token };
  },

  /**
   * Login an existing user.
   */
  async login(email, password) {
    const rows = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const token = AuthService._generateToken(user.id);
    return {
      user: { id: user.id, email: user.email, created_at: user.created_at },
      token,
    };
  },

  _generateToken(userId) {
    return jwt.sign({ userId }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });
  },
};

module.exports = AuthService;
