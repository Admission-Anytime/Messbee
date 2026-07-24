const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');

exports.getSuppliers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    let query = { tenantId };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.status(200).json({
      success: true,
      data: suppliers,
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

exports.getSupplier = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const supplier = await Supplier.findOne({ _id: req.params.id, tenantId });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, tenantId });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupplierPurchases = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const purchases = await Purchase.find({ supplier: req.params.id, tenantId })
      .populate('products.product', 'name sku')
      .sort({ purchaseDate: -1 });

    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
