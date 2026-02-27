-- ============================================================================
-- SAMPLE DATA - Run this if products are not showing
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

-- Verify data
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as variants_count FROM product_variants;
