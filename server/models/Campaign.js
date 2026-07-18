const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  // --- Old Schema Fields (CRM / Frontend) ---
  name: {
    type: String,
    required: [true, 'Please add a campaign name'],
    trim: true
  },
  description: {
    type: String
  },
  messageTemplate: {
    type: String,
    // Made optional because new schema uses templateName
  },
  headerMediaUrl: {
    type: String,
    default: null
  },
  headerType: {
    type: String,
    default: 'None'
  },
  templateLanguage: {
    type: String,
    default: 'en_US'
  },
  status: {
    type: String,
    // Expanded enum to support both lowercase (CRM) and uppercase (Automation)
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date
  },
  targetAudience: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Contact'
  }],
  audienceFilter: {
    tags: [String],
    createdAfter: Date,
    createdBefore: Date
  },
  stats: {
    totalTargeted: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // Made optional because automation uses tenantId instead
  },

  // --- New Schema Fields (Automation) ---
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  templateName: {
    type: String
  },
  targetSegment: {
    type: mongoose.Schema.Types.Mixed
  },
  variablesMapping: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  scheduledAt: {
    type: Date,
    default: null
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
  timestamps: true // Added from new schema
});

CampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
