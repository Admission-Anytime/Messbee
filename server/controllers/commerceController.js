const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { syncProductToMeta } = require('../services/metaCatalogService');

// --- PRODUCT CONTROLLERS ---

// @desc    Get all products
// @route   GET /api/commerce/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const products = await Product.find({
      $or: [
        { user: req.user.id },
        { tenantId: tenantId }
      ]
    }).populate('category', 'name').sort('-createdAt');
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
    req.body.tenantId = req.user.tenantId || req.user._id; // Ensure tenantId is set

    // Normalize field aliases if sent by different frontend modules
    if (req.body.price !== undefined && req.body.sellingPrice === undefined) {
      req.body.sellingPrice = Number(req.body.price) || 0;
    }
    if (req.body.sellingPrice !== undefined && req.body.purchasePrice === undefined) {
      req.body.purchasePrice = Number(req.body.sellingPrice) || 0;
    }
    if (req.body.stock !== undefined && req.body.currentStock === undefined) {
      req.body.currentStock = Number(req.body.stock) || 0;
    }
    if (req.body.img && !req.body.productImage) {
      req.body.productImage = req.body.img;
    }

    const product = await Product.create(req.body);
    
    // Async background sync to Meta
    syncProductToMeta(product, product.tenantId, 'CREATE');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `SKU '${req.body.sku}' already exists. Please use a unique SKU ID.`
      });
    }
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
    
    const isOwner = product.user && product.user.toString() === req.user.id;
    const isSameTenant = (product.tenantId && req.user.tenantId && product.tenantId.toString() === req.user.tenantId.toString()) ||
                         (product.tenantId && product.tenantId.toString() === req.user._id.toString());
    if (!isOwner && !isSameTenant) return res.status(401).json({ success: false, message: 'Not authorized' });

    if (req.body.price !== undefined && req.body.sellingPrice === undefined) {
      req.body.sellingPrice = Number(req.body.price) || 0;
    }
    if (req.body.stock !== undefined && req.body.currentStock === undefined) {
      req.body.currentStock = Number(req.body.stock) || 0;
    }
    if (req.body.img && !req.body.productImage) {
      req.body.productImage = req.body.img;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // Async background sync to Meta
    syncProductToMeta(product, product.tenantId, 'UPDATE');

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

    const isOwner = product.user && product.user.toString() === req.user.id;
    const isSameTenant = (product.tenantId && req.user.tenantId && product.tenantId.toString() === req.user.tenantId.toString()) ||
                         (product.tenantId && product.tenantId.toString() === req.user._id.toString());
    if (!isOwner && !isSameTenant) return res.status(401).json({ success: false, message: 'Not authorized' });

    // Async background sync to Meta (before deleting locally, though we just pass the object)
    syncProductToMeta(product, product.tenantId, 'DELETE');
    
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
