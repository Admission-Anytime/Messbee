const User = require('../models/User');
const { generateOTP, getOTPExpiry, isOTPExpired, isOTPBlocked, calculateBlockDuration } = require('../utils/otpHelper');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const crypto = require('crypto');

// ==================== COOKIE HELPER ====================

/**
 * Set JWT tokens as HTTP-only cookies
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access Token Cookie (24 hours)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true, // Always true for cross-origin cookies
    sameSite: 'none', // Required for cross-origin requests
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Refresh Token Cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Always true for cross-origin cookies
    sameSite: 'none', // Required for cross-origin requests
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clear JWT cookies
 */
const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0)
  });
  
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0)
  });
};

// ==================== SIGNUP FLOW ====================

/**
 * @desc    Request signup OTP - Step 1 of registration
 * @route   POST /api/auth/signup/request-otp
 * @access  Public
 */
exports.requestSignupOTP = async (req, res, next) => {
  try {
    const { email, name, password, phone } = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, name, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      // Allow re-registration only if the account was deactivated (removed from team)
      // A deactivated + verified account means the user was deleted via ManageTeams
      if (existingUser.isActive) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      // Account exists but is deactivated — delete the old record so they can re-register
      await existingUser.deleteOne();
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10); // 10 minutes

    if (existingUser) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = password;
      existingUser.phone = phone;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.otpAttempts = 0;
      await existingUser.save();
    } else {
      // Create new user (unverified)
      await User.create({
        email,
        name,
        password,
        phone,
        otp,
        otpExpiry,
        isEmailVerified: false,
        otpAttempts: 0
      });
    }

    // Send OTP email
    await sendOTPEmail({
      email,
      name,
      otp,
      purpose: 'signup'
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('Signup OTP error:', error);
    next(error);
  }
};

/**
 * @desc    Verify signup OTP - Step 2 of registration
 * @route   POST /api/auth/signup/verify-otp
 * @access  Public
 */
exports.verifySignupOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpBlockedUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Check if blocked
    if (isOTPBlocked(user.otpBlockedUntil)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.',
        blockedUntil: user.otpBlockedUntil
      });
    }

    // Check if OTP expired
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      
      // Block if too many attempts
      const blockDuration = calculateBlockDuration(user.otpAttempts);
      if (blockDuration) {
        user.otpBlockedUntil = blockDuration;
      }
      
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: Math.max(0, 5 - user.otpAttempts)
      });
    }

    // OTP verified successfully
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.lastLogin = Date.now();
    
    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    
    // Save refresh token and save once
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Send welcome email (async, don't wait)
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(err => 
      console.error('Welcome email failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Signup successful! Welcome to Messbee.',
      tokens: {
        accessToken,
        refreshToken
      },
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          subscriptionPlan: user.subscriptionPlan, credits: user.credits, subscriptionEndDate: user.subscriptionEndDate
        }
      }
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    next(error);
  }
};

// ==================== LOGIN FLOW ====================

/**
 * @desc    Request login OTP
 * @route   POST /api/auth/login/request-otp
 * @access  Public
 */
exports.requestLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otpAttempts +otpBlockedUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please signup first.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please complete signup first.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if blocked
    if (isOTPBlocked(user.otpBlockedUntil)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.',
        blockedUntil: user.otpBlockedUntil
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'login'
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('Login OTP error:', error);
    next(error);
  }
};

/**
 * @desc    Verify login OTP
 * @route   POST /api/auth/login/verify-otp
 * @access  Public
 */
exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpBlockedUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if blocked
    if (isOTPBlocked(user.otpBlockedUntil)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.',
        blockedUntil: user.otpBlockedUntil
      });
    }

    // Check if OTP expired
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      
      const blockDuration = calculateBlockDuration(user.otpAttempts);
      if (blockDuration) {
        user.otpBlockedUntil = blockDuration;
      }
      
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: Math.max(0, 5 - user.otpAttempts)
      });
    }

    // OTP verified - login successful
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.lastLogin = Date.now();
    
    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    
    // Update refresh token and save once
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      tokens: {
        accessToken,
        refreshToken
      },
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          company: user.company,
          subscriptionPlan: user.subscriptionPlan,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    next(error);
  }
};

// ==================== PASSWORD-BASED LOGIN (OPTIONAL) ====================

/**
 * @desc    Login with email and password (alternative to OTP)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    
    // Update user in a single save operation to prevent double pre-save hook execution
    user.lastLogin = Date.now();
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      tokens: {
        accessToken,
        refreshToken
      },
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          subscriptionPlan: user.subscriptionPlan, credits: user.credits, subscriptionEndDate: user.subscriptionEndDate
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// ==================== TOKEN REFRESH ====================

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body (fallback for cross-domain)
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'No refresh token found'
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    } catch (error) {
      // Clear invalid cookies
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Find user and verify refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();
    
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new tokens as cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    next(error);
  }
};

// ==================== LOGOUT ====================

/**
 * @desc    Logout user - Clears cookies and refresh token
 * @route   POST /api/auth/logout
 * @access  Public (clears cookies even if not authenticated)
 */
exports.logout = async (req, res, next) => {
  try {
    // If user is authenticated, clear refresh token from database
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    // Always clear cookies, even if not authenticated
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // Even if there's an error, clear cookies
    clearTokenCookies(res);
    console.error('Logout error:', error);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

// ==================== RESEND OTP ====================

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body; // purpose: 'signup', 'login', 'reset'

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email }).select('+otpBlockedUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if blocked
    if (isOTPBlocked(user.otpBlockedUntil)) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        blockedUntil: user.otpBlockedUntil
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    await user.save();

    // Send OTP
    await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: purpose || 'verification'
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
};

// ==================== PASSWORD RESET ====================

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    await user.save();

    // Send OTP
    await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'reset'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpBlockedUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if blocked
    if (isOTPBlocked(user.otpBlockedUntil)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    }

    // Check OTP expiry
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      
      const blockDuration = calculateBlockDuration(user.otpAttempts);
      if (blockDuration) {
        user.otpBlockedUntil = blockDuration;
      }
      
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Reset password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};

// ==================== GET CURRENT USER ====================

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    next(error);
  }
};

/**
 * @desc    Update password (when user is logged in)
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    
    // Generate new tokens
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    
    // Update refresh token and save once (this will trigger password hashing)
    user.refreshToken = refreshToken;
    await user.save();

    // Set new tokens as cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Update password error:', error);
    next(error);
  }
};
