const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    desc: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    color: { type: String, required: true },
  },
  { _id: false }
);

const webhookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Only one webhook configuration per user
    },
    callbackUrl: {
      type: String,
      trim: true,
      default: '',
    },
    verifyToken: {
      type: String,
      trim: true,
      default: '',
    },
    events: {
      type: [webhookEventSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Webhook', webhookSchema);
