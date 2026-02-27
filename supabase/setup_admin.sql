-- Run this SQL in Supabase SQL Editor to set up admin role

-- 1. Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Set your user as admin (replace with your user ID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = '46ca71d4-9091-4c97-910a-468708915f08';

-- 3. If profile doesn't exist, create it (profiles table has: id, full_name, phone, role)
INSERT INTO profiles (id, full_name, phone, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
  raw_user_meta_data->>'phone',
  'admin'
FROM auth.users 
WHERE id = '46ca71d4-9091-4c97-910a-468708915f08'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. Verify
SELECT id, full_name, role FROM profiles WHERE id = '46ca71d4-9091-4c97-910a-468708915f08';
