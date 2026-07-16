const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // --- Webhook / Automation Fields ---
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    index: true
  },
  isOptedOut: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  optInStatus: {
    type: String,
    enum: ['OPTED_IN', 'OPTED_OUT', 'PENDING'],
    default: 'PENDING'
  },
  lastInteractionAt: {
    type: Date,
    default: Date.now
  },

  // --- CRM Fields ---
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  name: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  whatsapp: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  institute: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'WARM', 'INACTIVE', 'COLD'],
    default: 'ACTIVE'
  },
  labels: [{
    type: String,
    trim: true
  }],
  initials: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  importedFrom: {
    type: String,
    default: null
  },

  // --- Shared Fields ---
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, {
  timestamps: true,
  strict: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// A phone number should be unique per tenant channel (Webhook/Automation)
contactSchema.index(
  { channelId: 1, phone: 1 }, 
  { unique: true, partialFilterExpression: { channelId: { $exists: true } } }
);

// Whatsapp must be unique per user ONLY when it exists and is not null/empty (CRM)
contactSchema.index(
  { user: 1, whatsapp: 1 },
  {
    unique: true,
    partialFilterExpression: {
      whatsapp: { $exists: true, $ne: null, $ne: "" }
    }
  }
);

// Text index for search
contactSchema.index({ name: 'text', email: 'text', whatsapp: 'text' });

// Auto-generate initials and color if not provided
contactSchema.pre('save', function (next) {
  if (!this.initials && this.name) {
    this.initials = this.name.substring(0, 2).toUpperCase();
  }
  if (!this.color) {
    const colors = ['#4CAF50','#FF9800','#607D8B','#5C6BC0','#E91E63','#009688','#795548','#3F51B5','#FF5722','#9C27B0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  next();
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
