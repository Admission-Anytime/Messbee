const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Text', 'Number', 'Date'], default: 'Text' },
    key: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional based on your auth
}, { timestamps: true });

module.exports = mongoose.model('CustomField', customFieldSchema);