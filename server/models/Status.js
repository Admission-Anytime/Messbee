const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Status name is required'],
        trim: true,
        maxlength: [50, 'Status name cannot exceed 50 characters']
    },
    description: { 
        type: String,
        trim: true,
        default: ''
    },
    color: { 
        type: String,
        required: [true, 'Status color is required'],
        default: '#3B82F6'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        default: 'System'
    },
    avatar: {
        type: String,
        default: 'https://i.pravatar.cc/150?u=default'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Add index for faster queries
StatusSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Status', StatusSchema);
