const express = require('express');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerHistory,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { redeemCustomerPoints } = require('../controllers/customerController');
router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.get('/:id/history', getCustomerHistory);
router.delete('/:id', deleteCustomer);
router.post('/:id/redeem', redeemCustomerPoints);

module.exports = router;