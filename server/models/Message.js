const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    text: { type: String, required: true },
    sender: { type: String, enum: ["me", "them"], required: true }, // 'me' = admin, 'them' = user
    time: { type: String } // e.g. "12:05 PM"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);