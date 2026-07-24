const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
}, { timestamps: true });

supplierSchema.index({ tenantId: 1, companyName: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
