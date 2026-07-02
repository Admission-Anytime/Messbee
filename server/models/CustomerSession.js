import mongoose from 'mongoose';

/**
 * Customer Session Schema
 * Tracks the real-time state of an active end-user traversing an Automation.
 */
const customerSessionSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  activeFlowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true
  },
  currentNodeId: {
    type: String,
    required: true
  },
  // Store user context/variables across the flow
  sessionVariables: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'HANDOFF', 'WAITING_FOR_INPUT'],
    default: 'ACTIVE',
    index: true
  },
  expectedValidation: {
    type: String,
    enum: ['text', 'email', 'phone', 'number', 'date', 'boolean']
  },
  validationRetries: {
    type: Number,
    default: 0
  },
  saveVariableAs: {
    type: String,
    default: null
  },
  referral: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lastIncomingMessageId: {
    type: String,
    default: null
  },
  lastInteractionAt: {
    type: Date,
    default: Date.now,
    index: true // Useful for timeout/cleanup jobs
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// A customer can only have one active session per channel
customerSessionSchema.index({ phone: 1, channelId: 1, status: 1 });

const CustomerSession = mongoose.model('CustomerSession', customerSessionSchema);
export default CustomerSession;
