const express = require('express');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkSubscription);
router.route('/')
  .get(getBookings)
  .post(createBooking);

router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;