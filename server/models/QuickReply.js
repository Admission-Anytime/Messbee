const mongoose = require('mongoose');

const QuickReplySchema = new mongoose.Schema({
    shortcut: { 
        type: String, 
        required: [true, 'Shortcut is mandatory']
    },
    content: { 
        type: String, 
        required: false
    },
    type: { 
        type: String, 
        default: 'TEXT' 
    }, 
    mediaUrl: { 
        type: String 
    }, 
    buttonText: { 
        type: String 
    },
    url: { 
        type: String 
    },
    color: { 
        type: String,
        default: 'bg-emerald-100 text-emerald-600' 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Shortcut unique per user
QuickReplySchema.index({ shortcut: 1, user: 1 }, { unique: true });


module.exports = mongoose.model('QuickReply', QuickReplySchema);