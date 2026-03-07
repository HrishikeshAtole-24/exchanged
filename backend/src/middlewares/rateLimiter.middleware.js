const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

module.exports = rateLimiter;
