const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// @route   GET /api/analytics/overview
// @desc    Get aggregated metrics and performance insights
const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const ownerId = new mongoose.Types.ObjectId(userId);

    // 1. Total Revenue & Total Sales Count
    const totalSalesAgg = await Sale.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    const totalRevenue = totalSalesAgg[0]?.totalRevenue || 0;
    const totalOrders = totalSalesAgg[0]?.count || 0;

    // 2. Today's Revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySalesAgg = await Sale.aggregate([
      { $match: { owner: ownerId, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, todayRevenue: { $sum: '$totalAmount' } } },
    ]);

    const todayRevenue = todaySalesAgg[0]?.todayRevenue || 0;

    // 3. Low Stock & Inventory Counts
    const lowStockCount = await Product.countDocuments({ owner: userId, quantity: { $lte: 5 } });
    const totalProducts = await Product.countDocuments({ owner: userId });

    // 4. Customer & Booking Totals
    const totalCustomers = await Customer.countDocuments({ owner: userId });
    const pendingBookings = await Booking.countDocuments({ owner: userId, status: 'Pending' });

    // 5. Payment Method Distribution
    const paymentBreakdown = await Sale.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    // 6. Top Selling Products (Aggregated across sales items)
    const topProducts = await Sale.aggregate([
      { $match: { owner: ownerId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      totalRevenue,
      todayRevenue,
      totalOrders,
      lowStockCount,
      totalProducts,
      totalCustomers,
      pendingBookings,
      paymentBreakdown,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAnalyticsOverview,
};