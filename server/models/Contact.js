import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: 'Unknown'
  },
  isOptedOut: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  optInStatus: {
    type: String,
    enum: ['OPTED_IN', 'OPTED_OUT', 'PENDING'],
    default: 'PENDING'
  },
  lastInteractionAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// A phone number should be unique per tenant channel
contactSchema.index({ channelId: 1, phone: 1 }, { unique: true });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
