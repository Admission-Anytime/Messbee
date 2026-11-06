const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  // --- Core Campaign Identifiers ---
  name: {
    type: String,
    required: [true, 'Please add a campaign name'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  channelType: {
    type: String,
    enum: ['FREE_QR', 'META_CLOUD'],
    default: 'FREE_QR',
    index: true
  },

  // --- Message Template & Media ---
  messageTemplate: {
    type: String,
    default: ''
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

  // --- Delay & Anti-Ban Throttling Options (5 min, 10 min, 15 min, 5s, 10s, 15s) ---
  delayOption: {
    type: String,
    enum: ['5s', '10s', '15s', '5m', '10m', '15m', 'custom'],
    default: '10s'
  },
  delayInterval: {
    type: Number,
    default: 10 // Interval value
  },
  delayUnit: {
    type: String,
    enum: ['seconds', 'minutes'],
    default: 'seconds'
  },
  antiBanConfig: {
    minDelaySeconds: { type: Number, default: 6 },
    maxDelaySeconds: { type: Number, default: 15 },
    batchSize: { type: Number, default: 25 },
    batchCooldownMinutes: { type: Number, default: 2 },
    simulateTyping: { type: Boolean, default: true }
  },

  // --- Audience Selection & Grouping ---
  contactGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactGroup'
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

  // --- Campaign Lifecycle Status ---
  status: {
    type: String,
    enum: [
      'draft', 'scheduled', 'active', 'paused', 'completed', 'failed', 'cancelled',
      'DRAFT', 'SCHEDULED', 'QUEUED', 'PROCESSING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'
    ],
    default: 'draft',
    index: true
  },
  scheduledDate: {
    type: Date
  },
  scheduledAt: {
    type: Date,
    default: null
  },

  // --- Live Metrics & Statistics ---
  stats: {
    totalTargeted: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },

  // --- Multi-Tenant Ownership ---
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },

  // --- Meta Template Automation Fields ---
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
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-calculate delayInterval & delayUnit from delayOption before saving
CampaignSchema.pre('save', function(next) {
  if (this.delayOption) {
    if (this.delayOption === '5m') {
      this.delayInterval = 5;
      this.delayUnit = 'minutes';
    } else if (this.delayOption === '10m') {
      this.delayInterval = 10;
      this.delayUnit = 'minutes';
    } else if (this.delayOption === '15m') {
      this.delayInterval = 15;
      this.delayUnit = 'minutes';
    } else if (this.delayOption === '5s') {
      this.delayInterval = 5;
      this.delayUnit = 'seconds';
    } else if (this.delayOption === '10s') {
      this.delayInterval = 10;
      this.delayUnit = 'seconds';
    } else if (this.delayOption === '15s') {
      this.delayInterval = 15;
      this.delayUnit = 'seconds';
    }
  }
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
