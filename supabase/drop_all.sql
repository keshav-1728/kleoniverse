-- ============================================================================
-- DROP ALL TABLES - Run this FIRST to clean up
-- ============================================================================

-- Drop all tables (this will delete all data!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop triggers from auth.users if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now run the complete_setup.sql file!
