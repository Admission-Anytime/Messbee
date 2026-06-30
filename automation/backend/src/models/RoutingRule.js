import mongoose from 'mongoose';

const routingRuleSchema = new mongoose.Schema({
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
  ruleType: {
    type: String,
    enum: ['WELCOME', 'FALLBACK', 'OUT_OF_OFFICE', 'KEYWORD_REPLY'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For KEYWORD_REPLY
  keywords: [{
    type: String
  }],
  matchType: {
    type: String,
    enum: ['EXACT', 'CONTAINS'],
    default: 'EXACT'
  },
  // For OUT_OF_OFFICE
  businessHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    // ... we can expand this as needed
  },
  // Action to take if rule matches
  action: {
    type: String,
    enum: ['SEND_MESSAGE', 'TRIGGER_FLOW', 'ASSIGN_AGENT'],
    default: 'SEND_MESSAGE'
  },
  replyMessage: {
    type: String // The simple text reply to send
  },
  flowId: {
    type: mongoose.Schema.Types.ObjectId, // If action is TRIGGER_FLOW
    ref: 'Automation'
  },
  priority: {
    type: Number,
    default: 0 // Higher priority rules are evaluated first
  }
}, {
  timestamps: true
});

const RoutingRule = mongoose.model('RoutingRule', routingRuleSchema);
export default RoutingRule;
