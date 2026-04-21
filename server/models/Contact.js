const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Core fields
    name: {
      type: String,
      trim: true,
    },

    whatsapp: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: '',
      // ❌ REMOVED: unique: true  ← this was causing the duplicate error
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    // Profile
    company: {
      type: String,
      trim: true,
      default: '',
    },

    institute: {
      type: String,
      trim: true,
      default: '',
    },

    address: {
      type: String,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      trim: true,
      default: '',
    },

    country: {
      type: String,
      trim: true,
      default: '',
    },

    // CRM
    status: {
      type: String,
      enum: ['ACTIVE', 'WARM', 'INACTIVE', 'COLD'],
      default: 'ACTIVE',
    },

    labels: [
      {
        type: String,
        trim: true,
      }
    ],

    // Avatar display
    initials: {
      type: String,
      default: '',
    },

    color: {
      type: String,
      default: '#4CAF50',
    },

    // Import tracking
    importedFrom: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ WhatsApp unique per user only (not globally)
ContactSchema.index(
  { user: 1, whatsapp: 1 },
  {
    unique: true,
    partialFilterExpression: {
      whatsapp: { $exists: true, $ne: null, $ne: '' },
    },
  }
);

// ✅ Text index for search
ContactSchema.index({ name: 'text', email: 'text', whatsapp: 'text' });

// ✅ Auto-generate initials and color if not provided
ContactSchema.pre('save', function (next) {
  if (!this.initials && this.name) {
    this.initials = this.name.substring(0, 2).toUpperCase();
  }
  if (!this.color) {
    const colors = [
      '#4CAF50', '#FF9800', '#607D8B', '#5C6BC0', '#E91E63',
      '#009688', '#795548', '#3F51B5', '#FF5722', '#9C27B0',
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);