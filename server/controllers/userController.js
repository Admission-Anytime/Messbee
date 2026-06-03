const User = require('../models/User');
const CustomField = require('../models/CustomField');
const QuickReply = require('../models/QuickReply');
const { PLAN_LIMITS } = require('../utils/planLimits');
const crypto = require('crypto');
const emailService = require('../services/emailService');

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

// @desc    Get account limits and usage
// @route   GET /api/users/account-limits
// @access  Private
exports.getAccountLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userPlan = (user.subscriptionPlan || 'free').toLowerCase();
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    const customFieldsCount = await CustomField.countDocuments({ userId: req.user.id });
    const quickRepliesCount = await QuickReply.countDocuments({ user: req.user.id });
    
    // Assuming single-tenant or global users for now based on existing getUsers logic
    const teamMembersCount = await User.countDocuments(); 

    res.status(200).json({
      success: true,
      data: {
        whatsappApiNumber: { 
          used: user.whatsappConnected !== false ? 1 : 0, 
          limit: limits.features?.multipleWhatsAppNumbers ? 5 : 1 // arbitrary limit for multiple
        },
        customFields: { used: customFieldsCount, limit: limits.customFields },
        quickReplies: { used: quickRepliesCount, limit: limits.quickReplies },
        teamMembers: { used: teamMembersCount, limit: limits.agents },
        storage: { used: 45, limit: 100, isPercent: true } // mock percent for now
      }
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

// @desc    Create a new user (Team Member)
// @route   POST /api/users
// @access  Private (Admin/Manager only ideally)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate a random secure password for the invited user
    const password = crypto.randomBytes(12).toString('hex');
    
    // Convert role to standard backend format
    let finalRole = role ? role.toUpperCase() : 'AGENT';
    if (!['ADMIN', 'MANAGER', 'AGENT', 'user', 'admin'].includes(finalRole)) {
      finalRole = 'AGENT';
    }

    const user = await User.create({
      name,
      email,
      role: finalRole,
      password,
      isActive: true,
      isEmailVerified: true // verify immediately so they can just login
    });

    // Send invitation email
    try {
      await emailService.sendTeamInviteEmail({
        email: user.email,
        name: user.name,
        password: password,
        role: finalRole
      });
    } catch (emailErr) {
      console.error('Failed to send invite email:', emailErr);
    }

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully and invitation sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Team Member)
// @route   PUT /api/users/:id
// @access  Private (Admin only ideally)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const updateData = {};
    
    if (role) {
      let finalRole = role.toUpperCase();
      if (['ADMIN', 'MANAGER', 'AGENT'].includes(finalRole)) {
        updateData.role = finalRole;
      }
    }
    
    if (status) {
      updateData.isActive = status === 'Active';
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Team Member)
// @route   DELETE /api/users/:id
// @access  Private (Admin only ideally)
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hard delete — removes the document entirely from MongoDB
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete users (Team Members)
// @route   POST /api/users/bulk-delete
// @access  Private (Admin only ideally)
exports.bulkDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      data: {}
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
    const allowed = ['name', 'email', 'phone', 'company', 'avatar', 'timezone', 'language', 'isPhoneVerified', 'credits'];
    
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
      data: updatedUser
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
      { $set: { subscriptionPlan, subscriptionEndDate } },
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
