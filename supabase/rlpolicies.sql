-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security policies for the ecommerce database
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCTS - Public read, Admin write
-- ============================================================================

-- Anyone can view active products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (is_active = true);

-- Only admins can insert/update/delete products
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete products"
ON products FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- PRODUCT VARIANTS - Public read, Admin write
-- ============================================================================

-- Anyone can view active variants
CREATE POLICY "Variants are viewable by everyone"
ON product_variants FOR SELECT
USING (
    is_active = true 
    AND product_id IN (SELECT id FROM products WHERE is_active = true)
);

-- Only admins can modify variants
CREATE POLICY "Admins can insert variants"
ON product_variants FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can update variants"
ON product_variants FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete variants"
ON product_variants FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- ADDRESSES - User can only access their own addresses
-- ============================================================================

-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON addresses FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own addresses
CREATE POLICY "Users can insert addresses"
ON addresses FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON addresses FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON addresses FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- CART ITEMS - User can only access their own cart
-- ============================================================================

-- Users can view their own cart
CREATE POLICY "Users can view their own cart"
ON cart_items FOR SELECT
USING (user_id = auth.uid());

-- Users can insert items to their own cart
CREATE POLICY "Users can insert cart items"
ON cart_items FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own cart items
CREATE POLICY "Users can update cart items"
ON cart_items FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own cart items
CREATE POLICY "Users can delete cart items"
ON cart_items FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- ORDERS - User can only access their own orders
-- ============================================================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own orders (limited to status)
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
USING (
    user_id = auth.uid()
    AND order_status IN ('pending', 'confirmed')
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update any order
CREATE POLICY "Admins can update any order"
ON orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- ORDER ITEMS - User can only access items from their orders
-- ============================================================================

-- Users can view their order items
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Users can insert order items (through order creation)
CREATE POLICY "Users can insert order items"
ON order_items FOR INSERT
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- WISHLISTS - User can only access their own wishlist
-- ============================================================================

-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist"
ON wishlists FOR SELECT
USING (user_id = auth.uid());

-- Users can add to their own wishlist
CREATE POLICY "Users can insert wishlist items"
ON wishlists FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can remove from their own wishlist
CREATE POLICY "Users can delete wishlist items"
ON wishlists FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- PROFILES - Users can view public profiles, edit own
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
);

-- Admins can update user roles
CREATE POLICY "Admins can update roles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
);

-- ============================================================================
-- SERVICE ROLE BYPASS
-- ============================================================================

-- NOTE: Service role key bypasses all RLS policies
-- Keep your service role key secure and never expose it in client-side code

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
