-- ============================================================================
-- CART MANAGEMENT FUNCTIONS
-- Supabase Database Functions for Cart Operations
-- ============================================================================

-- ============================================================================
-- GET CART ITEMS
-- Returns all cart items for the authenticated user with product details
-- ============================================================================
CREATE OR REPLACE FUNCTION get_cart_items()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_id UUID,
    variant_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10, 2),
    product_name TEXT,
    product_images TEXT[],
    product_category TEXT,
    variant_stock INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.variant_id,
        ci.size,
        ci.color,
        ci.quantity,
        ci.price,
        p.name::TEXT AS product_name,
        p.images AS product_images,
        p.category::TEXT AS product_category,
        pv.stock AS variant_stock,
        ci.created_at,
        ci.updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.user_id = auth.uid()
    ORDER BY ci.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADD TO CART
-- Adds an item to cart or updates quantity if already exists
-- Returns the cart item
-- ============================================================================
CREATE OR REPLACE FUNCTION add_to_cart(
    p_product_id UUID,
    p_variant_id UUID,
    p_size VARCHAR(20),
    p_color VARCHAR(50),
    p_quantity INTEGER,
    p_price DECIMAL(10, 2)
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_id UUID,
    variant_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_cart_id UUID;
    v_existing_quantity INTEGER;
    v_current_stock INTEGER;
BEGIN
    -- Validate product exists and is active
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = true) THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;

    -- Validate variant exists and has stock
    SELECT stock INTO v_current_stock
    FROM product_variants 
    WHERE id = p_variant_id AND product_id = p_product_id AND is_active = true;

    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product variant not found';
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %', v_current_stock;
    END IF;

    -- Check if item already exists in cart
    SELECT id, quantity INTO v_cart_id, v_existing_quantity
    FROM cart_items
    WHERE user_id = auth.uid() 
        AND variant_id = p_variant_id;

    IF v_cart_id IS NOT NULL THEN
        -- Update existing cart item
        UPDATE cart_items
        SET quantity = v_existing_quantity + p_quantity,
            updated_at = NOW()
        WHERE id = v_cart_id;
    ELSE
        -- Insert new cart item
        INSERT INTO cart_items (user_id, product_id, variant_id, size, color, quantity, price)
        VALUES (auth.uid(), p_product_id, p_variant_id, p_size, p_color, p_quantity, p_price)
        RETURNING id INTO v_cart_id;
    END IF;

    -- Return the updated cart item
    RETURN QUERY
    SELECT *
    FROM cart_items
    WHERE id = v_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE CART QUANTITY
-- Updates the quantity of a cart item
-- ============================================================================
CREATE OR REPLACE FUNCTION update_cart_quantity(
    p_cart_item_id UUID,
    p_quantity INTEGER
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_id UUID,
    variant_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_current_stock INTEGER;
    v_variant_id UUID;
BEGIN
    -- Get the variant ID for this cart item
    SELECT variant_id INTO v_variant_id
    FROM cart_items
    WHERE id = p_cart_item_id AND user_id = auth.uid();

    IF v_variant_id IS NULL THEN
        RAISE EXCEPTION 'Cart item not found';
    END IF;

    -- Get current stock
    SELECT stock INTO v_current_stock
    FROM product_variants
    WHERE id = v_variant_id;

    -- Validate quantity
    IF p_quantity <= 0 THEN
        -- Delete the cart item if quantity is 0 or less
        DELETE FROM cart_items WHERE id = p_cart_item_id AND user_id = auth.uid();
        RETURN;
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %', v_current_stock;
    END IF;

    -- Update quantity
    UPDATE cart_items
    SET quantity = p_quantity,
        updated_at = NOW()
    WHERE id = p_cart_item_id AND user_id = auth.uid();

    -- Return updated item
    RETURN QUERY
    SELECT *
    FROM cart_items
    WHERE id = p_cart_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REMOVE FROM CART
-- Removes an item from the cart
-- ============================================================================
CREATE OR REPLACE FUNCTION remove_from_cart(p_cart_item_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM cart_items
    WHERE id = p_cart_item_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEAR CART
-- Removes all items from the user's cart
-- ============================================================================
CREATE OR REPLACE FUNCTION clear_cart()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM cart_items
    WHERE user_id = auth.uid();

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET CART TOTAL
-- Returns the subtotal for the user's cart
-- ============================================================================
CREATE OR REPLACE FUNCTION get_cart_total()
RETURNS TABLE (
    subtotal DECIMAL(10, 2),
    item_count INTEGER,
    total_items INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ci.price * ci.quantity), 0)::DECIMAL(10, 2) AS subtotal,
        COUNT(ci.id)::INTEGER AS item_count,
        COALESCE(SUM(ci.quantity), 0)::INTEGER AS total_items
    FROM cart_items ci
    WHERE ci.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CART ITEM COUNT
-- Returns the number of items in cart (for navbar display)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_cart_item_count()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(quantity), 0)::INTEGER INTO v_count
    FROM cart_items
    WHERE user_id = auth.uid();

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF CART FUNCTIONS
-- ============================================================================
