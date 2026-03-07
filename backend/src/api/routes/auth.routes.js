const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// GET /api/auth/me — get current user profile (auth required)
router.get('/me', auth, AuthController.me);

module.exports = router;
