const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    default: 0
  },
  goal: {
    type: Number,
    default: 100
  },
  img: {
    type: String,
    default: 'https://via.placeholder.com/150?text=Product'
  },
  description: {
    type: String,
    trim: true
  },
  shop: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
