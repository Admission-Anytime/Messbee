const Product = require('../models/Product');
const Payment = require('../models/Payment');

// --- PRODUCT CONTROLLERS ---

// @desc    Get all products
// @route   GET /api/commerce/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/commerce/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/commerce/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.user.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/commerce/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.user.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- PAYMENT CONTROLLERS ---

// @desc    Get all payments
// @route   GET /api/commerce/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment (usually via webhook or internal)
// @route   POST /api/commerce/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const payment = await Payment.create(req.body);
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
