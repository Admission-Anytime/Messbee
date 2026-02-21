const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiry time
 * @param {number} minutes - Minutes until expiry (default: 10)
 * @returns {Date} Expiry date
 */
exports.getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if OTP is expired
 * @param {Date} expiryDate - OTP expiry date
 * @returns {boolean} True if expired
 */
exports.isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

/**
 * Check if user is blocked from OTP attempts
 * @param {Date} blockedUntil - Block expiry date
 * @returns {boolean} True if blocked
 */
exports.isOTPBlocked = (blockedUntil) => {
  if (!blockedUntil) return false;
  return new Date() < new Date(blockedUntil);
};

/**
 * Calculate block duration based on failed attempts
 * @param {number} attempts - Number of failed attempts
 * @returns {Date|null} Block until date or null if no block needed
 */
exports.calculateBlockDuration = (attempts) => {
  if (attempts >= 5) {
    // Block for 30 minutes after 5+ failed attempts
    return new Date(Date.now() + 30 * 60 * 1000);
  } else if (attempts >= 3) {
    // Block for 5 minutes after 3-4 failed attempts
    return new Date(Date.now() + 5 * 60 * 1000);
  }
  return null;
};

/**
 * Hash OTP for secure storage (optional enhancement)
 * @param {string} otp - Plain OTP
 * @returns {string} Hashed OTP
 */
exports.hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP match
 * @param {string} inputOTP - User input OTP
 * @param {string} storedOTP - Stored OTP (can be hashed or plain)
 * @param {boolean} isHashed - Whether stored OTP is hashed
 * @returns {boolean} True if match
 */
exports.verifyOTP = (inputOTP, storedOTP, isHashed = false) => {
  if (isHashed) {
    const hashedInput = exports.hashOTP(inputOTP);
    return hashedInput === storedOTP;
  }
  return inputOTP === storedOTP;
};

/**
 * Generate random token for password reset, etc.
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random token
 */
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
