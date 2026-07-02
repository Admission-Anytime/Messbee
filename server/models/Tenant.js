import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tenantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Exclude from queries by default
  },
  name: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password before saving
tenantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
tenantSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
