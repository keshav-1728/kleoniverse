-- ============================================================================
-- COMPLETE FASHION E-COMMERCE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE EXTENSION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 2: CREATE TABLES
-- ============================================================================

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
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

-- Product Variants Table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size, color)
);

-- Addresses Table
CREATE TABLE addresses (
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

-- Cart Items Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, size, color)
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20) DEFAULT 'prepaid',
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

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists Table
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ============================================================================
-- PART 4: CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- New user profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Default address trigger
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE addresses SET is_default = false WHERE user_id = NEW.user_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Order number trigger
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

-- ============================================================================
-- PART 5: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER set_default_address_trigger BEFORE INSERT OR UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_default_address();
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- PART 6: ENABLE ROW LEVEL SECURITY
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
-- PART 7: CREATE RLS POLICIES
-- ============================================================================

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Product variants policies
CREATE POLICY "Variants are viewable by everyone" ON product_variants FOR SELECT USING (is_active = true);

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert addresses" ON addresses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own addresses" ON addresses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE USING (user_id = auth.uid());

-- Cart items policies
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert cart items" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update cart items" ON cart_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete cart items" ON cart_items FOR DELETE USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (user_id = auth.uid() AND status IN ('pending', 'confirmed'));

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist" ON wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert wishlist items" ON wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete wishlist items" ON wishlists FOR DELETE USING (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- ============================================================================
-- PART 8: CREATE DATABASE FUNCTIONS
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

-- Add to cart (upsert)
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

-- ============================================================================
-- PART 9: ADD SAMPLE DATA
-- ============================================================================

-- Men's Products
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Classic Cotton T-Shirt', 'Premium quality cotton t-shirt with comfortable fit', 'men', 'T-Shirts', 799, 20, 'FashionHub', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], true, true),
('Slim Fit Polos', 'Elegant slim fit polo shirts', 'men', 'T-Shirts', 1299, 15, 'StyleCraft', ARRAY['https://images.unsplash.com/photo-1625910513413-5fc4e5e1a75b?w=800'], true, false),
('Casual Linen Shirt', 'Breathable linen shirt', 'men', 'Shirts', 1899, 25, 'LuxeLinen', ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], true, true),
('Slim Fit Jeans', 'Modern slim fit jeans', 'men', 'Jeans', 2199, 20, 'DenimPro', ARRAY['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800'], true, true),
('Denim Jacket', 'Classic denim jacket', 'men', 'Jackets', 3499, 20, 'DenimCo', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'], true, false);

-- Women's Products
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Silk Blend Blouse', 'Elegant silk blend blouse', 'women', 'Tops', 2499, 20, 'SilkStyle', ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800'], true, true),
('Evening Gown', 'Stunning evening gown', 'women', 'Dresses', 6999, 25, 'Glamour', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], true, true),
('High Rise Skinny Jeans', 'Flattering high rise jeans', 'women', 'Jeans', 1899, 20, 'DenimDiva', ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'], true, true),
('Embroidered Kurta', 'Beautiful embroidered kurta', 'women', 'Kurtas', 2499, 25, 'EthnicGrace', ARRAY['https://images.unsplash.com/photo-1583391728516-9c00b4da073a?w=800'], true, false),
('Summer Maxi Dress', 'Flowing maxi dress', 'women', 'Dresses', 2999, 20, 'SummerBreeze', ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'], true, true);

-- Product Variants
DO $$
DECLARE v_product RECORD; v_size VARCHAR(20); v_color VARCHAR(50); v_price DECIMAL(10, 2); v_stock INTEGER;
BEGIN
    FOR v_product IN SELECT id, name, base_price FROM products LOOP
        v_price := v_product.base_price;
        FOREACH v_size IN ARRAY ARRAY['S', 'M', 'L', 'XL', 'XXL'] LOOP
            FOREACH v_color IN ARRAY ARRAY['Black', 'White', 'Navy', 'Red', 'Green'] LOOP
                v_stock := floor(random() * 45 + 5)::INTEGER;
                IF v_color IN ('Black', 'White') THEN v_stock := v_stock + 20; END IF;
                INSERT INTO product_variants (product_id, size, color, stock, price)
                VALUES (v_product.id, v_size, v_color, v_stock, v_price)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Update variant image URLs
UPDATE product_variants pv
SET image_url = p.images[1]
FROM products p
WHERE pv.product_id = p.id;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT 'Database setup complete! Tables created: ' || 
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') || 
       ' tables, ' || 
       (SELECT COUNT(*) FROM products) || 
       ' products, ' || 
       (SELECT COUNT(*) FROM product_variants) || 
       ' variants.' AS setup_status;
