const mongoose = require('mongoose');

const QuickReplySchema = new mongoose.Schema({
    shortcut: { 
        type: String, 
        required: [true, 'Shortcut is mandatory'], 
        unique: true 
    },
    content: { 
        type: String, 
        required: false // ❌ Ab agar content khali hai tab bhi error nahi aayega
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
    }
}, { timestamps: true });

module.exports = mongoose.model('QuickReply', QuickReplySchema);