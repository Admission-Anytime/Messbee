const mongoose = require('mongoose');

/**
 * ContactGroup Schema
 * Organizes and saves audience lists/groups for quick campaign selection.
 */
const contactGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Multi-tenant reference (Supports both user & tenantId)
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
  // Contacts assigned to this group
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  // Filter tags associated with this group
  tags: [{
    type: String,
    trim: true
  }],
  // Cached count for fast UI rendering
  totalContacts: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-update totalContacts before saving
contactGroupSchema.pre('save', function (next) {
  if (Array.isArray(this.contacts)) {
    this.totalContacts = this.contacts.length;
  }
  next();
});

// Compound index for fast tenant query
contactGroupSchema.index({ user: 1, name: 1 });
contactGroupSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('ContactGroup', contactGroupSchema);

