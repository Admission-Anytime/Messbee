import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String, // e.g. "Industry", "LTV", "Lead Source"
    required: true
  },
  key: {
    type: String, // e.g. "industry", "ltv", "lead_source" (Used in variables like {{contact.industry}})
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'date', 'dropdown'],
    default: 'string'
  },
  options: [{
    type: String // Used if type === 'dropdown'
  }],
  description: {
    type: String
  }
}, {
  timestamps: true
});

customFieldSchema.index({ tenantId: 1, key: 1 }, { unique: true });

const CustomField = mongoose.model('CustomField', customFieldSchema);
export default CustomField;
