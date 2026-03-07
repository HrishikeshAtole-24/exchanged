const { Router } = require('express');
const AlertController = require('../controllers/alert.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();

// All alert routes require authentication
router.use(auth);

// GET    /api/alerts            — get user's alerts
router.get('/', AlertController.getAlerts);

// GET    /api/alerts/triggered   — get only triggered alerts
router.get('/triggered', AlertController.getTriggeredAlerts);

// POST   /api/alerts             — create new price alert
router.post('/', AlertController.createAlert);

// DELETE /api/alerts/:id — delete an alert
router.delete('/:id', AlertController.deleteAlert);

module.exports = router;
