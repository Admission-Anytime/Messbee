const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    text: { type: String, required: true },
    sender: { type: String, enum: ["me", "them"], required: true }, // 'me' = admin, 'them' = user
    time: { type: String }, // e.g. "12:05 PM"
    // WhatsApp specific fields
    whatsappMessageId: { type: String, unique: true, sparse: true }, // WhatsApp message ID
    messageType: { 
      type: String, 
      enum: ["text", "image", "video", "audio", "document", "location", "contact", "sticker"],
      default: "text"
    },
    mediaUrl: { type: String }, // Media ID or URL for images, videos, documents
    mediaType: { type: String }, // MIME type
    caption: { type: String }, // Caption for media messages
    fileName: { type: String }, // Original filename for documents
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed", "pending"],
      default: "sent"
    },
    statusTimestamp: { type: Date },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // For message replies
    isDeleted: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed } // For additional data
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ whatsappMessageId: 1 });

module.exports = mongoose.model("Message", messageSchema);