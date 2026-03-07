const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Redis (Upstash)
  upstash: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  },

  // Redis (BullMQ — Upstash always requires TLS)
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_HOST ? {} : undefined,
    maxRetriesPerRequest: null,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // CoinGecko
  coingecko: {
    baseUrl: process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  isDev() {
    return this.nodeEnv === 'development';
  },
  isProd() {
    return this.nodeEnv === 'production';
  },
};

module.exports = env;
