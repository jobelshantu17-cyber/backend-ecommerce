const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },

  category: { type: String, required: true },
  image: { type: String },

  sizes: {
    type: [sizeSchema],
    required: true,
    default: []
  },

  stock: { type: Number, default: 0 },

  sku: { type: String, required: true, unique: true },

  inStock: {
    type: Boolean,
    default: function () {
      if (this.sizes && this.sizes.length > 0) {
        return this.sizes.some(s => s.stock > 0);
      }
      return this.stock > 0;
    }
  },

  createdAt: { type: Date, default: Date.now }
});

// ⭐ IMPORTANT: Tell Mongoose to use "products" collection
module.exports = mongoose.model('Product', productSchema, 'products');
