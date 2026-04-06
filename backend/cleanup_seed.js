/**
 * Clean up script to remove old seed products from MongoDB
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://keshavmehrotra2817_db_user:Divyansh%4026@kleoniverse.dpbemb7.mongodb.net/?appName=Kleoniverse';

// Models
const Product = require('./src/models/Product');
const ProductVariant = require('./src/models/ProductVariant');

const seedProductNames = [
  "Classic Cotton T-Shirt",
  "Slim Fit Jeans",
  "Formal Shirt",
  "Casual Hoodie",
  "Running Shoes",
  "Floral Summer Dress",
  "High-Waist Jeans",
  "Elegant Kurti",
  "Casual Top",
  "Heeled Sandals"
];

async function cleanSeedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and delete seed products
    const seedProducts = await Product.find({ name: { $in: seedProductNames } });
    console.log(`Found ${seedProducts.length} seed products to delete`);

    for (const product of seedProducts) {
      // Delete variants first
      await ProductVariant.deleteMany({ productId: product._id });
      // Delete product
      await Product.findByIdAndDelete(product._id);
      console.log(`Deleted product: ${product.name}`);
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log(`Deleted ${seedProducts.length} seed products`);

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning products:', error);
    process.exit(1);
  }
}

cleanSeedProducts();