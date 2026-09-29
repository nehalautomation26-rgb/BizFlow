const express = require('express');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const router = express.Router();
const { processSale, getSalesHistory, getReceipt } = require('../controllers/posController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkSubscription);

router.post('/checkout', processSale);
router.get('/sales', getSalesHistory);
router.get('/receipt/:id', getReceipt);

module.exports = router;