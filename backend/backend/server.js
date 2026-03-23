/**
 * Backend Server for Fashion E-Commerce
 * Uses MongoDB as the database
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kleoniverse-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 5000;

// Import Models
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const ProductVariant = require('./src/models/ProductVariant');
const CartItem = require('./src/models/CartItem');
const Address = require('./src/models/Address');
const Order = require('./src/models/Order');
const Wishlist = require('./src/models/Wishlist');
const Return = require('./src/models/Returns');

// Middleware - CORS with dynamic origin handling
const allowedOrigins = [
  'https://kleoniverse.com',
  'https://kleoniverse.com/',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'kleoniverse_jwt_secret_key_2024';

// Helper function for API responses
const apiResponse = (success, data = null, message = '') => {
  return { success, data, message };
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Also check x-user-id header for frontend compatibility
    const userId = req.headers['x-user-id'];
    if (userId) {
      req.userId = userId;
      return next();
    }
    return res.status(401).json(apiResponse(false, null, 'Access token required'));
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Check if it's the x-user-id header as fallback
      const userId = req.headers['x-user-id'];
      if (userId) {
        req.userId = userId;
        return next();
      }
      return res.status(403).json(apiResponse(false, null, 'Invalid token'));
    }
    req.userId = user.id;
    req.userRole = user.role;
    next();
  });
};

// Middleware to verify admin role
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json(apiResponse(false, null, 'Admin access required'));
  }
  next();
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json(apiResponse(false, null, 'Email, password and name are required'));
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(apiResponse(false, null, 'Email already registered'));
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone: phone || ''
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json(apiResponse(true, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    }, 'Registration successful'));
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(apiResponse(false, null, 'Email and password are required'));
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(apiResponse(false, null, 'Invalid email or password'));
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(apiResponse(false, null, 'Invalid email or password'));
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json(apiResponse(true, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    }, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get current user profile
app.get('/api/v1/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json(apiResponse(false, null, 'User not found'));
    }
    
    res.json(apiResponse(true, { user }));
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update current user profile
app.put('/api/v1/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json(apiResponse(false, null, 'User not found'));
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.json(apiResponse(true, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    }, 'Profile updated successfully'));
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get current user (me)
app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json(apiResponse(false, null, 'User not found'));
    }
    
    res.json(apiResponse(true, user));
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Get all products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    // Get variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ productId: product._id });
        
        // Use product's sizes/colors if no variants, otherwise use variants
        const sizes = variants.length > 0 
          ? [...new Set(variants.map(v => v.size))]
          : (product.sizes || []);
        const colors = variants.length > 0 
          ? [...new Set(variants.map(v => v.color))]
          : (product.colors || []);
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory || '',
          price: product.basePrice,
          base_price: product.basePrice,
          discount: product.discount || 0,
          stock: product.stock || 0,
          status: product.status || 'active',
          images: product.images || [],
          created_at: product.createdAt,
          sizes: sizes,
          colors: colors,
          variants: variants.map(v => ({
            id: v._id,
            size: v.size,
            color: v.color,
            price: v.price,
            stock: v.stock,
            image: v.image
          }))
        };
      })
    );
    
    res.json(apiResponse(true, { products: productsWithVariants, total }));
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get single product
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    const variants = await ProductVariant.find({ productId: product._id });
    
    // Use product's sizes/colors if no variants, otherwise use variants
    const sizes = variants.length > 0 
      ? [...new Set(variants.map(v => v.size))]
      : (product.sizes || []);
    const colors = variants.length > 0 
      ? [...new Set(variants.map(v => v.color))]
      : (product.colors || []);
    
    res.json(apiResponse(true, {
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory || '',
        price: product.basePrice,
        base_price: product.basePrice,
        discount: product.discount || 0,
        stock: product.stock || 0,
        status: product.status || 'active',
        images: product.images || [],
        created_at: product.createdAt,
        sizes: sizes,
        colors: colors,
        variants: variants.map(v => ({
          id: v._id,
          size: v.size,
          color: v.color,
          price: v.price,
          stock: v.stock,
          image: v.image
        }))
      }
    }));
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get single product by slug
app.get('/api/v1/products/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Extract product ID from slug (last part after dash)
    const productId = slug.split('-').slice(-1)[0];
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    const variants = await ProductVariant.find({ productId: product._id });
    
    const sizes = variants.length > 0 
      ? [...new Set(variants.map(v => v.size))]
      : (product.sizes || []);
    const colors = variants.length > 0 
      ? [...new Set(variants.map(v => v.color))]
      : (product.colors || []);
    
    res.json(apiResponse(true, {
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory || '',
        price: product.basePrice,
        base_price: product.basePrice,
        discount: product.discount || 0,
        stock: product.stock || 0,
        status: product.status || 'active',
        images: product.images || [],
        created_at: product.createdAt,
        sizes: sizes,
        colors: colors
      }
    }, 'Product fetched successfully'));
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create product (admin)
app.post('/api/v1/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, basePrice, images, variants } = req.body;
    
    const product = new Product({
      name,
      description: description || '',
      category: category || 'unisex',
      basePrice: basePrice || 0,
      images: images || []
    });
    
    await product.save();
    
    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantDocs = variants.map(v => ({
        productId: product._id,
        size: v.size,
        color: v.color,
        price: v.price || basePrice,
        stock: v.stock || 0,
        image: v.image || ''
      }));
      
      await ProductVariant.insertMany(variantDocs);
    }
    
    res.status(201).json(apiResponse(true, { product }, 'Product created successfully'));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update product (admin)
app.put('/api/v1/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, basePrice, images } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (basePrice !== undefined) product.basePrice = basePrice;
    if (images) product.images = images;
    
    await product.save();
    
    res.json(apiResponse(true, { product }, 'Product updated successfully'));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete product (admin)
app.delete('/api/v1/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    // Delete associated variants
    await ProductVariant.deleteMany({ productId: req.params.id });
    
    res.json(apiResponse(true, null, 'Product deleted successfully'));
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// CART ROUTES
// ============================================================================

// Get cart items
app.get('/api/v1/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.userId });
    
    // Get product and variant details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        const variant = await ProductVariant.findById(item.variantId);
        
        return {
          id: item._id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          product: product ? {
            id: product._id,
            name: product.name,
            description: product.description,
            images: product.images,
            basePrice: product.basePrice
          } : null,
          variant: variant ? {
            id: variant._id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            image: variant.image
          } : null
        };
      })
    );
    
    res.json(apiResponse(true, { items: itemsWithDetails }));
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Add to cart
app.post('/api/v1/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, variantId, quantity, price } = req.body;
    
    if (!productId || !variantId || !quantity || !price) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields'));
    }
    
    // Check if item already in cart
    let cartItem = await CartItem.findOne({ userId: req.userId, variantId });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new CartItem({
        userId: req.userId,
        productId,
        variantId,
        quantity,
        price
      });
      await cartItem.save();
    }
    
    res.status(201).json(apiResponse(true, { item: cartItem }, 'Item added to cart'));
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update cart item
app.put('/api/v1/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cartItem = await CartItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!cartItem) {
      return res.status(404).json(apiResponse(false, null, 'Cart item not found'));
    }
    
    if (quantity > 0) {
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      await CartItem.deleteOne({ _id: req.params.id });
    }
    
    res.json(apiResponse(true, { item: cartItem }, 'Cart updated'));
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete cart item
app.delete('/api/v1/cart/:id', authenticateToken, async (req, res) => {
  try {
    await CartItem.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json(apiResponse(true, null, 'Item removed from cart'));
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ORDER ROUTES
// ============================================================================

// Create order
app.post('/api/v1/orders', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, razorpayOrderId, paymentStatus } = req.body;
    
    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields: items and totalAmount'));
    }
    
    // Process items - map product/variant to productId/variantId
    // Store as strings if not valid ObjectIds (frontend may send numeric IDs)
    // Also fetch size/color from variant if not provided directly
    const processedItems = await Promise.all(items.map(async (item) => {
      // Check if it's a valid ObjectId (24 hex characters)
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      
      const variantId = isValidObjectId(item.variant || item.variantId) ? item.variant || item.variantId : null;
      
      // If size/color not provided, try to fetch from variant
      let size = item.size;
      let color = item.color;
      
      if ((!size || !color) && variantId) {
        try {
          const variant = await ProductVariant.findById(variantId);
          if (variant) {
            size = size || variant.size;
            color = color || variant.color;
          }
        } catch (err) {
          console.error('Error fetching variant:', err);
        }
      }
      
      return {
        productId: isValidObjectId(item.product || item.productId) ? item.product || item.productId : null,
        variantId: variantId,
        name: item.name,
        size: size,
        color: color,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      };
    }));
    
    // Process shipping address - if it's an ID, fetch from database
    let finalShippingAddress = shippingAddress;
    if (typeof shippingAddress === 'string' && shippingAddress.length === 24) {
      // It's an address ID - fetch the address
      try {
        const address = await Address.findOne({ _id: shippingAddress, userId: req.userId });
        if (address) {
          finalShippingAddress = {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country
          };
        }
      } catch (addrErr) {
        console.error('Error fetching address:', addrErr);
      }
    }
    
    const order = new Order({
      userId: req.userId,
      items: processedItems,
      totalAmount,
      shippingAddress: finalShippingAddress,
      razorpayOrderId: razorpayOrderId || '',
      paymentStatus: paymentStatus || 'pending',
      orderStatus: 'processing'
    });
    
    await order.save();
    
    // Clear cart after order
    await CartItem.deleteMany({ userId: req.userId });
    
    res.status(201).json(apiResponse(true, { order }, 'Order created successfully'));
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get user orders
app.get('/api/v1/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    // Process items to add size/color from variant or product if missing
    const ordersWithVariantDetails = await Promise.all(orders.map(async (order) => {
      const processedItems = await Promise.all(order.items.map(async (item) => {
        let size = item.size;
        let color = item.color;
        
        // If size/color not in item, try to fetch from variant
        if ((!size || !color) && item.variantId) {
          try {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              size = size || variant.size;
              color = color || variant.color;
            }
          } catch (err) {
            console.error('Error fetching variant:', err);
          }
        }
        
        // If still no size/color, try to fetch from product (sizes/colors are arrays)
        if ((!size || !color) && item.productId) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              // Use first available size/color from product's arrays
              size = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
              color = color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        return {
          ...item.toObject(),
          size,
          color
        };
      }));
      
      return {
        ...order.toObject(),
        items: processedItems
      };
    }));
    
    res.json(apiResponse(true, { orders: ordersWithVariantDetails }));
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get single order
app.get('/api/v1/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    
    // Process items to add size/color from variant or product if missing
    const processedItems = await Promise.all(order.items.map(async (item) => {
      let size = item.size;
      let color = item.color;
      
      // If size/color not in item, try to fetch from variant
      if ((!size || !color) && item.variantId) {
        try {
          const variant = await ProductVariant.findById(item.variantId);
          if (variant) {
            size = size || variant.size;
            color = color || variant.color;
          }
        } catch (err) {
          console.error('Error fetching variant:', err);
        }
      }
      
      // If still no size/color, try to fetch from product (sizes/colors are arrays)
      if ((!size || !color) && item.productId) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            // Use first available size/color from product's arrays
            size = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
            color = color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
          }
        } catch (err) {
          console.error('Error fetching product:', err);
        }
      }
      
      return {
        ...item.toObject(),
        size,
        color
      };
    }));
    
    const processedOrder = {
      ...order.toObject(),
      items: processedItems
    };
    
    res.json(apiResponse(true, { order: processedOrder }));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ADDRESS ROUTES
// ============================================================================

// Get user addresses
app.get('/api/v1/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId });
    res.json(apiResponse(true, { addresses }));
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Add address
app.post('/api/v1/addresses', authenticateToken, async (req, res) => {
  try {
    console.log('Address request received, userId:', req.userId);
    console.log('Address body:', JSON.stringify(req.body));
    
    // Accept both frontend and backend field names
    const { fullName, name, phone, street, address, address_line1, city, state, postalCode, pincode, country, isDefault, is_default } = req.body;
    
    // Map frontend fields to backend fields
    const finalFullName = fullName || name;
    const finalStreet = street || address || address_line1;
    const finalPostalCode = postalCode || pincode;
    const finalIsDefault = isDefault || is_default;
    
    console.log('Mapped fields:', { finalFullName, phone, finalStreet, city, state, finalPostalCode });
    
    if (!finalFullName || !phone || !finalStreet || !city || !state || !finalPostalCode) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields: name, phone, address, city, state, pincode'));
    }
    
    if (!req.userId) {
      return res.status(401).json(apiResponse(false, null, 'User not authenticated'));
    }
    
    // If this is default, unset other defaults
    if (finalIsDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    }
    
    const addressDoc = new Address({
      userId: req.userId,
      fullName: finalFullName,
      phone,
      street: finalStreet,
      city,
      state,
      postalCode: finalPostalCode,
      country: country || 'India',
      isDefault: finalIsDefault || false
    });
    
    await addressDoc.save();
    
    res.status(201).json(apiResponse(true, { address: addressDoc }, 'Address added successfully'));
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update address
app.put('/api/v1/addresses/:id', authenticateToken, async (req, res) => {
  try {
    // Accept both frontend and backend field names
    const { fullName, name, phone, street, address, address_line1, city, state, postalCode, pincode, country, isDefault, is_default } = req.body;
    
    // Map frontend fields to backend fields
    const finalFullName = fullName || name;
    const finalStreet = street || address || address_line1;
    const finalPostalCode = postalCode || pincode;
    const finalIsDefault = isDefault || is_default;
    
    const addressDoc = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!addressDoc) {
      return res.status(404).json(apiResponse(false, null, 'Address not found'));
    }
    
    // If this is default, unset other defaults
    if (finalIsDefault) {
      await Address.updateMany({ userId: req.userId, _id: { $ne: req.params.id } }, { isDefault: false });
    }
    
    if (finalFullName) addressDoc.fullName = finalFullName;
    if (phone) addressDoc.phone = phone;
    if (finalStreet) addressDoc.street = finalStreet;
    if (city) addressDoc.city = city;
    if (state) addressDoc.state = state;
    if (finalPostalCode) addressDoc.postalCode = finalPostalCode;
    if (country) addressDoc.country = country;
    if (finalIsDefault !== undefined) addressDoc.isDefault = finalIsDefault;
    
    await addressDoc.save();
    
    res.json(apiResponse(true, { address: addressDoc }, 'Address updated successfully'));
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Set address as default
app.put('/api/v1/addresses/:id/default', authenticateToken, async (req, res) => {
  try {
    // Unset all other defaults
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
    
    // Set this address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDefault: true },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json(apiResponse(false, null, 'Address not found'));
    }
    
    res.json(apiResponse(true, { address }, 'Default address updated successfully'));
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete address
app.delete('/api/v1/addresses/:id', authenticateToken, async (req, res) => {
  try {
    await Address.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json(apiResponse(true, null, 'Address deleted successfully'));
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// WISHLIST ROUTES
// ============================================================================

// Get wishlist
app.get('/api/v1/wishlist', authenticateToken, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.userId });
    
    // Get product details
    const itemsWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          id: item._id,
          productId: item.productId,
          product: product ? {
            id: product._id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.basePrice,
            images: product.images
          } : null
        };
      })
    );
    
    res.json(apiResponse(true, { items: itemsWithProducts }));
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Add to wishlist
app.post('/api/v1/wishlist', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json(apiResponse(false, null, 'Product ID is required'));
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: req.userId, productId });
    if (existing) {
      return res.status(400).json(apiResponse(false, null, 'Product already in wishlist'));
    }
    
    const wishlistItem = new Wishlist({
      userId: req.userId,
      productId
    });
    
    await wishlistItem.save();
    
    res.status(201).json(apiResponse(true, { item: wishlistItem }, 'Added to wishlist'));
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Remove from wishlist
app.delete('/api/v1/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    await Wishlist.deleteOne({ userId: req.userId, productId: req.params.productId });
    res.json(apiResponse(true, null, 'Removed from wishlist'));
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// RETURNS ROUTES
// ============================================================================

// Get user's returns
app.get('/api/v1/returns', authenticateToken, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.userId })
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, { returns }));
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create return request
app.post('/api/v1/returns', authenticateToken, async (req, res) => {
  try {
    // Accept both field names (frontend uses order_id, backend uses orderId)
    const { orderId, order_id, items, totalAmount, reason, description } = req.body;
    const finalOrderId = orderId || order_id;
    
    if (!finalOrderId || !reason) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields: orderId and reason are required'));
    }
    
    // If items not provided, try to get from order
    let returnItems = items;
    let returnTotal = totalAmount;
    
    if (!returnItems || returnItems.length === 0) {
      // Try to fetch items from the order
      try {
        const order = await Order.findById(finalOrderId);
        if (order) {
          returnItems = order.items || [];
          returnTotal = totalAmount || order.totalAmount;
        }
      } catch (err) {
        console.log('Could not fetch order items:', err);
      }
    }
    
    const returnRequest = new Return({
      userId: req.userId,
      orderId: finalOrderId,
      items: returnItems || [],
      totalAmount: returnTotal || 0,
      reason,
      description: description || ''
    });
    
    await returnRequest.save();
    
    res.status(201).json(apiResponse(true, { return: returnRequest }, 'Return request submitted'));
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all returns (admin)
app.get('/api/v1/admin/returns', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('userId', 'name email phone')
      .populate({
        path: 'orderId',
        populate: {
          path: 'items'
        }
      })
      .sort({ createdAt: -1 });
    
    // Transform returns to match frontend expectations
    // Also fetch variant/product details to get size/color
    const transformedReturns = await Promise.all(returns.map(async (ret) => {
      // Try to get items from return, or from order if not available
      let orderItems = ret.items || [];
      let orderData = ret.orderId;
      
      // If no items in return, try to get from order
      if ((!orderItems || orderItems.length === 0) && ret.orderId) {
        try {
          const order = ret.orderId;
          if (order && order.items) {
            orderItems = order.items;
          }
        } catch (e) {
          console.log('Could not get order items:', e);
        }
      }
      
      // Process items to get size/color from variant or product
      const processedItems = await Promise.all(orderItems.map(async (item) => {
        let size = item.size;
        let color = item.color;
        
        // If size/color not in item, try to fetch from variant
        if ((!size || !color) && item.variantId) {
          try {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              size = size || variant.size;
              color = color || variant.color;
            }
          } catch (err) {
            console.error('Error fetching variant:', err);
          }
        }
        
        // If still no size/color, try to fetch from product
        if ((!size || !color) && item.productId) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              size = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
              color = color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        return {
          ...item.toObject ? item.toObject() : item,
          size,
          color,
          quantity: item.quantity || 1,
          price: item.price || 0
        };
      }));
      
      // Get first item details for the return
      const firstItem = processedItems.length > 0 ? processedItems[0] : {};
      
      return {
        _id: ret._id,
        id: ret._id, // For frontend compatibility
        user: ret.userId ? {
          full_name: ret.userId.name || 'Unknown',
          email: ret.userId.email || 'N/A',
          phone: ret.userId.phone || 'N/A'
        } : { full_name: 'Unknown', email: 'N/A', phone: 'N/A' },
        order: orderData ? {
          _id: orderData._id || orderData,
          order_number: (orderData._id || orderData) ? String(orderData._id || orderData).slice(-8) : 'N/A',
          total_amount: orderData.totalAmount || 0,
          created_at: orderData.createdAt
        } : null,
        order_item: processedItems && processedItems.length > 0 ? {
          product_name: firstItem.name || firstItem.product_name || 'Product',
          size: firstItem.size || firstItem.product_size || '',
          color: firstItem.color || firstItem.product_color || '',
          quantity: firstItem.quantity || 1,
          price: firstItem.price || 0
        } : { product_name: 'Product', size: '', color: '', quantity: 1, price: 0 },
        items: processedItems,
        totalAmount: ret.totalAmount || 0,
        reason: ret.reason || 'N/A',
        description: ret.description || '',
        status: ret.status || 'pending',
        refund_amount: ret.totalAmount || 0,
        admin_notes: ret.adminNotes || '',
        createdAt: ret.createdAt,
        updatedAt: ret.updatedAt
      };
    }));
    
    res.json(apiResponse(true, { returns: transformedReturns }));
  } catch (error) {
    console.error('Admin get returns error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update return status (admin)
app.put('/api/v1/admin/returns/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Accept both status and returnStatus (for consistency with orders)
    const { status, returnStatus, admin_notes, refund_amount } = req.body;
    const newStatus = status || returnStatus;
    
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json(apiResponse(false, null, 'Return not found'));
    }
    
    if (newStatus) returnRequest.status = newStatus;
    if (admin_notes) returnRequest.adminNotes = admin_notes;
    if (refund_amount) returnRequest.totalAmount = refund_amount;
    returnRequest.processedAt = new Date();
    returnRequest.processedBy = req.userId;
    
    await returnRequest.save();
    
    res.json(apiResponse(true, { return: returnRequest }, 'Return updated successfully'));
  } catch (error) {
    console.error('Admin update return error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update return status (admin) - /status endpoint
app.put('/api/v1/admin/returns/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Accept both status and returnStatus
    const { status, returnStatus, admin_notes, refund_amount } = req.body;
    const newStatus = status || returnStatus;
    
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json(apiResponse(false, null, 'Return not found'));
    }
    
    if (newStatus) returnRequest.status = newStatus;
    if (admin_notes) returnRequest.adminNotes = admin_notes;
    if (refund_amount) returnRequest.totalAmount = refund_amount;
    returnRequest.processedAt = new Date();
    returnRequest.processedBy = req.userId;
    
    await returnRequest.save();
    
    res.json(apiResponse(true, { return: returnRequest }, 'Return status updated successfully'));
  } catch (error) {
    console.error('Admin update return status error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Get all users (admin)
app.get('/api/v1/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(apiResponse(true, { users }));
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all orders (admin)
app.get('/api/v1/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    // Transform orders to include shipping address
    // Also fetch variant details to get size/color if not stored in order items
    const transformedOrders = await Promise.all(orders.map(async (order) => {
      // Process items to add size/color from variant or product if missing
      const processedItems = await Promise.all(order.items.map(async (item) => {
        let size = item.size;
        let color = item.color;
        
        // If size/color not in item, try to fetch from variant
        if ((!size || !color) && item.variantId) {
          try {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              size = size || variant.size;
              color = color || variant.color;
            }
          } catch (err) {
            console.error('Error fetching variant:', err);
          }
        }
        
        // If still no size/color, try to fetch from product (sizes/colors are arrays)
        if ((!size || !color) && item.productId) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              // Use first available size/color from product's arrays
              size = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
              color = color || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
            }
          } catch (err) {
            console.error('Error fetching product:', err);
          }
        }
        
        return {
          ...item.toObject(),
          size,
          color
        };
      }));
      
      return {
        _id: order._id,
        userId: order.userId,
        items: processedItems,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }));
    
    res.json(apiResponse(true, { 
      orders: transformedOrders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    }));
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update order status (admin)
app.put('/api/v1/admin/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    res.json(apiResponse(true, { order }, 'Order updated successfully'));
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update order status (admin) - specific endpoint for /status
app.put('/api/v1/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    res.json(apiResponse(true, { order }, 'Order status updated successfully'));
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get admin stats
app.get('/api/v1/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    // Transform recent orders
    const transformedRecentOrders = recentOrders.map(order => ({
      id: order._id,
      order_number: order._id.toString().slice(0, 8),
      total_amount: order.totalAmount,
      status: order.orderStatus,
      created_at: order.createdAt,
      user: order.userId ? {
        name: order.userId.name,
        email: order.userId.email
      } : null
    }));
    
    res.json(apiResponse(true, {
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders: transformedRecentOrders
      }
    }));
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all products (admin)
app.get('/api/v1/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ productId: product._id });
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory || '',
          basePrice: product.basePrice,
          discount: product.discount || 0,
          stock: product.stock || 0,
          sizes: product.sizes || [],
          colors: product.colors || [],
          status: product.status || 'active',
          images: product.images || [],
          createdAt: product.createdAt,
          variants: variants.map(v => ({
            id: v._id,
            size: v.size,
            color: v.color,
            price: v.price,
            stock: v.stock
          }))
        };
      })
    );
    
    res.json(apiResponse(true, { products: productsWithVariants }));
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create product (admin)
app.post('/api/v1/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, subcategory, base_price, discount, stock, sizes, colors, images, status } = req.body;
    
    if (!name || !base_price) {
      return res.status(400).json(apiResponse(false, null, 'Name and price are required'));
    }
    
    const product = new Product({
      name,
      description: description || '',
      category: category || 'unisex',
      subcategory: subcategory || '',
      basePrice: base_price,
      discount: discount || 0,
      stock: stock || 0,
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      status: status || 'active'
    });
    
    await product.save();
    
    res.status(201).json(apiResponse(true, { product: { id: product._id, ...product.toObject() } }, 'Product created successfully'));
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update product (admin)
app.put('/api/v1/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, subcategory, base_price, discount, stock, sizes, colors, images, status } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (base_price) product.basePrice = base_price;
    if (discount !== undefined) product.discount = discount;
    if (stock !== undefined) product.stock = stock;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;
    if (images) product.images = images;
    if (status) product.status = status;
    
    await product.save();
    
    res.json(apiResponse(true, { product: { id: product._id, ...product.toObject() } }, 'Product updated successfully'));
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete product (admin)
app.put('/api/v1/admin/variants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { stock, price } = req.body;
    
    const variant = await ProductVariant.findById(req.params.id);
    if (!variant) {
      return res.status(404).json(apiResponse(false, null, 'Variant not found'));
    }
    
    if (stock !== undefined) variant.stock = stock;
    if (price !== undefined) variant.price = price;
    
    await variant.save();
    
    res.json(apiResponse(true, { variant }, 'Variant updated successfully'));
  } catch (error) {
    console.error('Admin update variant error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete product (admin)
app.delete('/api/v1/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json(apiResponse(false, null, 'Product not found'));
    }
    
    // Delete associated variants
    await ProductVariant.deleteMany({ productId: req.params.id });
    
    res.json(apiResponse(true, null, 'Product deleted successfully'));
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// PAYMENT ROUTES (Razorpay)
// ============================================================================

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
app.post('/api/v1/payment/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(apiResponse(false, null, 'Valid amount is required'));
    }

    // Amount should be in paise (Razorpay expects smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to create payment order: ' + error.message));
  }
});

// Verify payment signature
app.post('/api/v1/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json(apiResponse(false, null, 'All payment details are required'));
    }

    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.status(200).json(apiResponse(true, null, 'Payment verified successfully'));
    } else {
      res.status(400).json(apiResponse(false, null, 'Invalid payment signature'));
    }
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json(apiResponse(false, null, 'Payment verification failed: ' + error.message));
  }
});

// Get payment status
app.get('/api/v1/payment/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        captured: payment.captured
      }
    });
  } catch (error) {
    console.error('Razorpay payment fetch error:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to get payment status: ' + error.message));
  }
});

// ============================================================================
// IMAGE UPLOAD ENDPOINT
// ============================================================================

// Upload single image
app.post('/api/v1/upload/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(apiResponse(false, null, 'No image provided'));
    }
    
    // Return the Cloudinary URL
    const imageUrl = req.file.path;
    res.json(apiResponse(true, { url: imageUrl }, 'Image uploaded successfully'));
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Upload multiple images
app.post('/api/v1/upload/images', authenticateToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(apiResponse(false, null, 'No images provided'));
    }
    
    // Return the Cloudinary URLs
    const imageUrls = req.files.map(file => file.path);
    res.json(apiResponse(true, { urls: imageUrls }, 'Images uploaded successfully'));
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// DYNAMIC SITEMAP XML ENDPOINT
// ============================================================================

app.get('/sitemap.xml', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticUrls = [
      { loc: 'https://kleoniverse.com/', changefreq: 'daily', priority: '1.0' },
      { loc: 'https://kleoniverse.com/shop', changefreq: 'daily', priority: '0.9' },
      { loc: 'https://kleoniverse.com/products', changefreq: 'daily', priority: '0.9' },
      { loc: 'https://kleoniverse.com/wishlist', changefreq: 'weekly', priority: '0.7' },
      { loc: 'https://kleoniverse.com/cart', changefreq: 'weekly', priority: '0.7' },
      { loc: 'https://kleoniverse.com/checkout', changefreq: 'weekly', priority: '0.7' },
      { loc: 'https://kleoniverse.com/login', changefreq: 'monthly', priority: '0.6' },
      { loc: 'https://kleoniverse.com/account', changefreq: 'weekly', priority: '0.7' },
      { loc: 'https://kleoniverse.com/our-story', changefreq: 'monthly', priority: '0.6' },
      { loc: 'https://kleoniverse.com/help', changefreq: 'monthly', priority: '0.5' },
      { loc: 'https://kleoniverse.com/privacy-policy', changefreq: 'yearly', priority: '0.4' },
      { loc: 'https://kleoniverse.com/terms-conditions', changefreq: 'yearly', priority: '0.4' }
    ];
    
    // Category pages
    const categoryUrls = [
      { loc: 'https://kleoniverse.com/shop/men', changefreq: 'weekly', priority: '0.8' },
      { loc: 'https://kleoniverse.com/shop/women', changefreq: 'weekly', priority: '0.8' },
      { loc: 'https://kleoniverse.com/shop/unisex', changefreq: 'weekly', priority: '0.8' },
      { loc: 'https://kleoniverse.com/shop/unifit', changefreq: 'weekly', priority: '0.8' }
    ];
    
    // Fetch active products from MongoDB
    const products = await Product.find({ status: 'active' }).select('slug createdAt').lean();
    
    // Generate product URLs
    const productUrls = products.map(product => ({
      loc: `https://kleoniverse.com/product/${product.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : today
    }));
    
    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static URLs
    staticUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add category URLs
    categoryUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add product URLs
    productUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ============================================================================
// CONNECT TO MONGODB AND START SERVER
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://keshavmehrotra2817_db_user:Divyansh%4026@kleoniverse.dpbemb7.mongodb.net/?appName=Kleoniverse';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
