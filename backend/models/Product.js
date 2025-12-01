const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  longDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0,
    default: null
  },
  promoPrice: {
    type: Number,
    min: 0,
    default: null
  },
  isPromoActive: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: '₵',
    enum: ['₵', '$', '€', '£']
  },
  category: {
    type: String,
    required: true,
    enum: ['Men', 'Women']
  },

  brand: {
    type: String,
    trim: true,
    maxlength: 100
  },
  sizes: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  material: {
    type: String,
    trim: true
  },
  careInstructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update updatedAt on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
productSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);