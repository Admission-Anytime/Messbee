import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
    index: true
  },
  direction: {
    type: String,
    enum: ['INBOUND', 'OUTBOUND'],
    required: true
  },
  senderType: {
    type: String,
    enum: ['CUSTOMER', 'BOT', 'HUMAN_AGENT'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'interactive', 'template', 'location', 'contacts', 'reaction', 'unknown'],
    default: 'text'
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true // can be string for text, or object for media URLs/interactive payloads
  },
  metaMessageId: {
    type: String,
    index: true // The WhatsApp specific message ID
  },
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
export default Message;
