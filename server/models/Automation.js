const mongoose = require('mongoose');

const AutomationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an automation name'],
    trim: true
  },
  description: {
    type: String
  },
  trigger: {
    type: {
      type: String,
      enum: ['keyword', 'time', 'event', 'webhook'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  actions: [{
    type: {
      type: String,
      enum: ['send_message', 'add_tag', 'remove_tag', 'create_contact', 'webhook'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    delay: {
      type: Number,
      default: 0
    }
  }],
  uiConfig: {
    triggerType: {
      type: String,
      enum: ['inbound', 'abandoned', 'optin', 'tag']
    },
    actionType: {
      type: String,
      enum: ['ai', 'template', 'human']
    },
    selectedAgent: {
      type: String,
      enum: ['support-pro', 'sales-assistant']
    },
    notifyNegativeSentiment: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    triggered: {
      type: Number,
      default: 0
    },
    executed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

AutomationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Automation', AutomationSchema);
