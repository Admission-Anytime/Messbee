const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add an API key name'],
      trim: true,
    },
    key: {
      type: String,
      required: true,
      select: false, // Don't return the hash by default
    },
    maskedKey: {
      type: String,
      required: true,
    },
    permission: {
      type: String,
      enum: ['Read-only', 'Full Access', 'Admin'],
      default: 'Read-only',
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Method to verify key
apiKeySchema.methods.matchKey = async function (enteredKey) {
  return await bcrypt.compare(enteredKey, this.key);
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
