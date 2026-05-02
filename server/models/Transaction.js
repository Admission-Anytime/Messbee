const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  desc: {
    type: String,
    required: [true, 'Description is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  status: {
    type: String,
    enum: ['Paid', 'Processing', 'Failed'],
    default: 'Paid'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
