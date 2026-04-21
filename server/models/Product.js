const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      maxlength: [60, 'SKU cannot exceed 60 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Others',
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock level is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    img: {
      type: String,
      trim: true,
      default: 'https://via.placeholder.com/150?text=Product',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

ProductSchema.index({ userId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
