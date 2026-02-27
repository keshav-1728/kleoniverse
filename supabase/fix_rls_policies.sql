-- Run this SQL to fix RLS issues

-- 1. Drop existing restrictive RLS policies on profiles (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update roles" ON profiles;

-- 2. Create permissive policies - allow authenticated users to manage their own profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Ensure role column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 4. Set your user as admin (replace with your user ID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = '46ca71d4-9091-4c97-910a-468708915f08';

-- 5. If profile doesn't exist, create it
INSERT INTO profiles (id, full_name, phone, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  raw_user_meta_data->>'phone',
  'admin'
FROM auth.users 
WHERE id = '46ca71d4-9091-4c97-910a-468708915f08'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 6. Also fix other tables RLS for authenticated users
-- Orders - users can view their own
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Addresses - users can manage their own
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Cart items - users can manage their own
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Verify the setup
SELECT id, full_name, role FROM profiles WHERE id = '46ca71d4-9091-4c97-910a-468708915f08';
