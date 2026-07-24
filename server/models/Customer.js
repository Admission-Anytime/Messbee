const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  gstNumber: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
}, { timestamps: true });

customerSchema.index({ tenantId: 1, mobile: 1 });

module.exports = mongoose.model('Customer', customerSchema);
