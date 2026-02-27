-- Add missing columns to products table

-- Add discount column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0;

-- Add stock column if it doesn't exist  
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Add base_price column if it doesn't exist (rename from price if needed)
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);

-- If base_price is null but price exists, copy price to base_price
UPDATE products SET base_price = price WHERE base_price IS NULL AND price IS NOT NULL;

-- Set default values
ALTER TABLE products ALTER COLUMN discount SET DEFAULT 0;
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;

-- Verify the columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('discount', 'stock', 'base_price', 'price');
