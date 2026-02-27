-- Quick fix: Disable RLS on critical tables
-- Run this in Supabase SQL Editor

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on addresses table
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on cart_items table
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on order_items table
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- First, find your user ID by email (replace with your email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then set your user as admin using the user ID from above
-- Replace 'YOUR-USER-ID-HERE' with the actual user ID
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR-USER-ID-HERE';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, full_name, role)
SELECT id, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the role is set
SELECT p.id, p.full_name, p.role, u.email 
FROM profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE u.email = 'your-email@example.com';
