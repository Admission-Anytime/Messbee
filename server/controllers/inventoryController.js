const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');

exports.getInventoryLogs = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { productId, type, page = 1, limit = 15 } = req.query;

    let query = { tenantId };

    if (productId) query.product = productId;
    if (type) query.type = type;

    const logs = await InventoryLog.find(query)
      .populate('product', 'name sku currentStock')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await InventoryLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
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

exports.getLowStockAlerts = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const products = await Product.find({ 
      tenantId, 
      $expr: { $lte: ['$currentStock', '$minimumStock'] } 
    }).populate('category', 'name').sort({ currentStock: 1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOutofStock = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const products = await Product.find({ tenantId, currentStock: { $lte: 0 } })
      .populate('category', 'name').sort({ name: 1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { productId, newStockLevel, notes } = req.body;

    if (newStockLevel < 0) {
      throw new Error('Stock level cannot be negative');
    }

    const product = await Product.findOne({ _id: productId, tenantId }).session(session);
    if (!product) {
      throw new Error('Product not found');
    }

    const previousStock = product.currentStock;
    const difference = newStockLevel - previousStock;

    if (difference !== 0) {
      await Product.findByIdAndUpdate(productId, { $inc: { currentStock: difference } }, { session, new: true });

      await InventoryLog.create([{
        tenantId,
        product: productId,
        type: 'adjustment',
        quantity: difference,
        previousStock,
        newStock: newStockLevel,
        notes: notes || 'Manual stock adjustment'
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Stock adjusted successfully', currentStock: newStockLevel });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
