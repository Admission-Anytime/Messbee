const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  matchType: {
    type: String,
    enum: ['ALL', 'ANY'], // Match ALL rules (AND) or ANY rule (OR)
    default: 'ALL'
  },
  rules: [{
    field: { type: String, required: true }, // e.g., "tags", "optInStatus", or a CustomField key like "customFields.ltv"
    operator: { 
      type: String, 
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'exists', 'not_exists'],
      required: true
    },
    value: { type: mongoose.Schema.Types.Mixed }
  }]
}, {
  timestamps: true
});

const Segment = mongoose.model('Segment', segmentSchema);
module.exports = Segment;

