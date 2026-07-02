import mongoose from 'mongoose';

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
  metadata: {
    name: { type: String, default: 'Default WhatsApp Channel' },
    qualityRating: { type: String, default: 'UNKNOWN' },
    status: { type: String, default: 'CONNECTED' },
    wabaId: { type: String } // WhatsApp Business Account ID
  }
}, {
  timestamps: true
});

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;
