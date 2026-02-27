# Supabase Backend Setup Guide

This directory contains all the SQL scripts needed to set up the ecommerce backend using Supabase.

## Setup Order

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Get your `SUPABASE_SERVICE_ROLE_KEY` from project settings

### Step 2: Run the Setup Script
Open the Supabase SQL Editor and run the complete setup:

**Option A: Run Complete Setup (Recommended)**
- Copy the contents of [`setup_complete.sql`](setup_complete.sql)
- Paste into the Supabase SQL Editor
- Click "Run" to execute

This single file contains:
- Database schema (tables)
- Row Level Security policies
- All database functions

**Option B: Run Individual Files**
If you prefer to run files separately:

1. First run [`schema.sql`](schema.sql) - Creates tables and triggers
2. Then run [`rlpolicies.sql`](rlpolicies.sql) - Sets up security
3. Then run individual function files:
   - [`functions/cart.sql`](functions/cart.sql)
   - [`functions/address.sql`](functions/address.sql)
   - [`functions/order.sql`](functions/order.sql)
   - [`functions/product.sql`](functions/product.sql)
   - [`functions/wishlist.sql`](functions/wishlist.sql)

### Step 3: Add Test Data
After the setup is complete, run:
- [`test-data.sql`](test-data.sql) - Adds sample products with variants

## Database Tables

| Table | Description |
|-------|-------------|
| `products` | Main product catalog |
| `product_variants` | Size/color variants with stock |
| `addresses` | User shipping addresses |
| `cart_items` | Shopping cart items |
| `orders` | Customer orders |
| `order_items` | Individual order items |
| `wishlists` | User wishlists |
| `profiles` | Extended user profiles |

## Database Functions

### Cart Functions
- `get_cart_items()` - Get user's cart with product details
- `add_to_cart(product_id, variant_id, size, color, quantity, price)` - Add item to cart
- `update_cart_quantity(cart_item_id, quantity)` - Update item quantity
- `remove_from_cart(cart_item_id)` - Remove item from cart
- `clear_cart()` - Clear entire cart
- `get_cart_total()` - Get cart subtotal and item count

### Address Functions
- `get_addresses()` - Get all user addresses
- `save_address(...)` - Create or update address
- `delete_address(address_id)` - Delete address
- `set_default_address(address_id)` - Set default address
- `get_default_address()` - Get default address

### Order Functions
- `create_order(address_id, payment_method, shipping_cost, discount)` - Create order from cart
- `get_user_orders()` - Get user's order history
- `get_order_by_id(order_id)` - Get specific order
- `get_order_items(order_id)` - Get items in an order
- `cancel_order(order_id)` - Cancel an order
- `update_order_status(order_id, status)` - Update order status (admin only)

### Product Functions
- `get_products(category, search, limit, offset)` - List products with filters
- `get_product_by_id(product_id)` - Get product details
- `get_product_variants(product_id)` - Get product variants
- `get_product_with_variants(product_id)` - Get product with all variants
- `get_featured_products(limit)` - Get featured products
- `get_new_arrivals(limit)` - Get new arrival products
- `get_categories()` - Get all categories
- `get_available_sizes(product_id)` - Get available sizes
- `get_available_colors(product_id)` - Get available colors

### Wishlist Functions
- `get_wishlist_items()` - Get user's wishlist
- `add_to_wishlist(product_id)` - Add to wishlist
- `remove_from_wishlist(product_id)` - Remove from wishlist

## Security (RLS Policies)

All tables have Row Level Security enabled:

- **Products**: Public read, admin write
- **Addresses**: User can only access own addresses
- **Cart Items**: User can only access own cart
- **Orders**: User can only access own orders
- **Order Items**: Access via order ownership
- **Wishlists**: User can only access own wishlist
- **Profiles**: User can only access own profile

## Environment Variables

### Frontend (.env)
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing the Functions

### Test Cart Function
```sql
-- After setting up, test with a user
SELECT * FROM get_cart_items();
```

### Test Products
```sql
SELECT * FROM get_products();
SELECT * FROM get_featured_products(5);
SELECT * FROM get_product_with_variants((SELECT id FROM products LIMIT 1));
```

### Test Cart Add
```sql
-- This requires authentication (user must be logged in)
SELECT add_to_cart(
    'product-uuid-here',
    'variant-uuid-here',
    'M',
    'Black',
    2,
    799.00
);
```

## Notes

- All functions that modify user data require authentication (`auth.uid()`)
- Admin functions check the `profiles.role` field
- Order creation automatically clears the cart and updates inventory
- RLS policies prevent unauthorized access to data
