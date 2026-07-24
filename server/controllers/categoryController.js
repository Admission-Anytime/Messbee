const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { search, page = 1, limit = 10, status } = req.query;

    let query = { tenantId };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
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

exports.getCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const category = await Category.findOne({ _id: req.params.id, tenantId });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    req.body.tenantId = tenantId;

    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const category = await Category.findOneAndDelete({ _id: req.params.id, tenantId });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
