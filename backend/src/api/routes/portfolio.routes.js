const { Router } = require('express');
const PortfolioController = require('../controllers/portfolio.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();

// All portfolio routes require authentication
router.use(auth);

// GET    /api/portfolio       — get user's portfolio
router.get('/', PortfolioController.getPortfolio);

// POST   /api/portfolio       — add coin to portfolio
router.post('/', PortfolioController.addCoin);

// PUT    /api/portfolio/:id   — update portfolio entry
router.put('/:id', PortfolioController.updateCoin);

// DELETE /api/portfolio/:id   — remove coin from portfolio
router.delete('/:id', PortfolioController.removeCoin);

module.exports = router;
