const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  authProvider: {
    type: String,
    default: 'local'
  },
  facebookId: {
    type: String
  },
  googleId: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'AGENT', 'user', 'admin'],
    default: 'AGENT'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },

  phone: {
    type: String
  },
  avatar: {
    type: String
  },
  company: {
    type: String
  },
  businessName: {
    type: String
  },
  businessCategory: {
    type: String
  },
  businessType: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false // New users need admin approval; existing users are handled via strict === false checks
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'professional', 'premium', 'enterprise', 'custom'],
    default: 'free'
  },
  planName: {
    type: String,
    default: 'Standard'
  },
  credits: {
    type: Number,
    default: 0
  },
  subscriptionEndDate: {
    type: Date
  },
  timezone: {
    type: String,
    default: '(GMT+05:30) India Standard Time'
  },
  language: {
    type: String,
    default: 'English (United States)'
  },
  // OTP fields for authentication
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  otpBlockedUntil: {
    type: Date,
    select: false
  },
  // Refresh token for JWT refresh mechanism
  refreshToken: {
    type: String,
    select: false
  },
  // Security: Track last login
  lastLogin: {
    type: Date
  },
  // WhatsApp Configuration tied to this specific user
  whatsappConfig: {
    wabaId: { type: String },
    phoneNumberId: { type: String },
    accessToken: { type: String }
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next(); // CRITICAL: Return here to prevent re-hashing
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Access Token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    }
  );
};

// Generate JWT Refresh Token
UserSchema.methods.getRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    }
  );
  
  return refreshToken;
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
