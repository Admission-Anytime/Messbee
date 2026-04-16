const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    desc: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    img: {
      type: String,
      trim: true,
      default: 'https://via.placeholder.com/150?text=Product',
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      maxlength: [60, 'SKU cannot exceed 60 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock level is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    goal: {
      type: Number,
      required: [true, 'Goal is required'],
      min: [1, 'Goal must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Others',
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    shop: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ userId: 1, sku: 1 }, { unique: true });
InventoryItemSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
