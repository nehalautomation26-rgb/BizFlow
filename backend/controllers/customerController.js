const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

// @route   POST /api/customers
// @desc    Create a new customer profile
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    const existingCustomer = await Customer.findOne({ phone, owner: req.user.id });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this phone number already exists' });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      owner: req.user.id,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/customers
// @desc    Get all customers for logged-in user
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/customers/:id/history
// @desc    Get customer purchase history from Sales
const getCustomerHistory = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const sales = await Sale.find({
      owner: req.user.id,
      customerName: { $regex: new RegExp(`^${customer.name}$`, 'i') },
    }).sort({ createdAt: -1 });

    res.status(200).json({ customer, sales });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/customers/:id
// @desc    Delete a customer profile
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @route   POST /api/customers/:id/redeem
const redeemCustomerPoints = async (req, res) => {
  try {
    const points = Number(req.body.points);
    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive number of points' });
    }

    const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if ((customer.loyaltyPoints || 0) < points) {
      return res.status(400).json({ message: 'Insufficient loyalty point balance' });
    }

    customer.loyaltyPoints -= points;
    await customer.save();

    res.status(200).json({ message: 'Points redeemed successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = {
  createCustomer,
  getCustomers,
  getCustomerHistory,
  deleteCustomer,
  redeemCustomerPoints,
};