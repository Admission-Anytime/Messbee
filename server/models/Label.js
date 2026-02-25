const mongoose = require('mongoose');

const LabelSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Label name is required'],
        trim: true,
        maxlength: [25, 'Label name cannot exceed 25 characters']
    },
    desc: { 
        type: String,
        trim: true,
        default: ''
    },
    color: { 
        type: String,
        required: [true, 'Label color is required'],
        default: '#EF4444'
    },
    bg: {
        type: String,
        default: 'bg-emerald-50'
    },
    text: {
        type: String,
        default: 'text-emerald-800'
    },
    creator: {
        type: String,
        default: 'System'
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Label', LabelSchema);
