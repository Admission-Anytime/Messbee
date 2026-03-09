const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, default: "offline" }, // active, offline
    chatStatus: { type: String, default: "open" }, // open, closed, queue, archived
    isPinned: { type: Boolean, default: false },
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
    businessProfile: {
      description: String,
      email: String,
      address: String,
      websites: [String]
    },
    lastActivity: { type: Date },
    customFields: { type: mongoose.Schema.Types.Mixed }, // For custom data
    notes: { type: String },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Index for faster queries
// Note: phone and whatsappId already have indexes from unique: true
chatSchema.index({ chatStatus: 1, updatedAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);