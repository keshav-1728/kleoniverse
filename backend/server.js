/**
 * Backend Server for Fashion E-Commerce
 * Uses Supabase as the database
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://epwpejmbihthqwosdick.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd3Blam1iaWh0aHF3b3NkaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTUwODMsImV4cCI6MjA4NzUzMTA4M30.wZKHLg1H2DK5sZdxcstHFf8SRkGV4nU93pqhDqd-TSs';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd3Blam1iaWh0aHF3b3NkaWNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk1NTA4MywiZXhwIjoyMDg3NTMxMDgzfQ.EV2TMPsJ6Db8h1o_PvMJ3G1I6N2n3gX8P0gT6KzFcWos';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper function for API responses
const apiResponse = (success, data = null, message = '') => {
  return { success, data, message };
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Register (uses Supabase Auth)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } }
    });
    if (error) throw error;
    res.json(apiResponse(true, { user: data.user, session: data.session }, 'Registration successful'));
  } catch (error) {
    res.status(400).json(apiResponse(false, null, error.message));
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json(apiResponse(true, { 
      user: data.user, 
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user_id: data.user.id
      }
    }, 'Login successful'));
  } catch (error) {
    res.status(401).json(apiResponse(false, null, error.message));
  }
});

// Get current user - returns user data from user ID header
app.get('/api/v1/auth/profile', async (req, res) => {
  try {
    // Try to get user from token first
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = req.headers['x-user-id'];
    
    // If we have a token but no user-id, get user from token
    if (!userId && token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }
    
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    // Get profile data using admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) console.log('Profile fetch error:', profileError);
    
    // Return profile data in a user-like format for frontend compatibility
    const userData = {
      id: userId,
      name: profile?.full_name || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      role: profile?.role || 'user',
      created_at: profile?.created_at
    };
    
    res.json(apiResponse(true, { user: userData, profile }));
  } catch (error) {
    res.status(401).json(apiResponse(false, null, error.message));
  }
});

// Update current user profile
app.put('/api/v1/auth/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    const { name, phone } = req.body;
    
    // Update profile data in profiles table (not auth.users)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name || '',
        phone: phone || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (profileError) console.log('Profile upsert error:', profileError);
    
    // Return updated user data in format frontend expects
    res.json(apiResponse(true, { user: { id: userId, name, phone } }, 'Profile updated successfully'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get current user (me)
app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    
    const user = users?.find(u => u.id === userId);
    if (!user) return res.status(404).json(apiResponse(false, null, 'User not found'));
    
    res.json(apiResponse(true, user));
  } catch (error) {
    res.status(401).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Get all products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      (data || []).map(async (product) => {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('size, color, stock, price')
          .eq('product_id', product.id)
          .eq('is_active', true);
        
        return {
          ...product,
          price: product.base_price || product.price, // Use base_price as price for frontend
          sizes: [...new Set(variants?.map(v => v.size) || [])],
          colors: [...new Set(variants?.map(v => v.color) || [])],
          variants
        };
      })
    );

    res.json(apiResponse(true, { products: productsWithVariants, total: count }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get featured products
app.get('/api/v1/products/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(10);
    if (error) throw error;
    
    // Add price field from base_price
    const products = (data || []).map(p => ({
      ...p,
      price: p.base_price || p.price
    }));
    
    res.json(apiResponse(true, { products }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get product by ID
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    if (error) throw error;

    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true);

    res.json(apiResponse(true, { 
      product: { 
        ...product,
        price: product.base_price || product.price,
        sizes: [...new Set(variants?.map(v => v.size) || [])],
        colors: [...new Set(variants?.map(v => v.color) || [])],
        variants 
      } 
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get categories
app.get('/api/v1/products/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
    if (error) throw error;
    
    const categories = [...new Set(data?.map(p => p.category) || [])];
    res.json(apiResponse(true, { categories }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// CART ROUTES
// ============================================================================

// Get cart items
app.get('/api/v1/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    // Use admin client to bypass RLS
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        *,
        product:products(name, images, category)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    res.json(apiResponse(true, { cart: cartItems || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Add to cart
app.post('/api/v1/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    const { product_id, size, color, quantity, price } = req.body;

    // Check if item exists - use admin client
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size)
      .eq('color', color)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('cart_items')
        .insert({ user_id: userId, product_id, size, color, quantity, price });
    }

    res.json(apiResponse(true, null, 'Added to cart'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update cart quantity
app.put('/api/v1/cart/:itemId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await supabaseAdmin.from('cart_items').delete().eq('id', itemId).eq('user_id', userId);
    } else {
      await supabaseAdmin.from('cart_items').update({ quantity }).eq('id', itemId).eq('user_id', userId);
    }

    res.json(apiResponse(true));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Remove from cart
app.delete('/api/v1/cart/:itemId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    await supabaseAdmin.from('cart_items').delete().eq('id', req.params.itemId).eq('user_id', userId);
    res.json(apiResponse(true));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Clear cart
app.delete('/api/v1/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    // Use admin client to bypass RLS
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    res.json(apiResponse(true));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// WISHLIST ROUTES
// ============================================================================

// Get wishlist items
app.get('/api/v1/wishlist', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json(apiResponse(true, { wishlist: data || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Add to wishlist
app.post('/api/v1/wishlist', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json(apiResponse(false, null, 'Product ID required'));
    
    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();
    
    if (existing) {
      return res.json(apiResponse(true, { item: existing }, 'Already in wishlist'));
    }
    
    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(apiResponse(true, { item: data }, 'Added to wishlist'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Remove from wishlist
app.delete('/api/v1/wishlist/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));
    
    const { productId } = req.params;
    
    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (error) throw error;
    
    res.json(apiResponse(true, null, 'Removed from wishlist'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ADDRESS ROUTES
// ============================================================================

// Get addresses
app.get('/api/v1/addresses', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    res.json(apiResponse(true, { addresses: data || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get single address by ID
app.get('/api/v1/addresses/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    const { id } = req.params;
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { address: data }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Save address
app.post('/api/v1/addresses', async (req, res) => {
  try {
    // Get user_id from header (sent by frontend after login)
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated - missing user ID'));

    // Map frontend field names to database field names
    const inputName = req.body.name || req.body.full_name;
    const inputAddress = req.body.address || req.body.address_line1 || req.body.street_address;
    const inputApartment = req.body.apartment;
    const inputCity = req.body.city;
    const inputState = req.body.state;
    const inputPincode = req.body.pincode || req.body.postal_code;
    const inputCountry = req.body.country;
    const inputDefault = req.body.is_default || req.body.isDefault || false;

    // If setting as default, unset others - use admin client
    if (inputDefault) {
      await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({ 
        user_id: userId, 
        full_name: inputName, 
        phone: req.body.phone, 
        street_address: inputAddress, 
        apartment: inputApartment, 
        city: inputCity, 
        state: inputState, 
        postal_code: inputPincode, 
        country: inputCountry || 'India',
        is_default: inputDefault
      })
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { address: data }, 'Address saved'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete address
app.delete('/api/v1/addresses/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    // Use admin client to bypass RLS
    await supabaseAdmin.from('addresses').delete().eq('id', req.params.id).eq('user_id', userId);
    res.json(apiResponse(true));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update address
app.put('/api/v1/addresses/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    const { name, phone, address_line1, apartment, city, state, pincode, country, is_default } = req.body;
    
    // If setting as default, unset others
    if (is_default) {
      await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update({
        full_name: name,
        phone,
        street_address: address_line1,
        apartment,
        city,
        state,
        postal_code: pincode,
        country: country || 'India',
        is_default: is_default || false
      })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { address: data }, 'Address updated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ORDER ROUTES
// ============================================================================

// Get user orders
app.get('/api/v1/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(apiResponse(true, { orders: data || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create order
app.post('/api/v1/orders', async (req, res) => {
  try {
    // Get user_id from header
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json(apiResponse(false, null, 'Not authenticated'));

    const { address_id, payment_method, items } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = payment_method === 'cod' ? 50 : (subtotal > 1500 ? 0 : 50);
    const total = subtotal + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order - use admin client to bypass RLS
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        address_id,
        order_number: orderNumber,
        subtotal,
        shipping,
        total_amount: total,
        payment_method,
        payment_status: payment_method === 'prepaid' ? 'paid' : 'pending',
        status: 'pending',
        product_names: items.map(i => i.product?.name || i.name).join(', '),
        product_sizes: items.map(i => i.size).join(', '),
        product_colors: items.map(i => i.color).join(', '),
        product_images: items.map(i => i.product?.images?.[0] || i.image),
        items_count: items.reduce((sum, i) => sum + i.quantity, 0)
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_name: item.product?.name || item.name || item.product_name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
      image: item.product?.images?.[0] || item.image
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    // Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

    res.json(apiResponse(true, { order }, 'Order placed successfully'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Helper function to check if user is admin
const checkAdmin = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { isAdmin: false, error: 'Not authenticated' };
  
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return { isAdmin: false, error: 'User not found' };
    
    // Use service role client to bypass RLS when checking admin status
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    // If profile doesn't exist or has error, default to not admin
    if (error || !profile) {
      return { isAdmin: false, userId: user.id, error: 'Profile not found' };
    }
    
    return { isAdmin: profile?.role === 'admin', userId: user.id, error: null };
  } catch (error) {
    return { isAdmin: false, error: error.message };
  }
};

// Get dashboard stats (admin)
app.get('/api/v1/admin/stats', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, adminCheck.error || 'Admin only'));
    }

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount');
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get pending orders count
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json(apiResponse(true, {
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
        pendingOrders
      }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all users (admin)
app.get('/api/v1/admin/users', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    // Get profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get all auth users to join with profiles
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();

    // Map profiles with auth data
    const usersWithAuth = (profiles || []).map(profile => {
      const authUser = authUsers?.find(u => u.id === profile.id);
      return {
        ...profile,
        name: profile.full_name || 'N/A',
        email: authUser?.email || 'N/A',
        phone: profile.phone || 'N/A'
      };
    });

    // Get order count for each user
    const usersWithOrders = await Promise.all(usersWithAuth.map(async (profile) => {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      return { ...profile, orderCount: count || 0 };
    }));

    res.json(apiResponse(true, { users: usersWithOrders || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all orders (admin)
app.get('/api/v1/admin/orders', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    // Get orders with user and address info
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get order IDs to fetch order_items
    const orderIds = (orders || []).map(o => o.id).filter(Boolean);
    
    console.log('Admin orders - Total orders:', orders?.length || 0);
    console.log('Admin orders - Order IDs:', orderIds);
    
    // Fetch order_items separately
    let orderItemsMap = {};
    if (orderIds.length > 0) {
      // First check if order_items table exists and has data
      const { data: allItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      
      console.log('Admin orders - Order items error:', itemsError);
      console.log('Admin orders - All items fetched:', allItems?.length || 0);
      
      // Also try to get ALL order_items to see what's in the table
      const { data: allOrderItems } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .limit(10);
      console.log('Admin orders - Sample of ALL order_items in DB:', allOrderItems);
      
      // Group items by order_id
      (allItems || []).forEach(item => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push(item);
      });
    }
    
    // Get all user IDs and address IDs from orders
    const userIds = [...new Set((orders || []).map(o => o.user_id).filter(Boolean))];
    const addressIds = [...new Set((orders || []).map(o => o.address_id).filter(Boolean))];
    
    console.log('Admin orders - User IDs:', userIds);
    console.log('Admin orders - Address IDs:', addressIds);
    
    // Fetch users and addresses separately
    let users = [], addresses = [];
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds);
      users = profiles || [];
      console.log('Admin orders - Users fetched:', users.length, users);
    }
    
    if (addressIds.length > 0) {
      const { data: addrData } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .in('id', addressIds);
      addresses = addrData || [];
      console.log('Admin orders - Addresses fetched:', addresses.length);
    }
    
    // Transform data to match frontend expectations
    const transformedOrders = (orders || []).map(order => {
      const user = users.find(u => u.id === order.user_id);
      const address = addresses.find(a => a.id === order.address_id);
      const items = orderItemsMap[order.id] || [];
      
      // Debug logging
      console.log('Order:', order.id, 'Items found:', items.length, 'Items:', JSON.stringify(items));
      
      return {
        ...order,
        items: items,
        user: user ? {
          id: user.id,
          name: user.full_name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phone || 'N/A'
        } : null,
        address: address ? {
          name: address.full_name || '',
          phone: address.phone || '',
          address_line1: address.street_address || '',
          apartment: address.apartment || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.postal_code || '',
          country: address.country || ''
        } : null
      };
    });
    
    res.json(apiResponse(true, { orders: transformedOrders }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update order status (admin)
app.put('/api/v1/admin/orders/:id/status', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid status'));
    }
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { order: data }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update payment status (admin)
app.put('/api/v1/admin/orders/:id/payment', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { payment_status } = req.body;
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { order: data }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get all products (admin)
app.get('/api/v1/admin/products', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to include computed price and stock from variants
    const products = (data || []).map(product => {
      const variants = product.product_variants || [];
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...product,
        price: product.base_price || 0,
        stock: totalStock || product.stock || 0,
        variants
      };
    });
    
    res.json(apiResponse(true, { products }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create product (admin)
app.post('/api/v1/admin/products', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { name, description, category, base_price, brand, images, is_active, is_featured, is_new, discount, stock, sizes, colors } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        category,
        base_price,
        brand,
        images: images || [],
        is_active: is_active !== false,
        is_featured: is_featured || false,
        is_new: is_new || false,
        discount: discount || 0,
        stock: stock || 0
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create variants if sizes and colors are provided
    if (data && sizes && colors && sizes.length > 0 && colors.length > 0) {
      const variants = [];
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: data.id,
            size,
            color,
            price: base_price,
            stock: stock || 10
          });
        }
      }
      
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(variants);
      }
    }
    
    res.json(apiResponse(true, { product: data }, 'Product created'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update product (admin)
app.put('/api/v1/admin/products/:id', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id } = req.params;
    const { name, description, category, base_price, brand, images, is_active, is_featured, is_new, discount, stock, sizes, colors } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        description,
        category,
        base_price,
        brand,
        images,
        is_active,
        is_featured,
        is_new,
        discount: discount || 0,
        stock: stock || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // If sizes and colors are provided, update variants
    if (sizes && colors && sizes.length > 0 && colors.length > 0) {
      // Delete existing variants
      await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
      
      // Create new variants
      const variants = [];
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: id,
            size,
            color,
            price: base_price,
            stock: stock || 10
          });
        }
      }
      
      if (variants.length > 0) {
        await supabaseAdmin.from('product_variants').insert(variants);
      }
    }
    
    res.json(apiResponse(true, { product: data }, 'Product updated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete product (admin)
app.delete('/api/v1/admin/products/:id', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id } = req.params;
    
    // First delete variants
    await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
    
    // Then delete product
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) throw error;
    res.json(apiResponse(true, null, 'Product deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Get inventory (admin)
app.get('/api/v1/admin/inventory', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { data, error } = await supabase
      .from('product_variants')
      .select('*, product:products(name, category, images)')
      .order('product_id', { ascending: false });

    if (error) throw error;
    res.json(apiResponse(true, { inventory: data || [] }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Update inventory (admin)
app.put('/api/v1/admin/inventory/:id', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id } = req.params;
    const { stock, price, size, color, image } = req.body;

    const { data, error } = await supabase
      .from('product_variants')
      .update({
        stock: stock !== undefined ? stock : undefined,
        price: price !== undefined ? price : undefined,
        size: size !== undefined ? size : undefined,
        color: color !== undefined ? color : undefined,
        image: image !== undefined ? image : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { variant: data }, 'Inventory updated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create product variant (admin)
app.post('/api/v1/admin/products/:id/variants', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id: productId } = req.params;
    const { size, color, stock, price, image } = req.body;

    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        size,
        color,
        stock: stock || 0,
        price: price || 0,
        image,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { variant: data }, 'Variant created'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Delete product variant (admin)
app.delete('/api/v1/admin/variants/:id', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id } = req.params;
    const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', id);

    if (error) throw error;
    res.json(apiResponse(true, null, 'Variant deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Upload product image (admin)
app.post('/api/v1/admin/upload', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { imageData, fileName } = req.body;
    
    if (!imageData || !fileName) {
      return res.status(400).json(apiResponse(false, null, 'Image data and file name required'));
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase Storage
    const filePath = `products/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    res.json(apiResponse(true, { url: publicUrl }, 'Image uploaded'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Make user admin (admin only)
app.put('/api/v1/admin/users/:id/role', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }

    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid role'));
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(apiResponse(true, { user: data }, 'User role updated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Check if current user is admin
app.get('/api/v1/admin/check', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    res.json(apiResponse(true, { isAdmin: adminCheck.isAdmin }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// RETURNS API
// ============================================================================

// Get user's returns
app.get('/api/v1/returns', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(apiResponse(false, null, 'Unauthorized'));
    }
    
    const { data: returns, error } = await supabaseAdmin
      .from('returns')
      .select(`
        *,
        order:orders!order_id(
          order_number,
          total_amount,
          status,
          created_at
        ),
        order_item:order_items!order_item_id(
          product_name,
          size,
          color,
          quantity,
          price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(apiResponse(true, { returns }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Create return request
app.post('/api/v1/returns', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(apiResponse(false, null, 'Unauthorized'));
    }
    
    const { order_id, order_item_id, reason, description } = req.body;
    
    if (!order_id || !reason) {
      return res.status(400).json(apiResponse(false, null, 'Order ID and reason are required'));
    }
    
    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total_amount')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();
    
    if (orderError || !order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    
    // Check if a return already exists for this order/item
    let returnQuery = supabaseAdmin
      .from('returns')
      .select('id')
      .eq('order_id', order_id);
    
    if (order_item_id) {
      returnQuery = returnQuery.eq('order_item_id', order_item_id);
    }
    
    const { data: existingReturn } = await returnQuery.single();
    
    if (existingReturn) {
      return res.status(400).json(apiResponse(false, null, 'Return request already exists for this order'));
    }
    
    // Get order item details for refund amount
    let refundAmount = order.total_amount;
    if (order_item_id) {
      const { data: orderItem } = await supabaseAdmin
        .from('order_items')
        .select('price, quantity')
        .eq('id', order_item_id)
        .single();
      
      if (orderItem) {
        refundAmount = orderItem.price * orderItem.quantity;
      }
    }
    
    // Create return request
    const { data: returnRecord, error } = await supabaseAdmin
      .from('returns')
      .insert({
        order_id,
        user_id: userId,
        order_item_id: order_item_id || null,
        reason,
        description: description || null,
        refund_amount: refundAmount,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(apiResponse(true, { return: returnRecord }, 'Return request submitted successfully'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Admin: Get all returns
app.get('/api/v1/admin/returns', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }
    
    const { status, limit = 50 } = req.query;
    
    let query = supabaseAdmin
      .from('returns')
      .select(`
        *,
        order:orders!order_id(
          order_number,
          total_amount,
          status,
          created_at
        ),
        order_item:order_items!order_item_id(
          product_name,
          size,
          color,
          quantity,
          price,
          image
        ),
        user:profiles!returns_user_id_fkey(
          id,
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data: returns, error } = await query;
    
    if (error) throw error;
    
    res.json(apiResponse(true, { returns }));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// Admin: Update return status
app.put('/api/v1/admin/returns/:id/status', async (req, res) => {
  try {
    const adminCheck = await checkAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(403).json(apiResponse(false, null, 'Admin only'));
    }
    
    const { id } = req.params;
    const { status, refund_amount, admin_notes } = req.body;
    
    if (!status) {
      return res.status(400).json(apiResponse(false, null, 'Status is required'));
    }
    
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid status'));
    }
    
    const updateData = {
      status,
      admin_notes: admin_notes || null
    };
    
    if (refund_amount !== undefined) {
      updateData.refund_amount = refund_amount;
    }
    
    const { data: returnRecord, error } = await supabaseAdmin
      .from('returns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If refund is processed, update order status
    if (status === 'refunded') {
      // Get the order_id from return record
      const { data: returnData } = await supabaseAdmin
        .from('returns')
        .select('order_id')
        .eq('id', id)
        .single();
      
      if (returnData) {
        // Update order status to reflect refund
        await supabaseAdmin
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', returnData.order_id);
      }
    }
    
    res.json(apiResponse(true, { return: returnRecord }, 'Return status updated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, null, error.message));
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase: ${supabaseUrl}`);
});
