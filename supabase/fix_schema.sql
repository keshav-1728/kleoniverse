-- ============================================================================
-- FIX EXISTING SCHEMA
-- Run this to fix database issues after initial setup
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING OBJECTS (if needed)
-- ============================================================================

-- Drop triggers (ignore errors if they don't exist)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_default_address_trigger ON addresses;
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;

-- Drop functions (ignore errors)
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS set_default_address();
DROP FUNCTION IF EXISTS generate_order_number();

-- ============================================================================
-- STEP 2: RECREATE TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-set default address
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE addresses SET is_default = false WHERE user_id = NEW.user_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_default_address_trigger BEFORE INSERT OR UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_default_address();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_prefix TEXT;
    random_suffix TEXT;
BEGIN
    order_prefix := TO_CHAR(NOW(), 'YYMMDD');
    random_suffix := SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 8);
    NEW.order_number := CONCAT('ORD-', order_prefix, '-', UPPER(random_suffix));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- STEP 3: ADD MISSING COLUMNS IF NEEDED
-- ============================================================================

-- Add shipping column to orders if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping') THEN
        ALTER TABLE orders ADD COLUMN shipping DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Add status column (alias for order_status) if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Add image column to order_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'image') THEN
        ALTER TABLE order_items ADD COLUMN image TEXT;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: ENABLE RLS (if not enabled)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: RECREATE RLS POLICIES (drop first if exist)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Variants are viewable by everyone" ON product_variants FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own addresses" ON addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert addresses" ON addresses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own addresses" ON addresses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert cart items" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update cart items" ON cart_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete cart items" ON cart_items FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (user_id = auth.uid() AND status IN ('pending', 'confirmed'));

CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own wishlist" ON wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert wishlist items" ON wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete wishlist items" ON wishlists FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- ============================================================================
-- STEP 6: CREATE FUNCTIONS
-- ============================================================================

-- Get cart items with product details
CREATE OR REPLACE FUNCTION get_cart_items()
RETURNS TABLE (
    id UUID, user_id UUID, product_id UUID,
    size VARCHAR(20), color VARCHAR(50), quantity INTEGER, price DECIMAL(10, 2),
    product_name TEXT, product_images TEXT[], product_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT ci.id, ci.user_id, ci.product_id, ci.size, ci.color, ci.quantity, ci.price,
           p.name::TEXT, p.images, p.category::TEXT, ci.created_at, ci.updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = auth.uid()
    ORDER BY ci.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add to cart
CREATE OR REPLACE FUNCTION add_to_cart(
    p_product_id UUID, p_size VARCHAR(20), p_color VARCHAR(50),
    p_quantity INTEGER, p_price DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_existing_id UUID;
    v_existing_qty INTEGER;
BEGIN
    SELECT id, quantity INTO v_existing_id, v_existing_qty
    FROM cart_items
    WHERE user_id = auth.uid() AND product_id = p_product_id AND size = p_size AND color = p_color;

    IF v_existing_id IS NOT NULL THEN
        UPDATE cart_items SET quantity = v_existing_qty + p_quantity, updated_at = NOW() WHERE id = v_existing_id;
    ELSE
        INSERT INTO cart_items (user_id, product_id, size, color, quantity, price)
        VALUES (auth.uid(), p_product_id, p_size, p_color, p_quantity, p_price);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get addresses
CREATE OR REPLACE FUNCTION get_addresses()
RETURNS TABLE (
    id UUID, user_id UUID, full_name VARCHAR(100), phone VARCHAR(20),
    street_address VARCHAR(255), apartment VARCHAR(255), city VARCHAR(100),
    state VARCHAR(100), postal_code VARCHAR(20), country VARCHAR(100),
    is_default BOOLEAN, address_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM addresses WHERE user_id = auth.uid() ORDER BY is_default DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Save address
CREATE OR REPLACE FUNCTION save_address(
    p_full_name VARCHAR(100), p_phone VARCHAR(20), p_street_address VARCHAR(255),
    p_apartment VARCHAR(255), p_city VARCHAR(100), p_state VARCHAR(100),
    p_postal_code VARCHAR(20), p_country VARCHAR(100), p_is_default BOOLEAN DEFAULT false,
    p_address_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE v_address_id UUID;
BEGIN
    IF p_address_id IS NULL THEN
        INSERT INTO addresses (user_id, full_name, phone, street_address, apartment, city, state, postal_code, country, is_default)
        VALUES (auth.uid(), p_full_name, p_phone, p_street_address, p_apartment, p_city, p_state, p_postal_code, COALESCE(p_country, 'India'), p_is_default)
        RETURNING id INTO v_address_id;
    ELSE
        UPDATE addresses SET full_name = p_full_name, phone = p_phone, street_address = p_street_address,
            apartment = p_apartment, city = p_city, state = p_state, postal_code = p_postal_code,
            country = COALESCE(p_country, 'India'), is_default = p_is_default, updated_at = NOW()
        WHERE id = p_address_id AND user_id = auth.uid();
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user orders
CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
    id UUID, user_id UUID, order_number VARCHAR(50), total_amount DECIMAL(10, 2),
    status VARCHAR(20), payment_status VARCHAR(20), payment_method VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT id, user_id, order_number, total_amount, status, payment_status, payment_method, created_at
    FROM orders WHERE user_id = auth.uid() ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get featured products
CREATE OR REPLACE FUNCTION get_featured_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), base_price DECIMAL(10, 2), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.name::TEXT, p.description::TEXT, p.category, p.base_price, p.images, p.is_featured, p.is_new_arrival
    FROM products p WHERE p.is_active = true AND p.is_featured = true ORDER BY p.created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get new arrivals
CREATE OR REPLACE FUNCTION get_new_arrivals(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), base_price DECIMAL(10, 2), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.name::TEXT, p.description::TEXT, p.category, p.base_price, p.images, p.is_featured, p.is_new_arrival
    FROM products p WHERE p.is_active = true AND p.is_new_arrival = true ORDER BY p.created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get categories
CREATE OR REPLACE FUNCTION get_categories() RETURNS TABLE (category VARCHAR(50)) AS $$
BEGIN RETURN QUERY SELECT DISTINCT p.category FROM products p WHERE p.is_active = true ORDER BY p.category; END;
$$ LANGUAGE plpgsql;

-- Get product variants
CREATE OR REPLACE FUNCTION get_product_variants(p_product_id UUID)
RETURNS TABLE (id UUID, product_id UUID, size VARCHAR(20), color VARCHAR(50), stock INTEGER, price DECIMAL(10, 2)) AS $$
BEGIN
    RETURN QUERY SELECT pv.id, pv.product_id, pv.size, pv.color, pv.stock, pv.price
    FROM product_variants pv WHERE pv.product_id = p_product_id AND pv.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Get available sizes
CREATE OR REPLACE FUNCTION get_available_sizes(p_product_id UUID) RETURNS TABLE (size VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT pv.size FROM product_variants pv WHERE pv.product_id = p_product_id AND pv.is_active = true AND pv.stock > 0 ORDER BY pv.size;
END;
$$ LANGUAGE plpgsql;

-- Get available colors
CREATE OR REPLACE FUNCTION get_available_colors(p_product_id UUID) RETURNS TABLE (color VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT pv.color FROM product_variants pv WHERE pv.product_id = p_product_id AND pv.is_active = true AND pv.stock > 0 ORDER BY pv.color;
END;
$$ LANGUAGE plpgsql;

-- Update order status (admin)
CREATE OR REPLACE FUNCTION update_order_status(p_order_id UUID, p_status VARCHAR(20)) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Only admins can update order status';
    END IF;
    UPDATE orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETE!
-- ============================================================================
