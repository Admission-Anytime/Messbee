const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoiceNumber: { type: String, required: true },
  salesDate: { type: Date, required: true, default: Date.now },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  grandTotal: { type: Number, required: true },
  pdfUrl: { type: String }, // To store generated invoice PDF
  notes: { type: String }
}, { timestamps: true });

salesSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Sales', salesSchema);
