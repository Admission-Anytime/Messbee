const User = require('../models/User');
const { getIO } = require('../config/socket');
const SUPER_ADMIN_API_KEY = process.env.SUPER_ADMIN_API_KEY || 'messbee_super_admin_secret_key_2026';

/**
 * Middleware to verify Super Admin API Key
 */
const verifySuperAdminKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));
  if (!apiKey || apiKey !== SUPER_ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid Super Admin API key'
    });
  }
  next();
};

/**
 * @desc    Receive approval / rejection decision from external Super Admin project
 * @route   POST /api/super-admin/approvals/status
 * @access  Protected (Super Admin API Key)
 */
const updateApprovalStatus = async (req, res, next) => {
  try {
    const { userId, email, type, status, reason, reviewedBy } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'APPROVED' or 'REJECTED'"
      });
    }

    const normalizedStatus = status.toUpperCase();

    // Find target user by ID or email
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const requestType = type ? type.toUpperCase() : (user.whatsappChannelType === 'free_qr' ? 'FREE_SIGNUP' : 'WABA_CONNECTION');

    // Apply decision to User directly
    if (requestType === 'FREE_SIGNUP') {
      if (normalizedStatus === 'APPROVED') {
        user.isApproved = true;
        user.approvalStatus = 'APPROVED';
      } else {
        user.isApproved = false;
        user.approvalStatus = 'REJECTED';
      }
      await user.save();
    } else if (requestType === 'WABA_CONNECTION') {
      if (normalizedStatus === 'APPROVED') {
        user.wabaApprovalStatus = 'APPROVED';
        user.tenantWhatsAppConnected = true;
      } else {
        user.wabaApprovalStatus = 'REJECTED';
        user.tenantWhatsAppConnected = false;
      }
      await user.save();

      if (user.tenantId && user.tenantId.toString() !== user._id.toString()) {
        await User.findByIdAndUpdate(user.tenantId, {
          $set: {
            wabaApprovalStatus: user.wabaApprovalStatus,
            tenantWhatsAppConnected: user.tenantWhatsAppConnected
          }
        });
      }

      // Emit live Socket.IO event to unlock frontend modal instantly!
      try {
        const io = getIO();
        if (io) {
          const tenantRoom = `tenant_${user._id.toString()}`;
          io.to(tenantRoom).to(user._id.toString()).emit('waba_approval_update', {
            status: normalizedStatus,
            tenantWhatsAppConnected: user.tenantWhatsAppConnected,
            wabaApprovalStatus: user.wabaApprovalStatus,
            reason: reason || ''
          });
        }
      } catch (sockErr) {
        console.warn('[SuperAdminController] Socket emit warning:', sockErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Account ${requestType} successfully marked as ${normalizedStatus}`,
      data: {
        userId: user._id,
        email: user.email,
        type: requestType,
        status: normalizedStatus,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        wabaApprovalStatus: user.wabaApprovalStatus,
        tenantWhatsAppConnected: !!user.tenantWhatsAppConnected
      }
    });
  } catch (error) {
    console.error('[SuperAdminController] updateApprovalStatus error:', error);
    next(error);
  }
};

/**
 * @desc    Get all pending approval requests (for Super Admin dashboard queries)
 * @route   GET /api/super-admin/approvals/pending
 * @access  Protected (Super Admin API Key)
 */
const getPendingApprovals = async (req, res, next) => {
  try {
    const { type } = req.query;
    let filter = {};
    if (type === 'FREE_SIGNUP') {
      filter = { whatsappChannelType: 'free_qr', approvalStatus: 'PENDING' };
    } else if (type === 'WABA_CONNECTION') {
      filter = { whatsappChannelType: 'meta_pro', wabaApprovalStatus: 'PENDING' };
    } else {
      filter = {
        $or: [
          { whatsappChannelType: 'free_qr', approvalStatus: 'PENDING' },
          { whatsappChannelType: 'meta_pro', wabaApprovalStatus: 'PENDING' }
        ]
      };
    }

    const pending = await User.find(filter)
      .select('name email phone businessName whatsappChannelType whatsappConfig approvalStatus wabaApprovalStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (error) {
    console.error('[SuperAdminController] getPendingApprovals error:', error);
    next(error);
  }
};

/**
 * @desc    Check current approval status for logged-in user / tenant
 * @route   GET /api/super-admin/my-approval-status
 * @access  Private
 */
const getMyApprovalStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus || (user.isApproved ? 'APPROVED' : 'PENDING'),
        wabaApprovalStatus: user.wabaApprovalStatus || 'NONE',
        tenantWhatsAppConnected: !!user.tenantWhatsAppConnected,
        whatsappChannelType: user.whatsappChannelType
      }
    });
  } catch (error) {
    console.error('[SuperAdminController] getMyApprovalStatus error:', error);
    next(error);
  }
};

module.exports = {
  verifySuperAdminKey,
  updateApprovalStatus,
  getPendingApprovals,
  getMyApprovalStatus
};
