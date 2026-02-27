-- Clear existing products first
DELETE FROM product_variants;
DELETE FROM products;

-- =====================
-- MEN'S PRODUCTS
-- =====================

-- Men's Shirts
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Classic White Formal Shirt', 'Premium cotton formal shirt perfect for office wear', 'men', 'shirts', 1499, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], true, true),
('Light Blue Casual Shirt', 'Soft cotton casual shirt for weekend outings', 'men', 'shirts', 1199, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500'], true, false),
('Black Slim Fit Shirt', 'Slim fit formal shirt in black', 'men', 'shirts', 1599, ARRAY['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500'], true, false);

-- Men's Pants
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Black Formal Trousers', 'Elegant formal trousers with a tailored fit', 'men', 'pants', 1699, ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'], true, true),
('Blue Slim Fit Jeans', 'Modern slim fit jeans in classic blue', 'men', 'pants', 1999, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], true, true),
('Khaki Chinos', 'Versatile khaki chinos for casual occasions', 'men', 'pants', 1499, ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'], true, false);

-- Men's Shorts
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Navy Casual Shorts', 'Comfortable navy shorts for summer', 'men', 'shorts', 899, ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500'], true, false),
('Denim Shorts', 'Classic denim shorts', 'men', 'shorts', 1199, ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500'], true, false);

-- Men's T-Shirts
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Black Crew Neck T-Shirt', 'Classic black crew neck t-shirt', 'men', 'tshirts', 699, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], true, true),
('Navy Polo T-Shirt', 'Stylish navy polo t-shirt', 'men', 'tshirts', 899, ARRAY['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500'], true, false);

-- Men's Blazers
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Navy Blue Blazer', 'Sophisticated navy blue blazer', 'men', 'blazers', 4999, ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'], true, true),
('Grey Formal Blazer', 'Elegant grey blazer for business', 'men', 'blazers', 4499, ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], true, false);

-- Men's Shoes
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Black Formal Shoes', 'Classic black formal shoes', 'men', 'shoes', 2999, ARRAY['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500'], true, true),
('White Running Shoes', 'Lightweight running shoes', 'men', 'shoes', 2799, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], true, true),
('Brown Leather Sandals', 'Casual leather sandals', 'men', 'shoes', 1499, ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500'], true, false);

-- Men's Accessories
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Leather Belt', 'Genuine leather belt', 'men', 'accessories', 899, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], true, false),
('Aviator Sunglasses', 'Classic aviator sunglasses', 'men', 'accessories', 1299, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], true, false);

-- =====================
-- WOMEN'S PRODUCTS
-- =====================

-- Women's Kurtis
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Floral Print Kurti', 'Beautiful floral print kurti', 'women', 'kurtis', 1899, ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'], true, true),
('Embroidered Kurti', 'Elegant embroidered kurti', 'women', 'kurtis', 2499, ARRAY['https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=500'], true, true),
('Plain Cotton Kurti', 'Simple cotton kurti', 'women', 'kurtis', 1199, ARRAY['https://images.unsplash.com/photo-1595052548741-7c456eb3cd2f?w=500'], true, false);

-- Women's Sarees
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Silk Saree', 'Pure silk saree with golden border', 'women', 'sarees', 3999, ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'], true, true),
('Cotton Saree', 'Lightweight cotton saree', 'women', 'sarees', 1499, ARRAY['https://images.unsplash.com/photo-1609164611523-560b86430a61?w=500'], true, false),
('Georgette Saree', 'Flowy georgette saree', 'women', 'sarees', 2499, ARRAY['https://images.unsplash.com/photo-1583391727515-81080216b1e4?w=500'], true, false);

-- Women's Tops
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('White Blouse', 'Classic white blouse', 'women', 'tops', 899, ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500'], true, false),
('Floral Crop Top', 'Trendy floral crop top', 'women', 'tops', 799, ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], true, true),
('Denim Jacket', 'Stylish denim jacket', 'women', 'tops', 1999, ARRAY['https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=500'], true, false);

-- Women's Jeans
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('High Rise Skinny Jeans', 'Flattering high rise skinny jeans', 'women', 'jeans', 1799, ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'], true, true),
('Wide Leg Jeans', 'Comfortable wide leg jeans', 'women', 'jeans', 1699, ARRAY['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500'], true, false),
('Straight Fit Jeans', 'Classic straight fit jeans', 'women', 'jeans', 1599, ARRAY['https://images.unsplash.com/photo-1541079842319-5014137f84c1?w=500'], true, false);

-- Women's Pants
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Palazzo Pants', 'Elegant palazzo pants', 'women', 'pants', 1299, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'], true, false),
('Leggings', 'Comfortable cotton leggings', 'women', 'pants', 699, ARRAY['https://images.unsplash.com/photo-1551488852-080175b94216?w=500'], true, true);

-- Women's Shoes
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Heels', 'Elegant heels for parties', 'women', 'shoes', 1999, ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'], true, true),
('Flats', 'Comfortable flats', 'women', 'shoes', 1299, ARRAY['https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500'], true, false),
('Sandals', 'Stylish sandals', 'women', 'shoes', 1499, ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500'], true, false);

-- Women's Accessories
INSERT INTO products (name, description, category, subcategory, base_price, images, is_active, is_featured) VALUES
('Handbag', 'Elegant handbag', 'women', 'accessories', 2499, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'], true, true),
('Earrings', 'Beautiful earrings', 'women', 'accessories', 599, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'], true, false),
('Watch', 'Stylish watch', 'women', 'accessories', 1999, ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500'], true, false);

-- Now add variants for products
-- Men's Shirt variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'S', 'White', 50, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'M', 'White', 50, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'L', 'White', 50, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'XL', 'White', 50, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shirts';

-- Men's Pants variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '28', 'Black', 40, base_price, true FROM products WHERE category = 'men' AND subcategory = 'pants';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '30', 'Black', 40, base_price, true FROM products WHERE category = 'men' AND subcategory = 'pants';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '32', 'Black', 40, base_price, true FROM products WHERE category = 'men' AND subcategory = 'pants';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '34', 'Black', 40, base_price, true FROM products WHERE category = 'men' AND subcategory = 'pants';

-- Men's T-Shirt variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'S', 'Black', 80, base_price, true FROM products WHERE category = 'men' AND subcategory = 'tshirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'M', 'Black', 80, base_price, true FROM products WHERE category = 'men' AND subcategory = 'tshirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'L', 'Black', 80, base_price, true FROM products WHERE category = 'men' AND subcategory = 'tshirts';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'XL', 'Black', 80, base_price, true FROM products WHERE category = 'men' AND subcategory = 'tshirts';

-- Men's Shoes variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '7', 'Black', 25, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '8', 'Black', 25, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '9', 'Black', 25, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '10', 'Black', 25, base_price, true FROM products WHERE category = 'men' AND subcategory = 'shoes';

-- Women's Kurti variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'S', 'Pink', 30, base_price, true FROM products WHERE category = 'women' AND subcategory = 'kurtis';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'M', 'Pink', 30, base_price, true FROM products WHERE category = 'women' AND subcategory = 'kurtis';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'L', 'Pink', 30, base_price, true FROM products WHERE category = 'women' AND subcategory = 'kurtis';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, 'XL', 'Pink', 30, base_price, true FROM products WHERE category = 'women' AND subcategory = 'kurtis';

-- Women's Jeans variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '26', 'Blue', 40, base_price, true FROM products WHERE category = 'women' AND subcategory = 'jeans';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '28', 'Blue', 40, base_price, true FROM products WHERE category = 'women' AND subcategory = 'jeans';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '30', 'Blue', 40, base_price, true FROM products WHERE category = 'women' AND subcategory = 'jeans';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '32', 'Blue', 40, base_price, true FROM products WHERE category = 'women' AND subcategory = 'jeans';

-- Women's Shoes variants
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '5', 'Black', 25, base_price, true FROM products WHERE category = 'women' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '6', 'Black', 25, base_price, true FROM products WHERE category = 'women' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '7', 'Black', 25, base_price, true FROM products WHERE category = 'women' AND subcategory = 'shoes';
INSERT INTO product_variants (product_id, size, color, stock, price, is_active)
SELECT id, '8', 'Black', 25, base_price, true FROM products WHERE category = 'women' AND subcategory = 'shoes';

-- Verify products
SELECT id, name, category, subcategory, base_price FROM products ORDER BY category, subcategory;

-- Verify variants count
SELECT COUNT(*) as total_variants FROM product_variants;
