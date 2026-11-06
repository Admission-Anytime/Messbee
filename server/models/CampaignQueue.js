const mongoose = require('mongoose');

/**
 * CampaignQueue Schema
 * Individual message execution queue for campaign broadcasts.
 * Tracks per-recipient delivery, timing, retry count, and errors.
 */
const campaignQueueSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  // Multi-tenant references
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  
  // Recipient details
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: 'Customer'
  },

  // Final processed message
  personalizedMessage: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    default: null
  },

  // Execution State
  status: {
    type: String,
    enum: ['PENDING', 'SCHEDULED', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },

  // WhatsApp Real-time Delivery Status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read'],
    default: 'pending'
  },
  whatsappMessageId: {
    type: String,
    default: null,
    index: true
  },

  // Timing & Delay Execution
  scheduledFor: {
    type: Date,
    default: Date.now,
    index: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },

  // Fault tolerance & errors
  retryCount: {
    type: Number,
    default: 0
  },
  errorReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for high-speed concurrent queue dispatching
campaignQueueSchema.index({ campaignId: 1, status: 1 });
campaignQueueSchema.index({ user: 1, status: 1, scheduledFor: 1 });
campaignQueueSchema.index({ tenantId: 1, status: 1, scheduledFor: 1 });

module.exports = mongoose.model('CampaignQueue', campaignQueueSchema);

