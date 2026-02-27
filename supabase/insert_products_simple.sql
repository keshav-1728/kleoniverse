-- Simple SQL to insert sample products with prices

-- Insert products with prices
INSERT INTO products (name, description, category, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Classic White Shirt', 'A timeless white shirt perfect for any occasion. Made from 100% cotton.', 'shirts', 1299, 1999, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['White'], true, 50, 'in_stock'),
('Black Formal Trousers', 'Elegant black formal trousers with a modern fit.', 'pants', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Black'], true, 35, 'in_stock'),
('Blue Denim Jeans', 'Classic blue denim jeans with a comfortable fit.', 'pants', 1799, 2999, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Blue'], true, 45, 'in_stock'),
('Navy Blue Blazer', 'A sophisticated navy blue blazer for formal occasions.', 'blazers', 3999, 5999, ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Navy Blue'], true, 20, 'in_stock'),
('Casual T-Shirt', 'Comfortable casual t-shirt for everyday wear.', 'tshirts', 599, 999, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White'], true, 100, 'in_stock'),
('Running Shoes', 'Comfortable running shoes with excellent cushioning.', 'shoes', 2499, 3999, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], ARRAY['7', '8', '9', '10'], ARRAY['Black', 'White'], true, 25, 'in_stock')
ON CONFLICT DO NOTHING;

-- Check products
SELECT id, name, price, category FROM products;
