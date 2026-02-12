const Automation = require('../models/Automation');

// @desc    Get all automations
// @route   GET /api/automation
// @access  Private
exports.getAutomations = async (req, res, next) => {
  try {
    const automations = await Automation.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: automations.length,
      data: automations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single automation
// @route   GET /api/automation/:id
// @access  Private
exports.getAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Automation not found'
      });
    }

    if (automation.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this automation'
      });
    }

    res.status(200).json({
      success: true,
      data: automation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new automation
// @route   POST /api/automation
// @access  Private
exports.createAutomation = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const automation = await Automation.create(req.body);

    res.status(201).json({
      success: true,
      data: automation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update automation
// @route   PUT /api/automation/:id
// @access  Private
exports.updateAutomation = async (req, res, next) => {
  try {
    let automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Automation not found'
      });
    }

    if (automation.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this automation'
      });
    }

    automation = await Automation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: automation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete automation
// @route   DELETE /api/automation/:id
// @access  Private
exports.deleteAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Automation not found'
      });
    }

    if (automation.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this automation'
      });
    }

    await automation.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle automation active status
// @route   PUT /api/automation/:id/toggle
// @access  Private
exports.toggleAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        message: 'Automation not found'
      });
    }

    if (automation.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this automation'
      });
    }

    automation.isActive = !automation.isActive;
    await automation.save();

    res.status(200).json({
      success: true,
      data: automation
    });
  } catch (error) {
    next(error);
  }
};
