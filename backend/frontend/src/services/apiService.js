/**
 * API Service using REST API (MongoDB backend)
 */

const API_URL = process.env.REACT_APP_API_URL || 'https://kleoniverse-backend.onrender.com/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('kleoni_token');
  return token ? { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  } : { 'Content-Type': 'application/json' };
};

// Cart functions
export const getCart = async () => {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, cart: data.data.items || [] };
    }
    return { success: false, cart: [] };
  } catch (error) {
    console.error('getCart error:', error);
    return { success: false, cart: [] };
  }
};

export const addToCart = async ({ productId, variantId, quantity, price }) => {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, variantId, quantity, price })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('addToCart error:', error);
    return { success: false, message: error.message };
  }
};

export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('updateCartQuantity error:', error);
    return { success: false, message: error.message };
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('removeFromCart error:', error);
    return { success: false, message: error.message };
  }
};

// Wishlist functions
export const getWishlist = async () => {
  try {
    const res = await fetch(`${API_URL}/wishlist`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, wishlist: data.data.items || [] };
    }
    return { success: false, wishlist: [] };
  } catch (error) {
    console.error('getWishlist error:', error);
    return { success: false, wishlist: [] };
  }
};

export const addToWishlist = async (productId) => {
  try {
    const res = await fetch(`${API_URL}/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('addToWishlist error:', error);
    return { success: false, message: error.message };
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const res = await fetch(`${API_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    return { success: false, message: error.message };
  }
};

// Order functions
export const createOrder = async (orderData) => {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('createOrder error:', error);
    return { success: false, message: error.message };
  }
};

export const getOrders = async () => {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, orders: data.data.orders || [] };
    }
    return { success: false, orders: [] };
  } catch (error) {
    console.error('getOrders error:', error);
    return { success: false, orders: [] };
  }
};

export const getOrder = async (orderId) => {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getOrder error:', error);
    return { success: false, message: error.message };
  }
};

// Address functions
export const getAddresses = async () => {
  try {
    const res = await fetch(`${API_URL}/addresses`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, addresses: data.data.addresses || [] };
    }
    return { success: false, addresses: [] };
  } catch (error) {
    console.error('getAddresses error:', error);
    return { success: false, addresses: [] };
  }
};

export const addAddress = async (addressData) => {
  try {
    const res = await fetch(`${API_URL}/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('addAddress error:', error);
    return { success: false, message: error.message };
  }
};

// Alias for backward compatibility
export const saveAddress = addAddress;

export const updateAddress = async (addressId, addressData) => {
  try {
    const res = await fetch(`${API_URL}/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('updateAddress error:', error);
    return { success: false, message: error.message };
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const res = await fetch(`${API_URL}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('deleteAddress error:', error);
    return { success: false, message: error.message };
  }
};

// Product functions
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${queryString}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getProducts error:', error);
    return { success: false, data: { products: [] } };
  }
};

export const getProduct = async (productId) => {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getProduct error:', error);
    return { success: false, message: error.message };
  }
};

// User profile functions
export const getProfile = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getProfile error:', error);
    return { success: false, message: error.message };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('updateProfile error:', error);
    return { success: false, message: error.message };
  }
};
