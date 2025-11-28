const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // Store category as NAME (string)
  category: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: false
  },

  // ⭐️ NEW — Size-wise Stock
  sizes: {
    type: [sizeSchema],   // e.g. [{ size: "8", stock: 10 }]
    required: true,
    default: []
  },

  // ⚠️ optional: keep global stock for backward compatibility
  stock: {
    type: Number,
    default: 0
  },

  // ⭐️ NEW — SKU (unique product code)
  sku: {
    type: String,
    required: true,
    unique: true
  },

  // ⭐️ NEW — Computed Availability
  inStock: {
    type: Boolean,
    default: function () {
      // true if ANY size has stock > 0
      if (this.sizes && this.sizes.length > 0) {
        return this.sizes.some(s => s.stock > 0);
      }
      return this.stock > 0;
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
