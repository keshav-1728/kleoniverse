-- Fix address table to match frontend field names
-- Run this in Supabase SQL Editor

-- Add alternative column names that frontend expects
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);

-- Copy data from existing columns to new columns if needed
UPDATE addresses SET 
    name = COALESCE(full_name, name),
    address_line1 = COALESCE(street_address, address_line1),
    pincode = COALESCE(postal_code, pincode)
WHERE name IS NULL OR address_line1 IS NULL OR pincode IS NULL;

-- Verify the columns now exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'addresses' 
ORDER BY ordinal_position;
