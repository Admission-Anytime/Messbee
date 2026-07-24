const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['purchase', 'sale', 'adjustment'], required: true },
  quantity: { type: Number, required: true }, // positive for purchase/adjustment up, negative for sale/adjustment down
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // Purchase or Sales ID
  referenceNumber: { type: String }, // Invoice number or adjustment note
  notes: { type: String }
}, { timestamps: true });

inventoryLogSchema.index({ tenantId: 1, product: 1 });
inventoryLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
