const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: "offline" }, // active, offline
    chatStatus: { type: String, default: "open" }, // open, closed, queue, archived
    isPinned: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    teamMember: { type: String, default: "Unassigned" },
    labels: [{ type: String }],
    avatar: { type: String },
    unread: { type: Number, default: 0 },
    lastMsg: { type: String, default: "" },
    lastMsgTime: { type: String, default: "" } // Storing formatted string for simplicity
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);