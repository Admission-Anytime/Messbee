const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, default: "offline" }, // active, offline
    chatStatus: { type: String, default: "open" }, // open, closed, queue, archived
    isPinned: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    teamMember: { type: String, default: "Unassigned" },
    labels: [{ type: String }],
    avatar: { type: String },
    unread: { type: Number, default: 0 },
    lastMsg: { type: String, default: "" },
    lastMsgTime: { type: String, default: "" }, // Storing formatted string for simplicity
    // WhatsApp specific fields
    whatsappId: { type: String, unique: true, sparse: true }, // WhatsApp user ID (phone with country code)
    source: { 
      type: String, 
      enum: ["whatsapp", "web", "api", "manual"],
      default: "whatsapp"
    },
    email: { type: String, default: "" },
    lastInboundAt: { type: Date },
    businessProfile: {
      description: String,
      email: String,
      address: String,
      websites: [String]
    },
    lastActivity: { type: Date },
    customFields: { type: mongoose.Schema.Types.Mixed }, // For custom data
    notes: [
      {
        text: String,
        author: String,
        date: String
      }
    ],
    tags: [{ type: String }]
  },
  { timestamps: true }
);

chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

chatSchema.virtual('replyWindowExpiresAt').get(function () {
  if (!this.lastInboundAt) return null;
  return new Date(this.lastInboundAt.getTime() + 24 * 60 * 60 * 1000);
});

chatSchema.virtual('canSendFreeText').get(function () {
  if (!this.lastInboundAt) return false;
  return Date.now() - new Date(this.lastInboundAt).getTime() < 24 * 60 * 60 * 1000;
});

// Index for faster queries
// Note: phone and whatsappId already have indexes from unique: true
chatSchema.index({ chatStatus: 1, updatedAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);