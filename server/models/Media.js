const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  ext: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO', 'ARCHIVE'],
    required: true,
  },
  duration: {
    type: String,
    default: null,
  },
  thumb: {
    type: String,
    default: null,
  },
  whatsappMediaId: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Media', mediaSchema);
