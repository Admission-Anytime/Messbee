const Product = require('../models/Product');

// Automatically generate SKU if not provided
const generateSKU = async (tenantId, name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const count = await Product.countDocuments({ tenantId }) + 1;
  return `${prefix}-${count.toString().padStart(4, '0')}`;
};

exports.getProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, category, status, page = 1, limit = 10 } = req.query;

    let query = { tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (status) query.status = status;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const product = await Product.findOne({ _id: req.params.id, tenantId }).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    if (!req.body.sku) {
      req.body.sku = await generateSKU(tenantId, req.body.name);
    }

    // Auto barcode could be SKU
    if (!req.body.barcode) {
      req.body.barcode = req.body.sku;
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const product = await Product.findOneAndDelete({ _id: req.params.id, tenantId });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
