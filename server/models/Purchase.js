const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  invoiceNumber: { type: String, required: true },
  purchaseDate: { type: Date, required: true, default: Date.now },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  freight: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });

purchaseSchema.index({ tenantId: 1, invoiceNumber: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
