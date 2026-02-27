-- Add missing columns to products table
-- Run this in Supabase SQL Editor

-- Add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';

-- Check current products
SELECT id, name, price, stock, is_new FROM products LIMIT 5;
