const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, default: "" },
    sender: { type: String, enum: ["me", "them"], required: true }, // 'me' = admin, 'them' = user
    time: { type: String }, // e.g. "12:05 PM"
    
    // WhatsApp specific fields
    whatsappMessageId: { type: String, unique: true, sparse: true }, // WhatsApp message ID
    messageType: { 
      type: String, 
      enum: ["text", "image", "video", "audio", "document", "location", "contact", "sticker", "template"],
      default: "text"
    },
    
    // Media fields
    mediaUrl: { type: String }, // URL or path to media file
    mediaType: { type: String }, // MIME type (e.g., 'image/jpeg')
    mediaId: { type: String }, // WhatsApp media ID
    caption: { type: String }, // Caption for media messages
    fileName: { type: String }, // Original filename for documents
    fileSize: { type: Number }, // File size in bytes
    
    // Message status
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "sent"
    },
    statusTimestamp: { type: Date },
    
    // Error handling
    error: { type: String }, // Error message if sending failed
    
    // Additional features
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // For message replies
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    
    // Template message fields
    templateName: { type: String },
    templateLanguage: { type: String },
    
    // Location fields (for location messages)
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      name: { type: String },
      address: { type: String }
    },
    
    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed } // For additional data
  },
  { timestamps: true }
);

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model("Message", messageSchema);