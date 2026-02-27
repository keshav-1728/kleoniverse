-- ============================================================================
-- SAMPLE TEST DATA
-- Insert sample products and variants for development
-- ============================================================================

-- ============================================================================
-- MEN'S PRODUCTS
-- ============================================================================

-- Men's T-Shirt Collection
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Classic Cotton T-Shirt', 'Premium quality cotton t-shirt with comfortable fit. Perfect for everyday wear.', 'men', 'T-Shirts', 799, 20, 'FashionHub', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], true, true),
('Slim Fit Polos', 'Elegant slim fit polo shirts made from premium fabric. Ideal for casual and semi-formal occasions.', 'men', 'T-Shirts', 1299, 15, 'StyleCraft', ARRAY['https://images.unsplash.com/photo-1625910513413-5fc4e5e1a75b?w=800'], true, false),
('Graphic Print T-Shirt', 'Modern graphic print t-shirt with vibrant designs. Stand out from the crowd.', 'men', 'T-Shirts', 999, 10, 'UrbanWear', ARRAY['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'], false, true);

-- Men's Shirts
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Casual Linen Shirt', 'Breathable linen shirt perfect for summer. Lightweight and comfortable.', 'men', 'Shirts', 1899, 25, 'LuxeLinen', ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], true, true),
('Formal Business Shirt', 'Crisp formal shirt for business meetings. Wrinkle-resistant fabric.', 'men', 'Shirts', 2499, 15, 'Executive', ARRAY['https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=800'], true, false),
('Denim Shirt', 'Classic denim shirt with modern styling. Durable and fashionable.', 'men', 'Shirts', 1599, 10, 'DenimCo', ARRAY['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800'], false, true);

-- Men's Jeans
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Slim Fit Jeans', 'Modern slim fit jeans with stretch comfort. Perfect for casual outings.', 'men', 'Jeans', 2199, 20, 'DenimPro', ARRAY['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800'], true, true),
('Regular Fit Jeans', 'Classic regular fit jeans. Timeless style that never goes out of fashion.', 'men', 'Jeans', 1999, 15, 'ClassicWear', ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'], true, false),
('Ripped Distress Jeans', 'Trendy ripped jeans for the bold. Make a statement.', 'men', 'Jeans', 2799, 25, 'UrbanEdge', ARRAY['https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800'], false, true);

-- Men's Jackets
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Denim Jacket', 'Classic denim jacket for all seasons. Timeless style essential.', 'men', 'Jackets', 3499, 20, 'DenimCo', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'], true, true),
('Leather Biker Jacket', 'Premium leather jacket with sleek design. Bold and rebellious.', 'men', 'Jackets', 8999, 15, 'LeatherLux', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'], true, false),
('Winter Parka', 'Warm winter parka with hood. Stay cozy in cold weather.', 'men', 'Jackets', 5999, 30, 'WinterWear', ARRAY['https://images.unsplash.com/photo-1544923246-77307dd628b8?w=800'], false, true);

-- ============================================================================
-- WOMEN'S PRODUCTS
-- ============================================================================

-- Women's Tops
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Silk Blend Blouse', 'Elegant silk blend blouse for work and parties. Luxurious feel.', 'women', 'Tops', 2499, 20, 'SilkStyle', ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800'], true, true),
('Cotton Casual Top', 'Comfortable cotton top for daily wear. Easy to style.', 'women', 'Tops', 899, 15, 'ComfortWear', ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'], true, false),
('Floral Print Top', 'Beautiful floral print top for summer. Fresh and feminine.', 'women', 'Tops', 1199, 10, 'BloomStyle', ARRAY['https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800'], false, true);

-- Women's Dresses
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Evening Gown', 'Stunning evening gown for special occasions. Make an entrance.', 'women', 'Dresses', 6999, 25, 'Glamour', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], true, true),
('Summer Maxi Dress', 'Flowing maxi dress perfect for summer days. Breezy and beautiful.', 'women', 'Dresses', 2999, 20, 'SummerBreeze', ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'], true, false),
('Bodycon Party Dress', 'Sleek bodycon dress for parties. Trendy and stylish.', 'women', 'Dresses', 2499, 15, 'PartyQueen', ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'], false, true);

-- Women's Jeans
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('High Rise Skinny Jeans', 'Flattering high rise skinny jeans. Comfortable and chic.', 'women', 'Jeans', 1899, 20, 'DenimDiva', ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'], true, true),
('Wide Leg Trousers', 'Elegant wide leg trousers for office wear. Professional look.', 'women', 'Jeans', 2199, 15, 'WorkWear', ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'], true, false),
('Cargo Pants', 'Trendy cargo pants with multiple pockets. Utility meets style.', 'women', 'Jeans', 1699, 10, 'UrbanChic', ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'], false, true);

-- Women's Kurtas
INSERT INTO products (name, description, category, subcategory, base_price, discount_percentage, brand, images, is_featured, is_new_arrival) VALUES
('Embroidered Kurta', 'Beautiful embroidered kurta with traditional designs. Ethnic elegance.', 'women', 'Kurtas', 2499, 25, 'EthnicGrace', ARRAY['https://images.unsplash.com/photo-1583391728516-9c00b4da073a?w=800'], true, true),
('Straight Cut Kurta', 'Classic straight cut kurta for daily wear. Simple and elegant.', 'women', 'Kurtas', 1499, 15, 'Traditional', ARRAY['https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800'], true, false),
('Anarkali Suit', 'Grand Anarkali suit for celebrations. Royal ethnic wear.', 'women', 'Kurtas', 4999, 30, 'RoyalEthnic', ARRAY['https://images.unsplash.com/photo-1618932260643-ee7f56040600?w=800'], false, true);

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

-- Get product IDs and create variants
DO $$
DECLARE
    v_product RECORD;
    v_size VARCHAR(20);
    v_color VARCHAR(50);
    v_stock INTEGER;
    v_price DECIMAL(10, 2);
    v_images TEXT[];
BEGIN
    -- Process each product
    FOR v_product IN SELECT id, name, base_price, category FROM products LOOP
        v_price := v_product.base_price;
        
        -- Define sizes based on category
        IF v_product.category = 'men' THEN
            v_images := ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'];
        ELSE
            v_images := ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'];
        END IF;
        
        -- Create variants for each product
        -- Sizes: S, M, L, XL, XXL
        -- Colors: Black, White, Navy, Red, Green
        
        FOREACH v_size IN ARRAY ARRAY['S', 'M', 'L', 'XL', 'XXL'] LOOP
            FOREACH v_color IN ARRAY ARRAY['Black', 'White', 'Navy', 'Red', 'Green'] LOOP
                -- Random stock between 5 and 50
                v_stock := floor(random() * 45 + 5)::INTEGER;
                
                -- Some colors have more stock
                IF v_color IN ('Black', 'White') THEN
                    v_stock := v_stock + 20;
                END IF;
                
                -- Insert variant
                INSERT INTO product_variants (product_id, size, color, stock, price, sku, image_url)
                VALUES (
                    v_product.id,
                    v_size,
                    v_color,
                    v_stock,
                    v_price,
                    UPPER(LEFT(v_product.name, 3)) || '-' || UPPER(LEFT(v_size, 2)) || '-' || UPPER(LEFT(v_color, 3)) || '-' || floor(random() * 9000 + 1000)::TEXT,
                    v_images[1]
                )
                ON CONFLICT (product_id, size, color) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- UPDATE PRODUCT IMAGES FOR VARIANTS
-- ============================================================================

UPDATE product_variants pv
SET image_url = p.images[1]
FROM products p
WHERE pv.product_id = p.id;

-- ============================================================================
-- ADD SOME SAMPLE DATA NOTES
-- ============================================================================

-- This creates approximately:
-- - 18 products (12 men's, 16 women's)
-- - 450 variants (5 sizes × 5 colors × 18 products)
-- - Variants have randomized stock (5-95 units)
-- - Each product has consistent pricing

-- To check the data:
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM product_variants;
-- SELECT category, COUNT(*) FROM products GROUP BY category;

-- ============================================================================
-- END OF TEST DATA
-- ============================================================================
