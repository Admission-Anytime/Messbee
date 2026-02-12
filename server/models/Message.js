const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  contact: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contact',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'contact'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
MessageSchema.index({ contact: 1, createdAt: -1 });
MessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
