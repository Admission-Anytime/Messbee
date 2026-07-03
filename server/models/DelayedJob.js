const mongoose = require('mongoose');

const delayedJobSchema = new mongoose.Schema({
  customerPhone: { type: String, required: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  nextNodeId: { type: String, required: true },
  executeAt: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'FAILED', 'COMPLETED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

// Index to quickly find jobs that are due
delayedJobSchema.index({ executeAt: 1, status: 1 });

module.exports = mongoose.model('DelayedJob', delayedJobSchema);

