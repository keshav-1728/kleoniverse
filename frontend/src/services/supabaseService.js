/**
 * Supabase Service Helper Functions
 * Handles all database operations for the e-commerce platform
 */

import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Sign up a new user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in a user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch products from Supabase
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Array>}
 */
export const fetchProducts = async (options = {}) => {
  try {
    const { category, search, limit = 50, offset = 0 } = options;
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return { 
      success: true, 
      products: data || [], 
      total: count || 0 
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message, products: [] };
  }
};

/**
 * Fetch a single product by ID
 * @param {string} productId 
 * @returns {Promise<Object>}
 */
export const fetchProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;

    return { success: true, product: data };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: error.message, product: null };
  }
};

/**
 * Get cart items for the current user
 * @returns {Promise<Array>}
 */
export const getCart = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Return local cart for non-authenticated users
      const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
      return { success: true, cart: localCart };
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, cart: data || [] };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, error: error.message, cart: [] };
  }
};

/**
 * Add item to cart
 * @param {Object} item - Cart item details
 * @returns {Promise<Object>}
 */
export const addToCart = async (item) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Store in localStorage for non-authenticated users
      const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
      const existingIndex = localCart.findIndex(
        ci => ci.product_id === item.product_id && 
              ci.size === item.size && 
              ci.color === item.color
      );

      if (existingIndex >= 0) {
        localCart[existingIndex].quantity += item.quantity || 1;
      } else {
        localCart.push({
          ...item,
          quantity: item.quantity || 1,
        });
      }

      localStorage.setItem('kleoniverse_cart', JSON.stringify(localCart));
      return { success: true, cart: localCart };
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', item.product_id)
      .eq('size', item.size || null)
      .eq('color', item.color || null)
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + (item.quantity || 1) })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          price: item.price,
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from cart
 * @param {string} cartItemId 
 * @returns {Promise<Object>}
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Remove from localStorage
      const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
      const updatedCart = localCart.filter(item => item.id !== cartItemId);
      localStorage.setItem('kleoniverse_cart', JSON.stringify(updatedCart));
      return { success: true, cart: updatedCart };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update cart item quantity
 * @param {string} cartItemId 
 * @param {number} quantity 
 * @returns {Promise<Object>}
 */
export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Update in localStorage
      const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
      const updatedCart = localCart.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      );
      localStorage.setItem('kleoniverse_cart', JSON.stringify(updatedCart));
      return { success: true, cart: updatedCart };
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all items from cart
 * @returns {Promise<Object>}
 */
export const clearCart = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      localStorage.removeItem('kleoniverse_cart');
      return { success: true };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in to place an order' };
    }

    const {
      items,
      addressId,
      paymentMethod,
      subtotal,
      shipping,
      total,
    } = orderData;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        address_id: addressId,
        order_number: orderNumber,
        status: 'pending',
        payment_method: paymentMethod,
        // Simulate payment success for prepaid (not COD)
        payment_status: paymentMethod === 'prepaid' ? 'paid' : 'pending',
        subtotal,
        shipping,
        total_amount: total,
        product_names: items.map(i => i.product?.name || i.name || i.product_name).join(', '),
        product_sizes: items.map(i => i.size).join(', '),
        product_colors: items.map(i => i.color).join(', '),
        product_images: items.map(i => i.product?.images?.[0] || i.image),
        items_count: items.reduce((sum, i) => sum + i.quantity, 0),
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
      image: item.product?.images?.[0] || item.image,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart after successful order
    await clearCart();

    return { success: true, order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch user's orders
 * @returns {Promise<Array>}
 */
export const fetchUserOrders = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in to view orders', orders: [] };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, orders: data || [] };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message, orders: [] };
  }
};

/**
 * Fetch a single order by ID
 * @param {string} orderId 
 * @returns {Promise<Object>}
 */
export const fetchOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { success: true, order: data };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: error.message, order: null };
  }
};

/**
 * Get user's wishlist
 * @returns {Promise<Array>}
 */
export const getWishlist = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
      return { success: true, wishlist: localWishlist };
    }

    // Use backend API instead of direct Supabase call
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    
    const res = await fetch(`${SUPABASE_API_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return { success: false, error: error.message, wishlist: [] };
  }
};

/**
 * Add item to wishlist
 * @param {string} productId 
 * @returns {Promise<Object>}
 */
export const addToWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
      if (!localWishlist.includes(productId)) {
        localWishlist.push(productId);
        localStorage.setItem('kleoniverse_wishlist', JSON.stringify(localWishlist));
      }
      return { success: true, wishlist: localWishlist };
    }

    // Use backend API instead of direct Supabase call
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    
    const res = await fetch(`${SUPABASE_API_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      },
      body: JSON.stringify({ product_id: productId })
    });
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from wishlist
 * @param {string} productId 
 * @returns {Promise<Object>}
 */
export const removeFromWishlist = async (productId) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
      const updatedWishlist = localWishlist.filter(id => id !== productId);
      localStorage.setItem('kleoniverse_wishlist', JSON.stringify(updatedWishlist));
      return { success: true, wishlist: updatedWishlist };
    }

    // Use backend API instead of direct Supabase call
    const token = localStorage.getItem('kleoni_token');
    const userId = localStorage.getItem('kleoni_user_id');
    
    const res = await fetch(`${API_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      }
    });
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's addresses
 * @returns {Promise<Array>}
 */
export const getAddresses = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in', addresses: [] };
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, addresses: data || [] };
  } catch (error) {
    console.error('Error getting addresses:', error);
    return { success: false, error: error.message, addresses: [] };
  }
};

/**
 * Add a new address
 * @param {Object} address 
 * @returns {Promise<Object>}
 */
export const addAddress = async (address) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in' };
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        full_name: address.name,
        phone: address.phone,
        street_address: address.address,
        city: address.city,
        state: address.state,
        postal_code: address.pincode,
        is_default: address.is_default || false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, address: data };
  } catch (error) {
    console.error('Error adding address:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an address
 * @param {string} addressId 
 * @param {Object} address 
 * @returns {Promise<Object>}
 */
export const updateAddress = async (addressId, address) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, address: data };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an address
 * @param {string} addressId 
 * @returns {Promise<Object>}
 */
export const deleteAddress = async (addressId) => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save (create or update) shipping address
 * @param {Object} address - Address details
 * @param {string} [addressId] - Optional address ID for update
 * @returns {Promise<Object>}
 */
export const saveAddress = async (address, addressId = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in to save an address' };
    }

    const addressData = {
      user_id: user.id,
      full_name: address.name,
      phone: address.phone,
      street_address: address.address_line1 || address.address,
      apartment: address.address_line2 || address.apartment || null,
      city: address.city,
      state: address.state,
      postal_code: address.pincode,
      country: address.country || 'India',
      is_default: address.isDefault || address.is_default || false,
    };

    // If setting as default, unset other defaults first
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    let result;
    if (addressId) {
      // Update existing address
      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, address: data };
    } else {
      // Create new address
      const { data, error } = await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single();

      if (error) throw error;
      result = { success: true, address: data };
    }

    return result;
  } catch (error) {
    console.error('Error saving address:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  fetchProducts,
  fetchProductById,
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  saveAddress,
};
