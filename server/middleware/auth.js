const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authentication middleware
exports.protect = async (req, res, next) => {
  let token;

  // Get token from cookie (primary method)
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Fallback: Check for token in Authorization header (for backward compatibility)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Block unapproved users from accessing any protected route
    if (req.user.isApproved === false) {
      return res.status(403).json({
        success: false,
        message: 'Admin is reviewing your account. Kindly wait for admin approval.',
        pendingApproval: true
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Optional protect - sets req.user if token exists, but doesn't fail if missing
exports.optionalProtect = async (req, res, next) => {
  let token;

  // Get token from cookie (primary method)
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Fallback: Check for token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, just continue without setting req.user
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    // If user not found or inactive, just continue without req.user
    if (!req.user || !req.user.isActive) {
      req.user = null;
    }
  } catch (error) {
    // If token verification fails, just continue without req.user
    req.user = null;
  }

  next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
