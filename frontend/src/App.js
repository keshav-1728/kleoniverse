import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickViewModal } from '@/components/QuickViewModal';
import AdminRoute from '@/components/AdminRoute';
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
import { supabase } from '@/lib/supabase';
import { getCart, addToCart as supabaseAddToCart, removeFromCart as supabaseRemoveFromCart, updateCartQuantity as supabaseUpdateCartQuantity, getWishlist, addToWishlist as supabaseAddToWishlist, removeFromWishlist as supabaseRemoveFromWishlist } from '@/services/supabaseService';
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
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/returns" element={<AdminRoute><AdminReturnsPage /></AdminRoute>} />
        <Route path="/" element={<HomePage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/products" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/new-arrivals" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} sort="new" />} />
        <Route path="/category/:categoryId" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/sale" element={<ProductListingPage onQuickView={setQuickViewProduct} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />} />
        <Route path="/product/:productId" element={<ProductDetailPage onAddToCart={handleAddToCart} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onQuickView={setQuickViewProduct} />} />
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
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
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
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth and load data
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 10000); // 10 second timeout
      
      try {
        // Check for backend JWT token first
        const token = localStorage.getItem('kleoni_token');
        const userData = localStorage.getItem('kleoni_user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(user);
          
          // Load cart from localStorage for now
          const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
          setCart(localCart);
          
          const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
          setWishlist(localWishlist);
        } else {
          // Check Supabase session as fallback
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!isMounted) return;
          
          if (session?.user) {
            setIsAuthenticated(true);
            setUser(session.user);
            
            // Load cart from Supabase
            const { cart: supabaseCart } = await getCart();
            setCart(supabaseCart.map(item => ({
              id: item.id,
              product_id: item.product_id,
              name: item.product?.name || item.name,
              price: item.price,
              image: item.product?.images?.[0] || item.image,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              product: item.product
            })));
            
            // Load wishlist from Supabase
            const { wishlist: supabaseWishlist } = await getWishlist();
            setWishlist(supabaseWishlist.map(item => item.product_id || item.product?.id));
          } else {
            // Load from localStorage for guest users
            const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
            setCart(localCart);
            
            const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
            setWishlist(localWishlist);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Load from localStorage on error
        const localCart = JSON.parse(localStorage.getItem('kleoniverse_cart') || '[]');
        setCart(localCart);
        
        const localWishlist = JSON.parse(localStorage.getItem('kleoniverse_wishlist') || '[]');
        setWishlist(localWishlist);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        
        // Load cart and wishlist from Supabase
        const { cart: supabaseCart } = await getCart();
        setCart(supabaseCart.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          product: item.product
        })));
        
        const { wishlist: supabaseWishlist } = await getWishlist();
        setWishlist(supabaseWishlist.map(item => item.product_id || item.product?.id));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Save cart to localStorage when it changes (for guest users)
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem('kleoniverse_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Save wishlist to localStorage when it changes (for guest users)
  useEffect(() => {
    if (!isAuthenticated && wishlist.length > 0) {
      localStorage.setItem('kleoniverse_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const handleLogout = async () => {
    // Clear backend tokens
    localStorage.removeItem('kleoni_token');
    localStorage.removeItem('kleoni_user_id');
    localStorage.removeItem('kleoni_user');
    localStorage.removeItem('kleoniverse_cart');
    localStorage.removeItem('kleoniverse_wishlist');
    
    // Also sign out from Supabase if logged in there
    await supabase.auth.signOut();
    
    setCart([]);
    setWishlist([]);
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to homepage
    window.location.href = '/';
  };

  const handleAddToCart = async (product, size, color, quantity = 1) => {
    // Handle both object parameter (from ProductDetailPage) and separate parameters
    let finalProduct, finalSize, finalColor, finalQuantity;
    
    if (typeof product === 'object' && product !== null) {
      // Called with single object from ProductDetailPage
      finalProduct = product;
      finalSize = product.size;
      finalColor = product.color;
      finalQuantity = product.quantity || 1;
    } else {
      // Called with separate parameters
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
    
    if (isAuthenticated) {
      // Use Supabase for authenticated users
      const result = await supabaseAddToCart({
        product_id: finalProduct.id,
        quantity: finalQuantity,
        size: finalSize,
        color: finalColor,
        price: finalProduct.price,
      });
      
      if (result.success) {
        // Reload cart from Supabase
        const { cart: supabaseCart } = await getCart();
        setCart(supabaseCart.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          product: item.product
        })));
      }
    } else {
      // Use local state for guest users
      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(
          item => item.product_id === cartItem.product_id && item.size === cartItem.size && item.color === cartItem.color
        );
        
        if (existingIndex >= 0) {
          const newCart = [...prevCart];
          newCart[existingIndex].quantity += finalQuantity;
          localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
          return newCart;
        }
        
        const newCart = [...prevCart, { ...cartItem, id: Date.now().toString() }];
        localStorage.setItem('kleoniverse_cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleUpdateQuantity = async (id, size, color, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(id, size, color);
      return;
    }
    
    if (isAuthenticated) {
      const result = await supabaseUpdateCartQuantity(id, quantity);
      if (result.success) {
        const { cart: supabaseCart } = await getCart();
        setCart(supabaseCart.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.size,
          color: item.color,
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
      const result = await supabaseRemoveFromCart(id);
      if (result.success) {
        const { cart: supabaseCart } = await getCart();
        setCart(supabaseCart.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product?.name || item.name,
          price: item.price,
          image: item.product?.images?.[0] || item.image,
          size: item.size,
          color: item.color,
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
        await supabaseRemoveFromWishlist(productId);
      } else {
        await supabaseAddToWishlist(productId);
      }
      
      // Reload wishlist from Supabase
      const { wishlist: supabaseWishlist } = await getWishlist();
      setWishlist(supabaseWishlist.map(item => item.product_id || item.product?.id));
    } else {
      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
