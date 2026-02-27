-- ============================================================================
-- COMPLETE CLEANUP - Run this FIRST!
-- ============================================================================

-- Drop all tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions we created
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS set_default_address();
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS get_cart_items();
DROP FUNCTION IF EXISTS add_to_cart(UUID, VARCHAR, VARCHAR, INTEGER, DECIMAL);
DROP FUNCTION IF EXISTS get_addresses();
DROP FUNCTION IF EXISTS save_address(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, BOOLEAN, UUID);
DROP FUNCTION IF EXISTS get_user_orders();
DROP FUNCTION IF EXISTS get_featured_products(INTEGER);
DROP FUNCTION IF EXISTS get_new_arrivals(INTEGER);
DROP FUNCTION IF EXISTS get_categories();
DROP FUNCTION IF EXISTS get_product_variants(UUID);
DROP FUNCTION IF EXISTS get_available_sizes(UUID);
DROP FUNCTION IF EXISTS get_available_colors(UUID);

-- Now run complete_setup.sql!
