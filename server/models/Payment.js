const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Phone number is required']
  },
  name: {
    type: String,
    required: [true, 'Customer name is required']
  },
  refId: {
    type: String,
    required: [true, 'Reference ID is required'],
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
