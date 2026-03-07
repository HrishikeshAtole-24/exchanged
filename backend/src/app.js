const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middlewares/error.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');

// ── Route imports ──
const marketRoutes = require('./api/routes/market.routes');
const coinRoutes = require('./api/routes/coin.routes');
const exchangeRoutes = require('./api/routes/exchange.routes');
const portfolioRoutes = require('./api/routes/portfolio.routes');
const alertRoutes = require('./api/routes/alert.routes');
const authRoutes = require('./api/routes/auth.routes');

const app = express();

// ── Global middleware ──
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));
app.use(rateLimiter);

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'exchanged API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// ── API routes ──
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ── Global error handler ──
app.use(errorHandler);

module.exports = app;
