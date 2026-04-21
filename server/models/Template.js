const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  whatsappTemplateId: {
    type: String,
  },
  category: {
    type: String,
  },
  language: {
    type: String,
    default: 'en_US'
  },
  status: {
    type: String,
    default: 'PENDING'
  },
  components: {
    type: Array,
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique template names per user
templateSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Template', templateSchema);
