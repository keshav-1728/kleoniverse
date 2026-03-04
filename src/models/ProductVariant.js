const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  }
});

// Create compound index for unique variant
productVariantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
