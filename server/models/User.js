const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  countryCode: { type: String, default: '+91' },
  
  // Profile specific fields
  professionalTitle: { type: String, default: '' },
  timeZone: { type: String, default: '(GMT-08:00) Pacific Time (US & Canada)' },
  language: { type: String, default: 'English (United States)' },
  avatarUrl: { type: String, default: '' },

  // Password Recovery fields
  resetOtp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);