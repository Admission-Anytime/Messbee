const Customer = require('../models/Customer');
const Sales = require('../models/Sales');

exports.getCustomers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    let query = { tenantId };

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: customers,
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

exports.getCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const customer = await Customer.findOne({ _id: req.params.id, tenantId });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, tenantId });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerSales = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const sales = await Sales.find({ customer: req.params.id, tenantId })
      .populate('products.product', 'name sku')
      .sort({ salesDate: -1 });

    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
