const { Router } = require('express');
const ExchangeController = require('../controllers/exchange.controller');

const router = Router();

// GET /api/exchanges      — list exchanges
router.get('/', ExchangeController.getExchanges);

// GET /api/exchanges/:id  — exchange details
router.get('/:id', ExchangeController.getExchangeDetails);

module.exports = router;
