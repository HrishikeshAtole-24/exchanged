const { Router } = require('express');
const CoinController = require('../controllers/coin.controller');

const router = Router();

// GET /api/coins/:id        — coin details
router.get('/:id', CoinController.getCoinDetails);

// GET /api/coins/:id/chart  — price history chart data
router.get('/:id/chart', CoinController.getCoinMarketChart);

module.exports = router;
