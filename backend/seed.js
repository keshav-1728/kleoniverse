/**
 * Seed script to add sample products to MongoDB
 */

const mongoose = require('mongoose');

// MongoDB connection - MUST be set via environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Models
const Product = require('./src/models/Product');
const ProductVariant = require('./src/models/ProductVariant');

const sampleProducts = [
  // MEN'S PRODUCTS
  {
    name: "Classic Cotton T-Shirt",
    description: "Premium quality cotton t-shirt for everyday wear",
    category: "men",
    basePrice: 899,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    variants: [
      { size: "S", color: "White", price: 899, stock: 50 },
      { size: "M", color: "White", price: 899, stock: 50 },
      { size: "L", color: "White", price: 899, stock: 50 },
      { size: "XL", color: "White", price: 899, stock: 50 },
      { size: "S", color: "Black", price: 899, stock: 50 },
      { size: "M", color: "Black", price: 899, stock: 50 },
      { size: "L", color: "Black", price: 899, stock: 50 },
      { size: "XL", color: "Black", price: 899, stock: 50 },
    ]
  },
  {
    name: "Slim Fit Jeans",
    description: "Modern slim fit jeans with stretch comfort",
    category: "men",
    basePrice: 1999,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"],
    variants: [
      { size: "28", color: "Blue", price: 1999, stock: 30 },
      { size: "30", color: "Blue", price: 1999, stock: 30 },
      { size: "32", color: "Blue", price: 1999, stock: 30 },
      { size: "34", color: "Blue", price: 1999, stock: 30 },
      { size: "28", color: "Black", price: 2099, stock: 25 },
      { size: "30", color: "Black", price: 2099, stock: 25 },
      { size: "32", color: "Black", price: 2099, stock: 25 },
      { size: "34", color: "Black", price: 2099, stock: 25 },
    ]
  },
  {
    name: "Formal Shirt",
    description: "Elegant formal shirt for office wear",
    category: "men",
    basePrice: 1499,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500"],
    variants: [
      { size: "S", color: "White", price: 1499, stock: 40 },
      { size: "M", color: "White", price: 1499, stock: 40 },
      { size: "L", color: "White", price: 1499, stock: 40 },
      { size: "XL", color: "White", price: 1499, stock: 40 },
      { size: "S", color: "Light Blue", price: 1599, stock: 35 },
      { size: "M", color: "Light Blue", price: 1599, stock: 35 },
      { size: "L", color: "Light Blue", price: 1599, stock: 35 },
      { size: "XL", color: "Light Blue", price: 1599, stock: 35 },
    ]
  },
  {
    name: "Casual Hoodie",
    description: "Warm and stylish hoodie for casual outings",
    category: "men",
    basePrice: 2499,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
    variants: [
      { size: "S", color: "Grey", price: 2499, stock: 25 },
      { size: "M", color: "Grey", price: 2499, stock: 25 },
      { size: "L", color: "Grey", price: 2499, stock: 25 },
      { size: "XL", color: "Grey", price: 2499, stock: 25 },
      { size: "S", color: "Navy", price: 2599, stock: 20 },
      { size: "M", color: "Navy", price: 2599, stock: 20 },
      { size: "L", color: "Navy", price: 2599, stock: 20 },
      { size: "XL", color: "Navy", price: 2599, stock: 20 },
    ]
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioning",
    category: "men",
    basePrice: 3499,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    variants: [
      { size: "7", color: "Red", price: 3499, stock: 20 },
      { size: "8", color: "Red", price: 3499, stock: 20 },
      { size: "9", color: "Red", price: 3499, stock: 20 },
      { size: "10", color: "Red", price: 3499, stock: 20 },
      { size: "7", color: "Black", price: 3699, stock: 15 },
      { size: "8", color: "Black", price: 3699, stock: 15 },
      { size: "9", color: "Black", price: 3699, stock: 15 },
      { size: "10", color: "Black", price: 3699, stock: 15 },
    ]
  },

  // WOMEN'S PRODUCTS
  {
    name: "Floral Summer Dress",
    description: "Beautiful floral dress perfect for summer",
    category: "women",
    basePrice: 1899,
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500"],
    variants: [
      { size: "XS", color: "Floral", price: 1899, stock: 30 },
      { size: "S", color: "Floral", price: 1899, stock: 30 },
      { size: "M", color: "Floral", price: 1899, stock: 30 },
      { size: "L", color: "Floral", price: 1899, stock: 30 },
      { size: "XS", color: "Pink", price: 1799, stock: 25 },
      { size: "S", color: "Pink", price: 1799, stock: 25 },
      { size: "M", color: "Pink", price: 1799, stock: 25 },
      { size: "L", color: "Pink", price: 1799, stock: 25 },
    ]
  },
  {
    name: "High-Waist Jeans",
    description: "Trendy high-waist jeans for women",
    category: "women",
    basePrice: 1799,
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"],
    variants: [
      { size: "26", color: "Blue", price: 1799, stock: 25 },
      { size: "28", color: "Blue", price: 1799, stock: 25 },
      { size: "30", color: "Blue", price: 1799, stock: 25 },
      { size: "32", color: "Blue", price: 1799, stock: 25 },
      { size: "26", color: "Black", price: 1899, stock: 20 },
      { size: "28", color: "Black", price: 1899, stock: 20 },
      { size: "30", color: "Black", price: 1899, stock: 20 },
      { size: "32", color: "Black", price: 1899, stock: 20 },
    ]
  },
  {
    name: "Elegant Kurti",
    description: "Beautiful kurti for traditional occasions",
    category: "women",
    basePrice: 1299,
    images: ["https://images.unsplash.com/photo-1583391728516-a9606fdc7afd?w=500"],
    variants: [
      { size: "S", color: "Purple", price: 1299, stock: 35 },
      { size: "M", color: "Purple", price: 1299, stock: 35 },
      { size: "L", color: "Purple", price: 1299, stock: 35 },
      { size: "XL", color: "Purple", price: 1299, stock: 35 },
      { size: "S", color: "Maroon", price: 1399, stock: 30 },
      { size: "M", color: "Maroon", price: 1399, stock: 30 },
      { size: "L", color: "Maroon", price: 1399, stock: 30 },
      { size: "XL", color: "Maroon", price: 1399, stock: 30 },
    ]
  },
  {
    name: "Casual Top",
    description: "Stylish casual top for daily wear",
    category: "women",
    basePrice: 799,
    images: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500"],
    variants: [
      { size: "S", color: "White", price: 799, stock: 40 },
      { size: "M", color: "White", price: 799, stock: 40 },
      { size: "L", color: "White", price: 799, stock: 40 },
      { size: "S", color: "Yellow", price: 849, stock: 35 },
      { size: "M", color: "Yellow", price: 849, stock: 35 },
      { size: "L", color: "Yellow", price: 849, stock: 35 },
    ]
  },
  {
    name: "Heeled Sandals",
    description: "Elegant heeled sandals for parties",
    category: "women",
    basePrice: 2199,
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500"],
    variants: [
      { size: "36", color: "Gold", price: 2199, stock: 15 },
      { size: "37", color: "Gold", price: 2199, stock: 15 },
      { size: "38", color: "Gold", price: 2199, stock: 15 },
      { size: "39", color: "Gold", price: 2199, stock: 15 },
      { size: "36", color: "Black", price: 2299, stock: 12 },
      { size: "37", color: "Black", price: 2299, stock: 12 },
      { size: "38", color: "Black", price: 2299, stock: 12 },
      { size: "39", color: "Black", price: 2299, stock: 12 },
    ]
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    for (const productData of sampleProducts) {
      const { variants, ...productInfo } = productData;
      
      const product = new Product(productInfo);
      await product.save();
      
      // Create variants
      const variantDocs = variants.map(v => ({
        productId: product._id,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        image: productInfo.images[0]
      }));
      
      await ProductVariant.insertMany(variantDocs);
      
      console.log(`Created product: ${product.name}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`Created ${sampleProducts.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
