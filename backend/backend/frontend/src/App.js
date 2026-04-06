import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickViewModal } from '@/components/QuickViewModal';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/AdminLayout';
import HomePage from '@/pages/HomePage';
import OurStoryPage from '@/pages/OurStoryPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsAndConditionsPage from '@/pages/TermsAndConditionsPage';
import ProductListingPage from '@/pages/ProductListingPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import WishlistPage from '@/pages/WishlistPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import AccountDashboardPage from '@/pages/AccountDashboardPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminReturnsPage from '@/pages/admin/AdminReturnsPage';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartQuantity as apiUpdateCartQuantity, getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '@/services/apiService';
import '@/App.css';

function AppRoutes({ cart, setCart, wishlist, setWishlist, cartDrawerOpen, setCartDrawerOpen, quickViewProduct, setQuickViewProduct, isAuthenticated, setIsAuthenticated, user, setUser, handleLogout, handleAddToCart, handleUpdateQuantity, handleRemoveItem, handleToggleWishlist }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="App">
      {!isAdminRoute && (
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          onCartOpen={() => setCartDrawerOpen(true)}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>} >
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="returns" element={<AdminReturnsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
        </Route>
        <Route path="/" element={<HomePage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/products" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/new-arrivals" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} sort="new" />} />
        <Route path="/category/:categoryId" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/sale" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/product/:productId" element={<ProductDetailPage onAddToCart={handleAddToCart} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onQuickView={setQuickViewProduct} onOpenCart={() => setCartDrawerOpen(true)} />} />
        <Route path="/search" element={<SearchResultsPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onQuickView={setQuickViewProduct} />} />
        <Route path="/cart" element={<CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} onLogin={handleAddToCart} />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/login" element={<LoginPage onLogin={(userData) => {
          setIsAuthenticated(true);
          setUser(userData);
        }} />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/account" element={<AccountDashboardPage />} />
        <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
      </Routes>

      {!isAdminRoute && <Footer />}

      <CartDrawer
        cart={cart}
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <QuickViewModal
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        onAddToCart={handleAddToCart}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  // Check auth state from localStorage immediately
  const token = localStorage.getItem('kleoni_token');
  const userData = localStorage.getItem('kleoni_user');
  
  let parsedUser = null;
  let parsedIsAuth = false;
  
  try {
    if (userData) {
      parsedUser = JSON.parse(userData);
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  
  parsedIsAuth = !!(token && userData);
  
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(parsedIsAuth);
  const [user, setUser] = useState(parsedUser);
  const [loading, setLoading] = useState(false);

  // Load cart and wishlist from API if authenticated
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && token) {
        try {
          const { cart: apiCart } = await getCart();
          if (apiCart && Array.isArray(apiCart)) {
            setCart(apiCart.map(item => ({
              id: item.variantId,
              product_id: item.productId,
              name: item.product?.name || item.name,
              price: item.price,
              image: item.product?.images?.[0] || item.image,
              size: item.variant?.size || item.size,
              color: item.variant?.color || item.color,
              quantity: item.quantity,
              product: item.product
            })));
          }
          
          const { wishlist: apiWishlist } = await getWishlist();
          if (apiWishlist && Array.isArray(apiWishlist)) {
            setWishlist(apiWishlist.map(item => item.productId || item.product?.id));
          }
        } catch (error) {
          console.error('Error loading data from API:', error);
        }
      }
    };
    
    loadData();
  }, [isAuthenticated, token]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem('kleoniverse_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated && wishlist.length > 0) {
      localStorage.setItem('kleoniverse_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('kleoni_token');
    localStorage.removeItem('kleoni_user_id');
    localStorage.removeItem('kleoni_user');
    localStorage.removeItem('kleoniverse_cart');
    localStorage.removeItem('kleoniverse_wishlist');
    
    setCart([]);
    setWishlist([]);
    setIsAuthenticated(false);
    setUser(null);
    
    window.location.href = '/';
  };

  const handleAddToCart = async (product, size, color, quantity = 1) => {
    let finalProduct, finalSize, finalColor, finalQuantity;
    
    if (typeof product === 'object' && product !== null) {
      finalProduct = product;
      finalSize = size;
      finalColor = color;
      finalQuantity = quantity;
    } else {
      finalProduct = product;
      finalSize = size;
      finalColor = color;
      finalQuantity = quantity;
    }
    
    const cartItem = {
      product_id: finalProduct.id,
      name: finalProduct.name,
      price: finalProduct.price,
      image: finalProduct.images?.[0] || finalProduct.image,
      size: finalSize,
      color: finalColor,
      quantity: finalQuantity,
      product: finalProduct
    };
    
    // Open cart drawer
    setCartDrawerOpen(true);
    
    if (isAuthenticated) {
      try {
        let variantId = finalProduct.variantId;
        
        if (finalProduct.variants && finalProduct.variants.length > 0 && finalSize && finalColor) {
          const matchingVariant = finalProduct.variants.find(
            v => v.size === finalSize && v.color === finalColor
          );
          if (matchingVariant) {
            variantId = matchingVariant.id;
          }
        }
        
        if (variantId) {
          const result = await apiAddToCart({
            productId: finalProduct.id,
            variantId: variantId,
            quantity: finalQuantity,
            price: finalProduct.price,
          });
          
          if (result.success) {
            const { cart: apiCart } = await getCart();
            setCart(apiCart.map(item => ({
              id: item.variantId,
              product_id: item.productId,
              name: item.product?.name || item.name || finalProduct.name,
              price: item.price,
              image: item.product?.images?.[0] || item.image || finalProduct.images?.[0],
              size: item.variant?.size || finalSize,
              color: item.variant?.color || finalColor,
              quantity: item.quantity,
              product: item.product
            })));
            return;
          }
        }
      } catch (error) {
        console.error('API error, falling back to localStorage:', error);
      }
    }
    
    // Use local state for guest users or as fallback
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product_id === cartItem.product_id && item.size === cartItem.size && item.color === cartItem.color
      );
      
      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += finalQuantity;
        if (!isAuthenticated) {
          localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
        }
        return newCart;
      }
      
      const newCart = [...prevCart, { ...cartItem, id: Date.now().toString() }];
      if (!isAuthenticated) {
        localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
      }
      return newCart;
    });
  };

  const handleUpdateQuantity = async (id, size, color, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(id, size, color);
      return;
    }
    
    if (isAuthenticated) {
      const result = await apiUpdateCartQuantity(id, quantity);
      if (result.success) {
        const { cart: apiCart } = await getCart();
        setCart(apiCart.map(item => ({
          id: item.variantId,
          product_id: item.productId,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.variant?.size || item.size,
          color: item.variant?.color || item.color,
          quantity: item.quantity,
          product: item.product
        })));
      }
    } else {
      setCart(prevCart => {
        const newCart = prevCart.map(item =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        );
        localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleRemoveItem = async (id, size, color) => {
    if (isAuthenticated) {
      const result = await apiRemoveFromCart(id);
      if (result.success) {
        const { cart: apiCart } = await getCart();
        setCart(apiCart.map(item => ({
          id: item.variantId,
          product_id: item.productId,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.variant?.size || item.size,
          color: item.variant?.color || item.color,
          quantity: item.quantity,
          product: item.product
        })));
      }
    } else {
      setCart(prevCart => {
        const newCart = prevCart.filter(item =>
          !(item.id === id && item.size === size && item.color === color)
        );
        localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (isAuthenticated) {
      const isInWishlist = wishlist.includes(productId);
      
      if (isInWishlist) {
        await apiRemoveFromWishlist(productId);
      } else {
        await apiAddToWishlist(productId);
      }
      
      const { wishlist: apiWishlist } = await getWishlist();
      setWishlist(apiWishlist.map(item => item.productId || item.product?.id));
    } else {
      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  };

  return (
    <BrowserRouter>
      <AppRoutes
        cart={cart}
        setCart={setCart}
        wishlist={wishlist}
        setWishlist={setWishlist}
        cartDrawerOpen={cartDrawerOpen}
        setCartDrawerOpen={setCartDrawerOpen}
        quickViewProduct={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        user={user}
        setUser={setUser}
        handleLogout={handleLogout}
        handleAddToCart={handleAddToCart}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        handleToggleWishlist={handleToggleWishlist}
      />
    </BrowserRouter>
  );
}

export default App;
