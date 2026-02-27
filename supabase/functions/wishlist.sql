-- ============================================================================
-- WISHLIST MANAGEMENT FUNCTIONS
-- Supabase Database Functions for Wishlist Operations
-- ============================================================================

-- ============================================================================
-- GET WISHLIST ITEMS
-- Returns all wishlist items for the authenticated user with product details
-- ============================================================================
CREATE OR REPLACE FUNCTION get_wishlist_items()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    product_name TEXT,
    product_description TEXT,
    product_category VARCHAR(50),
    product_base_price DECIMAL(10, 2),
    product_discount_percentage DECIMAL(5, 2),
    product_brand VARCHAR(100),
    product_images TEXT[],
    product_is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.user_id,
        w.product_id,
        w.created_at,
        p.name::TEXT AS product_name,
        p.description::TEXT AS product_description,
        p.category AS product_category,
        p.base_price AS product_base_price,
        p.discount_percentage AS product_discount_percentage,
        p.brand AS product_brand,
        p.images AS product_images,
        p.is_active AS product_is_active
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = auth.uid()
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADD TO WISHLIST
-- Adds a product to the user's wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION add_to_wishlist(p_product_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_wishlist_id UUID;
BEGIN
    -- Validate product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = true) THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;

    -- Check if already in wishlist
    IF EXISTS (
        SELECT 1 FROM wishlists 
        WHERE user_id = auth.uid() AND product_id = p_product_id
    ) THEN
        -- Return existing entry
        RETURN QUERY
        SELECT w.id, w.user_id, w.product_id, w.created_at
        FROM wishlists w
        WHERE w.user_id = auth.uid() AND w.product_id = p_product_id;
    END IF;

    -- Insert into wishlist
    INSERT INTO wishlists (user_id, product_id)
    VALUES (auth.uid(), p_product_id)
    RETURNING id, user_id, product_id, created_at
    INTO v_wishlist_id, p_product_id, p_product_id, p_product_id;

    -- Return the new entry
    RETURN QUERY
    SELECT w.id, w.user_id, w.product_id, w.created_at
    FROM wishlists w
    WHERE w.id = v_wishlist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REMOVE FROM WISHLIST
-- Removes a product from the user's wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION remove_from_wishlist(p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM wishlists
    WHERE user_id = auth.uid() AND product_id = p_product_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CHECK IF IN WISHLIST
-- Checks if a product is in the user's wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION is_in_wishlist(p_product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM wishlists
        WHERE user_id = auth.uid() AND product_id = p_product_id
    ) INTO v_exists;

    RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET WISHLIST COUNT
-- Returns the number of items in wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION get_wishlist_count()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM wishlists
    WHERE user_id = auth.uid();

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEAR WISHLIST
-- Removes all items from the user's wishlist
-- ============================================================================
CREATE OR REPLACE FUNCTION clear_wishlist()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM wishlists
    WHERE user_id = auth.uid();

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF WISHLIST FUNCTIONS
-- ============================================================================
