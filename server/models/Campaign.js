const mongoose = require('mongoose');
const campaignSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  templateName: {
    type: String,
    required: true
  },
  templateLanguage: {
    type: String,
    default: 'en_US'
  },
  targetSegment: {
    type: mongoose.Schema.Types.Mixed, // e.g., { tag: "VIP" } or { all: true }
    required: true
  },
  variablesMapping: {
    type: [mongoose.Schema.Types.Mixed], // Maps template variables to Contact customFields
    default: []
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED'],
    default: 'DRAFT'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  stats: {
    totalTargeted: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
