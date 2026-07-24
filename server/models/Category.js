const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
