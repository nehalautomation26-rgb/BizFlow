const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateSubscription, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/subscribe', protect, updateSubscription);
router.put('/me', protect, updateUserProfile);

module.exports = router;