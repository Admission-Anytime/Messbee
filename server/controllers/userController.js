const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Team Members)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const fieldsToUpdate = {};
    const allowed = ['name', 'email', 'phone', 'company', 'avatar', 'timezone', 'language', 'isPhoneVerified'];
    
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        // Protection: If email is verified, don't allow changing it
        if (key === 'email' && user.isEmailVerified && req.body[key] !== user.email) {
          return; 
        }
        // Protection: If phone is verified, don't allow changing it
        if (key === 'phone' && user.isPhoneVerified && req.body[key] !== user.phone) {
          return;
        }
        fieldsToUpdate[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      fieldsToUpdate, 
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        avatar: avatarUrl,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription
// @route   PUT /api/users/subscription
// @access  Private
exports.updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionPlan, subscriptionEndDate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { subscriptionPlan, subscriptionEndDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
