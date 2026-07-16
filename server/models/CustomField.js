const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  // --- Webhook / Automation fields ---
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  options: [{
    type: String
  }],
  
  // --- CRM fields ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  showInContacts: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // --- Shared fields ---
  name: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'string'
  },
  description: {
    type: String
  }
}, {
  timestamps: true,
  strict: false
});

customFieldSchema.index(
  { tenantId: 1, key: 1 }, 
  { unique: true, partialFilterExpression: { tenantId: { $exists: true } } }
);

customFieldSchema.index(
  { userId: 1, key: 1 }, 
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

const CustomField = mongoose.model('CustomField', customFieldSchema);
module.exports = CustomField;
