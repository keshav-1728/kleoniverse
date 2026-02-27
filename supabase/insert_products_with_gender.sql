-- Insert sample products for both Men and Women categories with prices

-- Clear existing products first
DELETE FROM product_variants;
DELETE FROM products;

-- =====================
-- MEN'S PRODUCTS
-- =====================

-- Men's Shirts
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Classic White Formal Shirt', 'Premium cotton formal shirt perfect for office wear. Crisp white color with a modern fit.', 'shirts', 'men', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White'], true, 50, 'in_stock'),
('Light Blue Casual Shirt', 'Soft cotton casual shirt for weekend outings. Relaxed fit with roll-up sleeves.', 'shirts', 'men', 1199, 1999, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Light Blue', 'Navy'], true, 40, 'in_stock'),
('Black Slim Fit Shirt', 'Slim fit formal shirt in black. Perfect for evening events.', 'shirts', 'men', 1599, 2799, ARRAY['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black'], true, 35, 'in_stock');

-- Men's Pants
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Black Formal Trousers', 'Elegant formal trousers with a tailored fit. Perfect for office wear.', 'pants', 'men', 1699, 2999, ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'], ARRAY['28', '30', '32', '34', '36', '38'], ARRAY['Black'], true, 45, 'in_stock'),
('Blue Slim Fit Jeans', 'Modern slim fit jeans in classic blue. Comfortable stretch fabric.', 'pants', 'men', 1999, 3499, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Blue', 'Dark Blue'], true, 60, 'in_stock'),
('Khaki Chinos', 'Versatile khaki chinos for casual and semi-formal occasions.', 'pants', 'men', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Khaki', 'Beige'], true, 40, 'in_stock');

-- Men's T-Shirts
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Black Crew Neck T-Shirt', 'Classic black crew neck t-shirt. 100% cotton for all-day comfort.', 'tshirts', 'men', 699, 1199, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'White'], true, 100, 'in_stock'),
('Navy Polo T-Shirt', 'Stylish navy polo t-shirt for casual outings.', 'tshirts', 'men', 899, 1499, ARRAY['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Navy', 'White'], true, 75, 'in_stock'),
('Graphic Print T-Shirt', 'Trendy graphic print t-shirt for the youth.', 'tshirts', 'men', 799, 1399, ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black', 'Red'], true, 80, 'in_stock');

-- Men's Blazers
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Navy Blue Blazer', 'Sophisticated navy blue blazer for formal occasions. Single-breasted design.', 'blazers', 'men', 4999, 7999, ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Navy Blue'], true, 15, 'in_stock'),
('Grey Formal Blazer', 'Elegant grey blazer for business meetings.', 'blazers', 'men', 4499, 7499, ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Grey'], true, 12, 'in_stock');

-- Men's Shoes
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Black Formal Shoes', 'Classic black formal shoes for office and events. Genuine leather.', 'shoes', 'men', 2999, 4999, ARRAY['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500'], ARRAY['6', '7', '8', '9', '10', '11'], ARRAY['Black'], true, 30, 'in_stock'),
('White Running Shoes', 'Lightweight running shoes with cushioned sole. Perfect for workouts.', 'shoes', 'men', 2799, 4499, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], ARRAY['7', '8', '9', '10', '11'], ARRAY['White', 'Black', 'Red'], true, 45, 'in_stock'),
('Brown Leather Sandals', 'Casual brown leather sandals for summer.', 'shoes', 'men', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500'], ARRAY['7', '8', '9', '10', '11'], ARRAY['Brown'], true, 25, 'in_stock');

-- Men's Accessories
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Leather Belt', 'Genuine leather belt with silver buckle. Durable and elegant.', 'accessories', 'men', 899, 1499, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], ARRAY['S', 'M', 'L'], ARRAY['Black', 'Brown'], true, 50, 'in_stock'),
('Aviator Sunglasses', 'Classic aviator sunglasses with UV protection.', 'accessories', 'men', 1299, 2299, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], ARRAY['One Size'], ARRAY['Gold', 'Silver', 'Black'], true, 40, 'in_stock'),
('Leather Wallet', 'Genuine leather wallet with multiple card slots.', 'accessories', 'men', 999, 1799, ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'], ARRAY['One Size'], ARRAY['Black', 'Brown'], true, 60, 'in_stock');

-- =====================
-- WOMEN'S PRODUCTS
-- =====================

-- Women's Kurtis
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Floral Print Kurti', 'Beautiful floral print kurti for festive occasions. Comfortable cotton.', 'kurtis', 'women', 1899, 2999, ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Pink', 'Blue', 'Orange'], true, 35, 'in_stock'),
('Embroidered Kurti', 'Elegant embroidered kurti with traditional work. Perfect for weddings.', 'kurtis', 'women', 2499, 3999, ARRAY['https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=500'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Red', 'Green', 'Peach'], true, 25, 'in_stock'),
('Plain Cotton Kurti', 'Simple and elegant plain cotton kurti for daily wear.', 'kurtis', 'women', 1199, 1999, ARRAY['https://images.unsplash.com/photo-1595052548741-7c456eb3cd2f?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Pink', 'Yellow'], true, 45, 'in_stock');

-- Women's Sarees
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Silk Saree', 'Pure silk saree with golden border. Traditional elegance.', 'sarees', 'women', 3999, 6999, ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'], ARRAY['Free Size'], ARRAY['Red', 'Maroon', 'Pink'], true, 20, 'in_stock'),
('Cotton Saree', 'Lightweight cotton saree for daily wear. Easy to drape.', 'sarees', 'women', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1609164611523-560b86430a61?w=500'], ARRAY['Free Size'], ARRAY['Blue', 'Green', 'Yellow'], true, 30, 'in_stock'),
('Georgette Saree', 'Flowy georgette saree with printed design. Party wear.', 'sarees', 'women', 2499, 4499, ARRAY['https://images.unsplash.com/photo-1583391727515-81080216b1e4?w=500'], ARRAY['Free Size'], ARRAY['Pink', 'Purple', 'Peach'], true, 25, 'in_stock');

-- Women's Tops
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('White Blouse', 'Classic white blouse for office and formal wear.', 'tops', 'women', 899, 1499, ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black'], true, 50, 'in_stock'),
('Floral Crop Top', 'Trendy floral crop top for casual outings.', 'tops', 'women', 799, 1299, ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Pink', 'White', 'Blue'], true, 60, 'in_stock'),
('Denim Jacket', 'Stylish denim jacket for layering.', 'tops', 'women', 1999, 3499, ARRAY['https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blue', 'Black'], true, 30, 'in_stock');

-- Women's Jeans
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('High Rise Skinny Jeans', 'Flattering high rise skinny jeans with stretch.', 'pants', 'women', 1799, 2999, ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'], ARRAY['24', '26', '28', '30', '32', '34'], ARRAY['Blue', 'Black', 'Grey'], true, 50, 'in_stock'),
('Wide Leg Jeans', 'Comfortable wide leg jeans for a relaxed look.', 'pants', 'women', 1699, 2799, ARRAY['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Light Blue', 'Dark Blue'], true, 35, 'in_stock'),
('Straight Fit Jeans', 'Classic straight fit jeans for everyday wear.', 'pants', 'women', 1599, 2599, ARRAY['https://images.unsplash.com/photo-1541079842319-5014137f84c1?w=500'], ARRAY['26', '28', '30', '32', '34'], ARRAY['Blue'], true, 40, 'in_stock');

-- Women's Shoes
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Heels', 'Elegant heels for party and formal wear.', 'shoes', 'women', 1999, 3499, ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'], ARRAY['5', '6', '7', '8', '9'], ARRAY['Black', 'Nude', 'Red'], true, 30, 'in_stock'),
('Flats', 'Comfortable flats for daily wear.', 'shoes', 'women', 1299, 2299, ARRAY['https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500'], ARRAY['5', '6', '7', '8', '9'], ARRAY['Black', 'Brown', 'Beige'], true, 45, 'in_stock'),
('Sandals', 'Stylish sandals for summer.', 'shoes', 'women', 1499, 2499, ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500'], ARRAY['5', '6', '7', '8', '9'], ARRAY['Gold', 'Silver', 'Pink'], true, 35, 'in_stock');

-- Women's Accessories
INSERT INTO products (name, description, category, gender, price, original_price, images, sizes, colors, is_active, stock_quantity, stock_status) VALUES
('Handbag', 'Elegant handbag for office and casual use.', 'accessories', 'women', 2499, 3999, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'], ARRAY['One Size'], ARRAY['Black', 'Brown', 'Beige'], true, 25, 'in_stock'),
('Earrings', 'Beautiful earrings for festive occasions.', 'accessories', 'women', 599, 999, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'], ARRAY['One Size'], ARRAY['Gold', 'Silver', 'Rose Gold'], true, 50, 'in_stock'),
('Watch', 'Stylish watch for women.', 'accessories', 'women', 1999, 3499, ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500'], ARRAY['One Size'], ARRAY['Gold', 'Silver', 'Rose Gold'], true, 20, 'in_stock');

-- Verify products
SELECT id, name, gender, category, price FROM products ORDER BY gender, category;
