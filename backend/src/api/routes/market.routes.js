const { Router } = require('express');
const MarketController = require('../controllers/market.controller');

const router = Router();

// GET /api/markets          — top coins by market cap
router.get('/', MarketController.getMarkets);

// GET /api/markets/trending — trending coins
router.get('/trending', MarketController.getTrending);

// GET /api/markets/global   — global crypto stats
router.get('/global', MarketController.getGlobalData);

// GET /api/markets/search?q=bitcoin
router.get('/search', MarketController.search);

module.exports = router;
