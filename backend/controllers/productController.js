const Product = require('../models/Product');

// @route   POST /api/products
// @desc    Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      owner: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/products
// @desc    Get all products for the logged-in user
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/products/low-stock
// @desc    Get low stock products (quantity < 5)
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      owner: req.user.id,
      quantity: { $lt: 5 },
    }).sort({ quantity: 1 });

    res.status(200).json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/products/:id
// @desc    Update a product
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the logged-in user owns the product
    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price: Number(price), quantity: Number(quantity) },
      { new: true, runValidators: true }
    );

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the logged-in user owns the product
    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getLowStockProducts,
  updateProduct,
  deleteProduct,
};