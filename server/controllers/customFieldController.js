const CustomField = require('../models/CustomField');
const { successResponse, errorResponse, getPagination } = require('../utils/response');

// @desc    Get all custom fields for a user
// @route   GET /api/custom-fields
// @access  Private
exports.getCustomFields = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const userId = req.user.id;

    const query = { userId };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CustomField.countDocuments(query);

    const fields = await CustomField.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const pagination = getPagination(page, limit, total);

    res.status(200).json({
      success: true,
      data: fields,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single custom field
// @route   GET /api/custom-fields/:id
// @access  Private
exports.getCustomField = async (req, res, next) => {
  try {
    const field = await CustomField.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('createdBy', 'name email');

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Custom field not found'
      });
    }

    res.status(200).json({
      success: true,
      data: field
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom field
// @route   POST /api/custom-fields
// @access  Private
exports.createCustomField = async (req, res, next) => {
  try {
    // ✅ FIXED: added showInContacts to destructuring
    const { name, description, type, key, showInContacts } = req.body;
    const userId = req.user.id;

    if (!name || !key) {
      return res.status(400).json({
        success: false,
        message: 'Field name and technical key are required'
      });
    }

    const existingField = await CustomField.findOne({ key, userId });
    if (existingField) {
      return res.status(400).json({
        success: false,
        message: 'Technical key must be unique. This key already exists.'
      });
    }

    const field = await CustomField.create({
      name,
      description:    description || '',
      type:           type || 'Text',
      key,
      // ✅ FIXED: save showInContacts — default true if not provided
      showInContacts: showInContacts !== undefined ? Boolean(showInContacts) : true,
      createdBy:      userId,
      userId,
    });

    const populatedField = await CustomField.findById(field._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Custom field created successfully',
      data: populatedField
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Technical key must be unique'
      });
    }
    next(error);
  }
};

// @desc    Update custom field
// @route   PUT /api/custom-fields/:id
// @access  Private
exports.updateCustomField = async (req, res, next) => {
  try {
    // ✅ FIXED: added showInContacts to destructuring
    const { name, description, type, key, showInContacts } = req.body;
    const userId = req.user.id;

    let field = await CustomField.findOne({
      _id: req.params.id,
      userId
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Custom field not found'
      });
    }

    if (key && key !== field.key) {
      const existingField = await CustomField.findOne({ key, userId });
      if (existingField) {
        return res.status(400).json({
          success: false,
          message: 'Technical key must be unique. This key already exists.'
        });
      }
    }

    const fieldsToUpdate = {};
    if (name           !== undefined) fieldsToUpdate.name           = name;
    if (description    !== undefined) fieldsToUpdate.description    = description;
    if (type           !== undefined) fieldsToUpdate.type           = type;
    if (key            !== undefined) fieldsToUpdate.key            = key;
    // ✅ FIXED: allow updating showInContacts
    if (showInContacts !== undefined) fieldsToUpdate.showInContacts = Boolean(showInContacts);

    field = await CustomField.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Custom field updated successfully',
      data: field
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Technical key must be unique'
      });
    }
    next(error);
  }
};

// @desc    Toggle custom field active status
// @route   PATCH /api/custom-fields/:id/toggle
// @access  Private
exports.toggleCustomField = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let field = await CustomField.findOne({
      _id: req.params.id,
      userId
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Custom field not found'
      });
    }

    field.isActive = !field.isActive;
    await field.save();

    field = await CustomField.findById(field._id)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Custom field ${field.isActive ? 'activated' : 'deactivated'} successfully`,
      data: field
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom field
// @route   DELETE /api/custom-fields/:id
// @access  Private
exports.deleteCustomField = async (req, res, next) => {
  try {
    const field = await CustomField.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Custom field not found'
      });
    }

    await CustomField.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete custom fields
// @route   POST /api/custom-fields/bulk-delete
// @access  Private
exports.bulkDeleteCustomFields = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of field IDs'
      });
    }

    const result = await CustomField.deleteMany({
      _id: { $in: ids },
      userId
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} custom field(s) deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
};