const Sales = require('../models/Sales');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');

exports.getSales = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    let query = { tenantId };

    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const sales = await Sales.find(query)
      .populate('customer', 'customerName mobile')
      .sort({ salesDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Sales.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sales,
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

exports.getSale = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const sale = await Sales.findOne({ _id: req.params.id, tenantId })
      .populate('customer')
      .populate('products.product');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sales invoice not found' });
    }

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    if (!req.body.products || req.body.products.length === 0) {
      throw new Error('At least one product is required in the sales invoice');
    }

    // Pre-check stock for all products to prevent negative stock
    for (const item of req.body.products) {
      const product = await Product.findOne({ _id: item.product, tenantId }).session(session);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Current stock is ${product.currentStock}, requested ${item.quantity}.`);
      }
    }

    if (!req.body.invoiceNumber) {
      const count = await Sales.countDocuments({ tenantId });
      req.body.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }

    const sale = await Sales.create([req.body], { session });

    for (const item of req.body.products) {
      const product = await Product.findOne({ _id: item.product, tenantId }).session(session);
      const previousStock = product.currentStock;
      const newStock = previousStock - item.quantity;

      await Product.findByIdAndUpdate(
        product._id,
        { currentStock: newStock },
        { session }
      );

      await InventoryLog.create([{
        tenantId,
        product: product._id,
        type: 'sale',
        quantity: -item.quantity, // Negative for sales
        previousStock,
        newStock,
        referenceId: sale[0]._id,
        referenceNumber: sale[0].invoiceNumber,
        notes: `Sales Invoice generated for customer ${req.body.customer}`
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: sale[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
