const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['Trial', 'Active', 'Expired', 'Cancelled'],
      default: 'Trial',
    },
    trialExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 Days Free Trial
    },
    plan: {
      type: String,
      enum: ['Free Trial', 'Starter', 'Pro', 'Enterprise'],
      default: 'Free Trial',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);