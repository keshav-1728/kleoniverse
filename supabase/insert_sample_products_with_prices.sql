-- Insert sample products with proper prices

-- First delete existing products (optional - only if you want fresh data)
-- DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products);
-- DELETE FROM products;

-- Insert sample products with prices
INSERT INTO products (name, description, category, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Classic White Shirt', 'A timeless white shirt perfect for any occasion. Made from 100% cotton for maximum comfort.', 'shirts', 1299, 1999, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['White'], true, 50, 'in_stock'),
('Black Formal Trousers', 'Elegant black formal trousers with a modern fit. Perfect for office wear.', 'pants', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Black'], true, 35, 'in_stock'),
('Blue Denim Jeans', 'Classic blue denim jeans with a comfortable fit. Stylish and durable.', 'pants', 1799, 2999, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Blue'], true, 45, 'in_stock'),
('Navy Blue Blazer', 'A sophisticated navy blue blazer for formal occasions. Premium quality fabric.', 'blazers', 3999, 5999, ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Navy Blue'], true, 20, 'in_stock'),
('Casual T-Shirt', 'Comfortable casual t-shirt for everyday wear. Soft cotton material.', 'tshirts', 599, 999, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Navy'], true, 100, 'in_stock'),
('Printed Kurti', 'Beautiful printed kurti for women. Perfect for festive occasions.', 'kurtis', 1899, 2999, ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Pink', 'Blue', 'Green'], true, 30, 'in_stock'),
('Leather Belt', 'Genuine leather belt with a stylish buckle. Durable and elegant.', 'accessories', 899, 1499, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], ARRAY['S', 'M', 'L'], ARRAY['Brown', 'Black'], true, 50, 'in_stock'),
('Running Shoes', 'Comfortable running shoes with excellent cushioning. Perfect for sports.', 'shoes', 2499, 3999, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], ARRAY['6', '7', '8', '9', '10', '11'], ARRAY['Black', 'White', 'Red'], true, 25, 'in_stock'),
('Sunglasses', 'Stylish sunglasses with UV protection. Great for summer.', 'accessories', 1199, 1999, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], ARRAY['One Size'], ARRAY['Black', 'Brown', 'Gold'], true, 40, 'in_stock'),
('Wrist Watch', 'Elegant wrist watch with leather strap. Classic design.', 'accessories', 2999, 4999, ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'], ARRAY['One Size'], ARRAY['Silver', 'Gold', 'Black'], true, 15, 'in_stock')
ON CONFLICT DO NOTHING;

-- Insert product variants
INSERT INTO product_variants (product_id, size, color, price, stock_quantity, sku) 
SELECT p.id, 'S', 'White', p.price, p.stock_quantity, CONCAT(p.id, '-S-WHITE')
FROM products p WHERE p.category = 'shirts' AND p.sizes ? 'S';

INSERT INTO product_variants (product_id, size, color, price, stock_quantity, sku) 
SELECT p.id, 'M', 'White', p.price, p.stock_quantity, CONCAT(p.id, '-M-WHITE')
FROM products p WHERE p.category = 'shirts' AND p.sizes ? 'M';

INSERT INTO product_variants (product_id, size, color, price, stock_quantity, sku) 
SELECT p.id, 'L', 'White', p.price, p.stock_quantity, CONCAT(p.id, '-L-WHITE')
FROM products p WHERE p.category = 'shirts' AND p.sizes ? 'L';

INSERT INTO product_variants (product_id, size, color, price, stock_quantity, sku) 
SELECT p.id, 'XL', 'White', p.price, p.stock_quantity, CONCAT(p.id, '-XL-WHITE')
FROM products p WHERE p.category = 'shirts' AND p.sizes ? 'XL';

-- Verify products were inserted
SELECT id, name, price, category, stock_status FROM products ORDER BY created_at DESC LIMIT 10;
