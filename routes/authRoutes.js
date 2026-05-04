const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/** Smoke check: confirms /api/auth/register is mounted (use POST to create a user). */
router.get('/register', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth register route is active. POST JSON: { "email", "password", "name?" }',
  });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/signin', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
