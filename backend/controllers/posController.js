const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const sendEmail = require('../utils/sendEmail');

const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INV-${timestamp}-${randomStr}`;
};

// @route   POST /api/pos/checkout
const processSale = async (req, res) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty' });
    }

    // Validate stock
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, owner: req.user.id });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }
    }

    // Deduct stock and accumulate subtotal
    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, owner: req.user.id },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Record Sale
    const invoiceNumber = generateInvoiceNumber();
    const finalCustomerName = customerName?.trim() || 'Walk-in Customer';

    const sale = await Sale.create({
      invoiceNumber,
      items: saleItems,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      customerName: finalCustomerName,
      owner: req.user.id,
    });

    // Auto-sync Loyalty Points if customer phone is supplied
        if (customerPhone && finalCustomerName !== 'Walk-in Customer') {
      const pointsEarned = Math.floor(totalAmount / 100);
      await Customer.findOneAndUpdate(
        { phone: customerPhone, owner: req.user.id },
        {
          $setOnInsert: { name: finalCustomerName, phone: customerPhone, email: customerEmail || '' },
          $inc: { totalSpent: totalAmount, loyaltyPoints: pointsEarned },
        },
        { upsert: true, new: true }
      );
    }

    // Send email receipt if customer email is provided
    if (customerEmail) {
      const itemsHtml = saleItems
        .map(
          (i) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${i.subtotal.toLocaleString()}</td>
        </tr>
      `
        )
        .join('');

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #1a365d; text-align: center;">Purchase Receipt</h2>
          <p>Dear <strong>${finalCustomerName}</strong>,</p>
          <p>Thank you for your purchase! Here is your invoice summary:</p>
          <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f7fafc; color: #4a5568;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <h3 style="text-align: right; margin-top: 15px; color: #2b6cb0;">Total: Rs. ${totalAmount.toLocaleString()}</h3>
          <p style="text-align: center; color: #718096; margin-top: 30px; font-size: 12px;">Powered by BizFlow</p>
        </div>
      `;

      await sendEmail({
        to: customerEmail,
        subject: `Receipt for Invoice ${invoiceNumber}`,
        html: emailHtml,
      });
    }

    res.status(201).json({
      message: 'Sale completed successfully',
      sale,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSalesHistory = async (req, res) => {
  try {
    const sales = await Sale.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, owner: req.user.id }).populate('owner', 'name businessName email');
    if (!sale) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  processSale,
  getSalesHistory,
  getReceipt,
};