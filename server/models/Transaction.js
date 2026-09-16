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
    enum: ['Paid', 'Processing', 'Failed', 'Verified'],
    default: 'Paid'
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Razorpay Integration Fields
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  // Payment metadata
  metadata: {
    type: {
      scenario: {
        type: String,
        enum: ['subscription', 'credit_topup', 'campaign_cost', 'message_deduction', 'refund'],
        description: 'Type of transaction'
      },
      category: String, // MARKETING, UTILITY, AUTHENTICATION, SERVICE
      recipientPhone: String,
      messageId: mongoose.Schema.ObjectId,
      planType: String,
      billingCycle: String,
      topupAmount: Number,
      campaignId: mongoose.Schema.ObjectId,
      paymentMethod: String,
      failureReason: String,
      reconciled: { type: Boolean, default: false }
    },
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
