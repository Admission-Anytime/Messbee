const mongoose = require('mongoose');

const salesInquirySchema = new mongoose.Schema(
  {
    inquiryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    companySize: {
      type: String,
      default: '11-50'
    },
    messageVolume: {
      type: String,
      default: '50,000 - 250,000 / mo'
    },
    agentsNeeded: {
      type: String,
      default: '11-25 Agents'
    },
    selectedFeatures: [{
      type: String
    }],
    message: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'converted', 'closed'],
      default: 'new'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'sales_inquiries'
  }
);

salesInquirySchema.index({ createdAt: -1 });
salesInquirySchema.index({ email: 1 });

module.exports = mongoose.model('SalesInquiry', salesInquirySchema);
