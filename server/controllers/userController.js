const User = require('../models/User');
const CustomField = require('../models/CustomField');
const QuickReply = require('../models/QuickReply');
const Campaign = require('../models/Campaign');
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
    
    const tenantId = req.user.tenantId || req.user.id;
    
    // Count team members scoped to this tenant (including the admin)
    const teamMembersCount = await User.countDocuments({
      $or: [{ tenantId: tenantId }, { _id: tenantId }]
    }); 
    
    let campaignsCount = 0;
    try {
      campaignsCount = await Campaign.countDocuments({ user: req.user.id });
    } catch(err) {
      console.error(err);
    }

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
        storage: { used: 45, limit: 100, isPercent: true }, // mock percent for now
        activeFeatures: {
          campaigns: { used: campaignsCount, limit: limits.campaigns === -1 ? 'Unlimited' : limits.campaigns },
          chatbots: { used: 7, limit: limits.chatbots }, // Mocking chatbots since there's no model
        },
        developerTools: {
          apiAccess: { active: limits.features?.restApiCalls || false, version: 'v2.0' },
          webhooks: { active: limits.features?.webhook || false, count: limits.features?.webhook ? 2 : 0 },
        },
        commerceHub: {
          available: ['professional', 'enterprise'].includes(userPlan)
        }
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
    const tenantId = req.user.tenantId || req.user.id;
    
    // Only return users belonging to this tenant, and the admin themselves
    const users = await User.find({
      $or: [{ tenantId: tenantId }, { _id: tenantId }]
    });
    
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

    const tenantId = req.user.tenantId || req.user.id;

    const user = await User.create({
      name,
      email,
      role: finalRole,
      password,
      tenantId: tenantId, // Link agent to the admin's workspace
      isActive: true,
      isApproved: true, // Admin-created users are pre-approved
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

    const tenantId = req.user.tenantId || req.user.id;

    // Secure update: Must belong to this tenant
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, $or: [{ tenantId: tenantId }, { _id: tenantId }] },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or you do not have permission' });
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

    const tenantId = req.user.tenantId || req.user.id;

    // Secure delete: Must belong to this tenant
    const user = await User.findOne({ 
      _id: req.params.id, 
      $or: [{ tenantId: tenantId }, { _id: tenantId }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or you do not have permission' });
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
    const tenantId = req.user.tenantId || req.user.id;
    
    // Secure bulk delete: Only delete if they belong to this tenant
    await User.deleteMany({ 
      _id: { $in: ids },
      $or: [{ tenantId: tenantId }, { _id: tenantId }]
    });
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
    const allowed = ['name', 'email', 'phone', 'businessName', 'businessCategory', 'businessType', 'city', 'state', 'country', 'company', 'avatar', 'timezone', 'language', 'isPhoneVerified', 'credits'];
    
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

// @desc    Get users pending admin approval
// @route   GET /api/users/pending-approval
// @access  Private (Admin)
exports.getPendingUsers = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ 
      isApproved: false, 
      isEmailVerified: true 
    }).select('name email phone company role createdAt');

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a user's account
// @route   PUT /api/users/:id/approve
// @access  Private (Admin)
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isApproved) {
      return res.status(400).json({ success: false, message: 'User is already approved' });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been approved successfully.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
