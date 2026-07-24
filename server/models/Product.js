const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String },
  description: { type: String },
  purchasePrice: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, required: true, default: 0 },
  gstPercentage: { type: Number, default: 18 },
  hsnCode: { type: String },
  unit: { type: String, default: 'pcs' },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
  productImage: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Prevent index errors if sku is empty initially but we require it anyway
productSchema.index({ tenantId: 1, sku: 1 });
productSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
