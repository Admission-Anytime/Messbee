const mongoose = require('mongoose');

/**
 * QrSession Schema
 * Tracks WhatsApp Web multi-device connection status for Free Tier accounts
 */
const qrSessionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['DISCONNECTED', 'QR_READY', 'CONNECTING', 'CONNECTED'],
    default: 'DISCONNECTED'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  pushName: {
    type: String,
    default: ''
  },
  qrCodeDataUrl: {
    type: String,
    default: ''
  },
  qrRaw: {
    type: String,
    default: ''
  },
  qrExpiresAt: {
    type: Date
  },
  connectedAt: {
    type: Date
  },
  disconnectedAt: {
    type: Date
  },
  platform: {
    type: String,
    default: 'baileys_multidevice'
  }
}, { timestamps: true });

module.exports = mongoose.model('QrSession', qrSessionSchema);
