const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  businessName: user.businessName,
  subscriptionStatus: user.subscriptionStatus,
  trialExpiresAt: user.trialExpiresAt,
  plan: user.plan,
});

// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 14-day trial comes from the User model defaults
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      businessName,
    });

    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.subscriptionStatus === 'Trial' && new Date() > new Date(user.trialExpiresAt)) {
      user.subscriptionStatus = 'Expired';
      await user.save();
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/subscribe
// TESTING ONLY: upgrades the plan without any payment
const updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const allowedPlans = ['Starter', 'Pro', 'Enterprise'];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plan = plan;
    user.subscriptionStatus = 'Active';
    await user.save();

    res.status(200).json({
      message: `Successfully upgraded to ${plan} plan!`,
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @route   PUT /api/auth/me
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.businessName = req.body.businessName || user.businessName;
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        subscriptionStatus: user.subscriptionStatus,
        trialExpiresAt: user.trialExpiresAt,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = { signup, login, getMe, updateSubscription, updateUserProfile };