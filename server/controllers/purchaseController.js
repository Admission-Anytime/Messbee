const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');

exports.getPurchases = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    let query = { tenantId };

    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const purchases = await Purchase.find(query)
      .populate('supplier', 'companyName contactPerson')
      .sort({ purchaseDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      data: purchases,
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

exports.getPurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const purchase = await Purchase.findOne({ _id: req.params.id, tenantId })
      .populate('supplier')
      .populate('products.product');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase bill not found' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    // Validate products exist
    if (!req.body.products || req.body.products.length === 0) {
      throw new Error('At least one product is required in the purchase bill');
    }

    // Auto-generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      const count = await Purchase.countDocuments({ tenantId });
      req.body.invoiceNumber = `PUR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }

    // Create Purchase Bill
    const purchase = await Purchase.create([req.body], { session });

    // Update stock and create inventory logs
    for (const item of req.body.products) {
      const product = await Product.findOne({ _id: item.product, tenantId }).session(session);
      
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      const previousStock = product.currentStock;
      const newStock = previousStock + item.quantity;

      // Update Product Stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { currentStock: item.quantity } },
        { session, new: true }
      );

      // Create Inventory Log
      await InventoryLog.create([{
        tenantId,
        product: product._id,
        type: 'purchase',
        quantity: item.quantity,
        previousStock,
        newStock,
        referenceId: purchase[0]._id,
        referenceNumber: purchase[0].invoiceNumber,
        notes: `Purchase Bill created from supplier ${req.body.supplier}`
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: purchase[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
