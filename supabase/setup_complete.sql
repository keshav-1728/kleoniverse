-- ============================================================================
-- COMPLETE SUPABASE SETUP SCRIPT
-- Master file that combines schema, RLS, and all functions
-- Run this in Supabase SQL Editor to set up the entire backend
-- ============================================================================

-- ============================================================================
-- PART 1: SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('men', 'women', 'kids', 'accessories')),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    brand VARCHAR(100),
    images TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size, color)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    apartment VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    address_type VARCHAR(20) DEFAULT 'shipping',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'prepaid' CHECK (payment_method IN ('prepaid', 'cod')),
    payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    notes TEXT,
    product_names TEXT,
    product_sizes TEXT,
    product_colors TEXT,
    product_images TEXT[],
    items_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone',
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-set default address
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_default_address_trigger
    BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION set_default_address();

-- Function to generate unique order number
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

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- PART 2: ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Product variants policies
CREATE POLICY "Variants are viewable by everyone" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert variants" ON product_variants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update variants" ON product_variants FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete variants" ON product_variants FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert addresses" ON addresses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own addresses" ON addresses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE USING (user_id = auth.uid());

-- Cart policies
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert cart items" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update cart items" ON cart_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete cart items" ON cart_items FOR DELETE USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (user_id = auth.uid() AND order_status IN ('pending', 'confirmed'));
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update any order" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert wishlist items" ON wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete wishlist items" ON wishlists FOR DELETE USING (user_id = auth.uid());

-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "Admins can update roles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- PART 3: CART FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cart_items()
RETURNS TABLE (
    id UUID, user_id UUID, product_id UUID, variant_id UUID,
    size VARCHAR(20), color VARCHAR(50), quantity INTEGER, price DECIMAL(10, 2),
    product_name TEXT, product_images TEXT[], product_category TEXT,
    variant_stock INTEGER, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT ci.id, ci.user_id, ci.product_id, ci.variant_id, ci.size, ci.color,
           ci.quantity, ci.price, p.name::TEXT, p.images, p.category::TEXT, pv.stock,
           ci.created_at, ci.updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.user_id = auth.uid()
    ORDER BY ci.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_to_cart(
    p_product_id UUID, p_variant_id UUID, p_size VARCHAR(20),
    p_color VARCHAR(50), p_quantity INTEGER, p_price DECIMAL(10, 2)
)
RETURNS TABLE (
    id UUID, user_id UUID, product_id UUID, variant_id UUID,
    size VARCHAR(20), color VARCHAR(50), quantity INTEGER, price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE v_cart_id UUID; v_existing_quantity INTEGER; v_current_stock INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = true) THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;
    SELECT stock INTO v_current_stock FROM product_variants WHERE id = p_variant_id AND product_id = p_product_id AND is_active = true;
    IF v_current_stock IS NULL THEN RAISE EXCEPTION 'Product variant not found'; END IF;
    IF v_current_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock. Available: %', v_current_stock; END IF;
    SELECT id, quantity INTO v_cart_id, v_existing_quantity FROM cart_items WHERE user_id = auth.uid() AND variant_id = p_variant_id;
    IF v_cart_id IS NOT NULL THEN
        UPDATE cart_items SET quantity = v_existing_quantity + p_quantity, updated_at = NOW() WHERE id = v_cart_id;
    ELSE
        INSERT INTO cart_items (user_id, product_id, variant_id, size, color, quantity, price)
        VALUES (auth.uid(), p_product_id, p_variant_id, p_size, p_color, p_quantity, p_price) RETURNING id INTO v_cart_id;
    END IF;
    RETURN QUERY SELECT * FROM cart_items WHERE id = v_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_cart_quantity(p_cart_item_id UUID, p_quantity INTEGER)
RETURNS TABLE (
    id UUID, user_id UUID, product_id UUID, variant_id UUID,
    size VARCHAR(20), color VARCHAR(50), quantity INTEGER, price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE v_current_stock INTEGER; v_variant_id UUID;
BEGIN
    SELECT variant_id INTO v_variant_id FROM cart_items WHERE id = p_cart_item_id AND user_id = auth.uid();
    IF v_variant_id IS NULL THEN RAISE EXCEPTION 'Cart item not found'; END IF;
    SELECT stock INTO v_current_stock FROM product_variants WHERE id = v_variant_id;
    IF p_quantity <= 0 THEN DELETE FROM cart_items WHERE id = p_cart_item_id AND user_id = auth.uid(); RETURN; END IF;
    IF v_current_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock. Available: %', v_current_stock; END IF;
    UPDATE cart_items SET quantity = p_quantity, updated_at = NOW() WHERE id = p_cart_item_id AND user_id = auth.uid();
    RETURN QUERY SELECT * FROM cart_items WHERE id = p_cart_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_from_cart(p_cart_item_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM cart_items WHERE id = p_cart_item_id AND user_id = auth.uid();
    IF NOT FOUND THEN RETURN FALSE; END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_cart() RETURNS INTEGER AS $$
DECLARE v_deleted_count INTEGER;
BEGIN
    DELETE FROM cart_items WHERE user_id = auth.uid();
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_cart_total()
RETURNS TABLE (subtotal DECIMAL(10, 2), item_count INTEGER, total_items INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT COALESCE(SUM(ci.price * ci.quantity), 0)::DECIMAL(10, 2), COUNT(ci.id)::INTEGER, COALESCE(SUM(ci.quantity), 0)::INTEGER
    FROM cart_items ci WHERE ci.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: ADDRESS FUNCTIONS
-- ============================================================================

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

CREATE OR REPLACE FUNCTION save_address(
    p_full_name VARCHAR(100), p_phone VARCHAR(20), p_street_address VARCHAR(255),
    p_apartment VARCHAR(255), p_city VARCHAR(100), p_state VARCHAR(100),
    p_postal_code VARCHAR(20), p_country VARCHAR(100), p_is_default BOOLEAN DEFAULT false,
    p_address_type VARCHAR(20) DEFAULT 'shipping', p_address_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID, user_id UUID, full_name VARCHAR(100), phone VARCHAR(20),
    street_address VARCHAR(255), apartment VARCHAR(255), city VARCHAR(100),
    state VARCHAR(100), postal_code VARCHAR(20), country VARCHAR(100),
    is_default BOOLEAN, address_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE v_address_id UUID;
BEGIN
    IF p_full_name IS NULL OR p_full_name = '' THEN RAISE EXCEPTION 'Full name is required'; END IF;
    IF p_phone IS NULL OR p_phone = '' THEN RAISE EXCEPTION 'Phone number is required'; END IF;
    IF p_street_address IS NULL OR p_street_address = '' THEN RAISE EXCEPTION 'Street address is required'; END IF;
    IF p_city IS NULL OR p_city = '' THEN RAISE EXCEPTION 'City is required'; END IF;
    IF p_state IS NULL OR p_state = '' THEN RAISE EXCEPTION 'State is required'; END IF;
    IF p_postal_code IS NULL OR p_postal_code = '' THEN RAISE EXCEPTION 'Postal code is required'; END IF;

    IF p_address_id IS NULL THEN
        INSERT INTO addresses (user_id, full_name, phone, street_address, apartment, city, state, postal_code, country, is_default, address_type)
        VALUES (auth.uid(), p_full_name, p_phone, p_street_address, p_apartment, p_city, p_state, p_postal_code, COALESCE(p_country, 'India'), p_is_default, p_address_type)
        RETURNING id INTO v_address_id;
    ELSE
        UPDATE addresses SET full_name = p_full_name, phone = p_phone, street_address = p_street_address,
            apartment = p_apartment, city = p_city, state = p_state, postal_code = p_postal_code,
            country = COALESCE(p_country, 'India'), is_default = p_is_default, address_type = p_address_type, updated_at = NOW()
        WHERE id = p_address_id AND user_id = auth.uid() RETURNING id INTO v_address_id;
        IF v_address_id IS NULL THEN RAISE EXCEPTION 'Address not found or access denied'; END IF;
    END IF;
    RETURN QUERY SELECT * FROM addresses WHERE id = v_address_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_address(p_address_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM addresses WHERE id = p_address_id AND user_id = auth.uid();
    IF NOT FOUND THEN RETURN FALSE; END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_default_address(p_address_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE addresses SET is_default = false WHERE user_id = auth.uid();
    UPDATE addresses SET is_default = true, updated_at = NOW() WHERE id = p_address_id AND user_id = auth.uid();
    IF NOT FOUND THEN RETURN FALSE; END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: ORDER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_order(
    p_address_id UUID, p_payment_method VARCHAR(20) DEFAULT 'prepaid',
    p_shipping_cost DECIMAL(10, 2) DEFAULT 0, p_discount_amount DECIMAL(10, 2) DEFAULT 0
)
RETURNS TABLE (
    id UUID, user_id UUID, address_id UUID, order_number VARCHAR(50),
    total_amount DECIMAL(10, 2), subtotal DECIMAL(10, 2), shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2), order_status VARCHAR(20), payment_status VARCHAR(20),
    payment_method VARCHAR(20), product_names TEXT, product_sizes TEXT, product_colors TEXT,
    items_count INTEGER, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE v_order_id UUID; v_subtotal DECIMAL(10, 2) := 0; v_items_count INTEGER := 0;
    v_product_names TEXT := ''; v_product_sizes TEXT := ''; v_product_colors TEXT := '';
    v_cart_item RECORD; v_order_record orders%ROWTYPE;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'User must be authenticated'; END IF;
    IF NOT EXISTS (SELECT 1 FROM addresses WHERE id = p_address_id AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Invalid address'; END IF;
    IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = auth.uid()) THEN RAISE EXCEPTION 'Cart is empty'; END IF;

    FOR v_cart_item IN SELECT ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.size, ci.color, ci.quantity, ci.price, p.name as product_name, pv.stock
        FROM cart_items ci JOIN products p ON ci.product_id = p.id JOIN product_variants pv ON ci.variant_id = pv.id WHERE ci.user_id = auth.uid() LOOP
        IF v_cart_item.stock < v_cart_item.quantity THEN RAISE EXCEPTION 'Insufficient stock for: %', v_cart_item.product_name; END IF;
        v_subtotal := v_subtotal + (v_cart_item.price * v_cart_item.quantity);
        v_items_count := v_items_count + v_cart_item.quantity;
        v_product_names := v_product_names || v_cart_item.product_name || ', ';
        v_product_sizes := v_product_sizes || v_cart_item.size || ', ';
        v_product_colors := v_product_colors || v_cart_item.color || ', ';
    END LOOP;

    v_product_names := TRIM(TRAILING ', ' FROM v_product_names);
    v_product_sizes := TRIM(TRAILING ', ' FROM v_product_sizes);
    v_product_colors := TRIM(TRAILING ', ' FROM v_product_colors);

    INSERT INTO orders (user_id, address_id, total_amount, subtotal, shipping_cost, discount_amount, order_status, payment_status, payment_method, product_names, product_sizes, product_colors, items_count)
    VALUES (auth.uid(), p_address_id, v_subtotal + p_shipping_cost - p_discount_amount, v_subtotal, p_shipping_cost, p_discount_amount, 'pending', CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'paid' END, p_payment_method, v_product_names, v_product_sizes, v_product_colors, v_items_count)
    RETURNING * INTO v_order_record;
    v_order_id := v_order_record.id;

    FOR v_cart_item IN SELECT ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.size, ci.color, ci.quantity, ci.price, p.name as product_name, pv.image_url
        FROM cart_items ci JOIN products p ON ci.product_id = p.id JOIN product_variants pv ON ci.variant_id = pv.id WHERE ci.user_id = auth.uid() LOOP
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, size, color, quantity, price, image_url)
        VALUES (v_order_id, v_cart_item.product_id, v_cart_item.variant_id, v_cart_item.product_name, v_cart_item.size, v_cart_item.color, v_cart_item.quantity, v_cart_item.price, v_cart_item.image_url);
        UPDATE product_variants SET stock = stock - v_cart_item.quantity, updated_at = NOW() WHERE id = v_cart_item.variant_id;
    END LOOP;

    DELETE FROM cart_items WHERE user_id = auth.uid();

    RETURN QUERY SELECT * FROM orders WHERE id = v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
    id UUID, user_id UUID, address_id UUID, order_number VARCHAR(50),
    total_amount DECIMAL(10, 2), subtotal DECIMAL(10, 2), shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2), order_status VARCHAR(20), payment_status VARCHAR(20),
    payment_method VARCHAR(20), product_names TEXT, product_sizes TEXT, product_colors TEXT,
    product_images TEXT[], items_count INTEGER, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM orders WHERE user_id = auth.uid() ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id UUID)
RETURNS TABLE (
    id UUID, user_id UUID, address_id UUID, order_number VARCHAR(50),
    total_amount DECIMAL(10, 2), subtotal DECIMAL(10, 2), shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2), order_status VARCHAR(20), payment_status VARCHAR(20),
    payment_method VARCHAR(20), product_names TEXT, product_sizes TEXT, product_colors TEXT,
    product_images TEXT[], items_count INTEGER, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM orders WHERE id = p_order_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_items(p_order_id UUID)
RETURNS TABLE (
    id UUID, order_id UUID, product_id UUID, variant_id UUID, product_name VARCHAR(255),
    size VARCHAR(20), color VARCHAR(50), quantity INTEGER, price DECIMAL(10, 2),
    image_url TEXT, created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT oi.* FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.order_id = p_order_id AND o.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_order(p_order_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_order_status VARCHAR(20);
BEGIN
    SELECT order_status INTO v_order_status FROM orders WHERE id = p_order_id AND user_id = auth.uid();
    IF v_order_status IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
    IF v_order_status NOT IN ('pending', 'confirmed') THEN RAISE EXCEPTION 'Cannot cancel order with status: %', v_order_status; END IF;
    UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = p_order_id AND user_id = auth.uid();
    UPDATE product_variants pv SET stock = stock + oi.quantity, updated_at = NOW() FROM order_items oi WHERE oi.order_id = p_order_id AND pv.id = oi.variant_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_order_status(p_order_id UUID, p_new_status VARCHAR(20)) RETURNS BOOLEAN AS $$
DECLARE v_is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN RAISE EXCEPTION 'Only admins can update order status'; END IF;
    IF p_new_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN RAISE EXCEPTION 'Invalid order status'; END IF;
    UPDATE orders SET order_status = p_new_status, updated_at = NOW() WHERE id = p_order_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: PRODUCT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_products(p_category TEXT DEFAULT NULL, p_search TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), subcategory VARCHAR(100), base_price DECIMAL(10, 2), discount_percentage DECIMAL(5, 2), brand VARCHAR(100), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.name::TEXT, p.description::TEXT, p.category, p.subcategory, p.base_price, p.discount_percentage, p.brand, p.images, p.is_featured, p.is_new_arrival, p.is_active, p.created_at, p.updated_at
    FROM products p WHERE p.is_active = true AND (p_category IS NULL OR p.category = p_category) AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR p.description ILIKE '%' || p_search || '%')
    ORDER BY p.created_at DESC LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_by_id(p_product_id UUID)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), subcategory VARCHAR(100), base_price DECIMAL(10, 2), discount_percentage DECIMAL(5, 2), brand VARCHAR(100), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT * FROM products WHERE id = p_product_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_variants(p_product_id UUID)
RETURNS TABLE (id UUID, product_id UUID, size VARCHAR(20), color VARCHAR(50), stock INTEGER, price DECIMAL(10, 2), sku VARCHAR(100), image_url TEXT, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT * FROM product_variants WHERE product_id = p_product_id AND is_active = true ORDER BY size, color;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_with_variants(p_product_id UUID)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), subcategory VARCHAR(100), base_price DECIMAL(10, 2), discount_percentage DECIMAL(5, 2), brand VARCHAR(100), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, variants JSONB) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.name::TEXT, p.description::TEXT, p.category, p.subcategory, p.base_price, p.discount_percentage, p.brand, p.images, p.is_featured, p.is_new_arrival, p.is_active, p.created_at, p.updated_at,
    (SELECT jsonb_agg(jsonb_build_object('id', pv.id, 'size', pv.size, 'color', pv.color, 'stock', pv.stock, 'price', pv.price, 'sku', pv.sku, 'image_url', pv.image_url) ORDER BY pv.size, pv.color) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = true) AS variants
    FROM products p WHERE p.id = p_product_id AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_featured_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), subcategory VARCHAR(100), base_price DECIMAL(10, 2), discount_percentage DECIMAL(5, 2), brand VARCHAR(100), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT * FROM products WHERE is_active = true AND is_featured = true ORDER BY created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_new_arrivals(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, description TEXT, category VARCHAR(50), subcategory VARCHAR(100), base_price DECIMAL(10, 2), discount_percentage DECIMAL(5, 2), brand VARCHAR(100), images TEXT[], is_featured BOOLEAN, is_new_arrival BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT * FROM products WHERE is_active = true AND is_new_arrival = true ORDER BY created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_categories() RETURNS TABLE (category VARCHAR(50)) AS $$
BEGIN RETURN QUERY SELECT DISTINCT p.category FROM products p WHERE p.is_active = true ORDER BY p.category; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_subcategories(p_category VARCHAR(50)) RETURNS TABLE (subcategory VARCHAR(100)) AS $$
BEGIN RETURN QUERY SELECT DISTINCT p.subcategory FROM products p WHERE p.is_active = true AND p.category = p_category AND p.subcategory IS NOT NULL ORDER BY p.subcategory; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_available_sizes(p_product_id UUID) RETURNS TABLE (size VARCHAR(20)) AS $$
BEGIN RETURN QUERY SELECT DISTINCT pv.size FROM product_variants pv WHERE pv.product_id = p_product_id AND pv.is_active = true AND pv.stock > 0 ORDER BY CASE pv.size WHEN 'XS' THEN 1 WHEN 'S' THEN 2 WHEN 'M' THEN 3 WHEN 'L' THEN 4 WHEN 'XL' THEN 5 WHEN 'XXL' THEN 6 WHEN '3XL' THEN 7 WHEN '4XL' THEN 8 WHEN '5XL' THEN 9 ELSE 10 END; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_available_colors(p_product_id UUID) RETURNS TABLE (color VARCHAR(50)) AS $$
BEGIN RETURN QUERY SELECT DISTINCT pv.color FROM product_variants pv WHERE pv.product_id = p_product_id AND pv.is_active = true AND pv.stock > 0 ORDER BY pv.color; END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: WISHLIST FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_wishlist_items()
RETURNS TABLE (id UUID, user_id UUID, product_id UUID, created_at TIMESTAMP WITH TIME ZONE, product_name TEXT, product_description TEXT, product_category VARCHAR(50), product_base_price DECIMAL(10, 2), product_discount_percentage DECIMAL(5, 2), product_brand VARCHAR(100), product_images TEXT[], product_is_active BOOLEAN) AS $$
BEGIN
    RETURN QUERY SELECT w.id, w.user_id, w.product_id, w.created_at, p.name::TEXT, p.description::TEXT, p.category, p.base_price, p.discount_percentage, p.brand, p.images, p.is_active
    FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id = auth.uid() ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_to_wishlist(p_product_id UUID)
RETURNS TABLE (id UUID, user_id UUID, product_id UUID, created_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE v_wishlist_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = true) THEN RAISE EXCEPTION 'Product not found or unavailable'; END IF;
    IF EXISTS (SELECT 1 FROM wishlists WHERE user_id = auth.uid() AND product_id = p_product_id) THEN RETURN QUERY SELECT w.id, w.user_id, w.product_id, w.created_at FROM wishlists w WHERE w.user_id = auth.uid() AND w.product_id = p_product_id; END IF;
    INSERT INTO wishlists (user_id, product_id) VALUES (auth.uid(), p_product_id) RETURNING id, user_id, product_id, created_at INTO v_wishlist_id, p_product_id, p_product_id, p_product_id;
    RETURN QUERY SELECT w.id, w.user_id, w.product_id, w.created_at FROM wishlists w WHERE w.id = v_wishlist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_from_wishlist(p_product_id UUID) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM wishlists WHERE user_id = auth.uid() AND product_id = p_product_id; IF NOT FOUND THEN RETURN FALSE; END IF; RETURN TRUE; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MASTER SETUP SCRIPT
-- ============================================================================
