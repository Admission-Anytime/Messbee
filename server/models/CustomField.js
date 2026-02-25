const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    required: [true, 'Field type is required'],
    enum: ['Text', 'Number', 'Date'],
    default: 'Text'
  },
  key: {
    type: String,
    required: [true, 'Technical key is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[a-z0-9_]+$/,
      'Technical key can only contain lowercase letters, numbers, and underscores'
    ]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique keys per user
CustomFieldSchema.index({ key: 1, userId: 1 }, { unique: true });

// Add text index for search
CustomFieldSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('CustomField', CustomFieldSchema);
