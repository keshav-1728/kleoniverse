-- Set adminuser@gmail.com as admin
-- Run this in Supabase SQL Editor

-- Update the profile to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE id = '46ca71d4-9091-4c97-910a-468708915f08';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, full_name, role)
VALUES ('46ca71d4-9091-4c97-910a-468708915f08', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the role is set
SELECT p.id, p.full_name, p.role, u.email 
FROM profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE u.email = 'adminuser@gmail.com';
