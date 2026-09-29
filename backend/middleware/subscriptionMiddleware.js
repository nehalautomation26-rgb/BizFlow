const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Active subscribers bypass trial checks
    if (user.subscriptionStatus === 'Active') {
      return next();
    }

    // Check if trial has passed limit
    const now = new Date();
    if (user.subscriptionStatus === 'Trial' && now > new Date(user.trialExpiresAt)) {
      user.subscriptionStatus = 'Expired';
      await user.save();
    }

    if (user.subscriptionStatus === 'Expired') {
      return res.status(403).json({
        message: 'Your 14-day trial period has expired. Please upgrade your plan to continue using BizFlow.',
        isExpired: true,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Subscription validation failed', error: error.message });
  }
};

module.exports = { checkSubscription };