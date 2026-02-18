const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#EF4444' },
    createdBy: { type: String, default: 'Admin' },
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Label', labelSchema);