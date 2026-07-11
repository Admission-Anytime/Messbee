const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false,
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: false,
    index: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: false,
    index: true
  },
  direction: {
    type: String,
    enum: ['INBOUND', 'OUTBOUND'],
    required: false
  },
  senderType: {
    type: String,
    enum: ['CUSTOMER', 'BOT', 'HUMAN_AGENT'],
    required: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'interactive', 'template', 'location', 'contacts', 'reaction', 'unknown'],
    default: 'text'
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: false // can be string for text, or object for media URLs/interactive payloads
  },
  metaMessageId: {
    type: String,
    index: true // The WhatsApp specific message ID
  },
  whatsappMessageId: { type: String, index: true },
  text: { type: String },
  sender: { type: String },
  time: { type: String },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', index: true },
  templateName: { type: String },
  templateLanguage: { type: String },
  mediaUrl: { type: String },
  mediaType: { type: String },
  fileName: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'received'],
    default: 'sent'
  }
}, {
  timestamps: true
});

// For quickly pulling a chat history
messageSchema.index({ contactId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

