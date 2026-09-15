const mongoose = require('mongoose');

/**
 * Channel Schema
 * Represents a specific WhatsApp Business number configured for a tenant.
 */
const channelSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  activeWhatsappPhoneNumberId: {
    type: String,
    required: true,
    unique: true, // A phone number should only belong to one channel
    index: true
  },
  metaAccessToken: {
    type: String,
    required: true,
    select: false // Exclude from normal queries for security
  },
  // Display fields (what shows in the Assign WhatsApp Number modal)
  name: { type: String, default: 'WhatsApp Business' },
  phoneNumber: { type: String, default: '' }, // Actual WhatsApp number e.g. +916203459821

  metadata: {
    name: { type: String, default: 'Default WhatsApp Channel' },
    qualityRating: { type: String, default: 'UNKNOWN' },
    status: { type: String, default: 'CONNECTED' },
    wabaId: { type: String }, // WhatsApp Business Account ID
    phoneStatus: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'UNKNOWN'],
      default: 'UNKNOWN'
    }, // Tracks whether the phone number is registered with Meta
    registrationPin: { type: String } // Auto-generated 6-digit PIN — only returned via /phone-status admin endpoint
  }
}, {
  timestamps: true
});

const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;

