const express = require('express');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkSubscription);

router.get('/overview', getAnalyticsOverview);

module.exports = router;