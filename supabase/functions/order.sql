-- ============================================================================
-- ORDER MANAGEMENT FUNCTIONS
-- Supabase Database Functions for Order Operations
-- ============================================================================

-- ============================================================================
-- CREATE ORDER
-- Creates an order from cart items, updates inventory, clears cart
-- Returns the created order with items
-- ============================================================================
CREATE OR REPLACE FUNCTION create_order(
    p_address_id UUID,
    p_payment_method VARCHAR(20) DEFAULT 'prepaid',
    p_shipping_cost DECIMAL(10, 2) DEFAULT 0,
    p_discount_amount DECIMAL(10, 2) DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    address_id UUID,
    order_number VARCHAR(50),
    total_amount DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    order_status VARCHAR(20),
    payment_status VARCHAR(20),
    payment_method VARCHAR(20),
    product_names TEXT,
    product_sizes TEXT,
    product_colors TEXT,
    items_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_order_id UUID;
    v_subtotal DECIMAL(10, 2) := 0;
    v_items_count INTEGER := 0;
    v_product_names TEXT := '';
    v_product_sizes TEXT := '';
    v_product_colors TEXT := '';
    v_cart_item RECORD;
    v_order_record orders%ROWTYPE;
BEGIN
    -- Validate user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create an order';
    END IF

    -- Validate address exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM addresses 
        WHERE id = p_address_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Invalid address or address not found';
    END IF;

    -- Check if cart is empty
    IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;

    -- Start transaction
    -- Calculate totals and validate stock
    FOR v_cart_item IN 
        SELECT 
            ci.id as cart_item_id,
            ci.product_id,
            ci.variant_id,
            ci.size,
            ci.color,
            ci.quantity,
            ci.price,
            p.name as product_name,
            pv.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = auth.uid()
    LOOP
        -- Validate stock
        IF v_cart_item.stock < v_cart_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product: %. Available: %', 
                v_cart_item.product_name, v_cart_item.stock;
        END IF;

        -- Accumulate totals
        v_subtotal := v_subtotal + (v_cart_item.price * v_cart_item.quantity);
        v_items_count := v_items_count + v_cart_item.quantity;
        
        -- Build string aggregates
        v_product_names := v_product_names || v_cart_item.product_name || ', ';
        v_product_sizes := v_product_sizes || v_cart_item.size || ', ';
        v_product_colors := v_product_colors || v_cart_item.color || ', ';
    END LOOP;

    -- Trim trailing separators
    v_product_names := TRIM(TRAILING ', ' FROM v_product_names);
    v_product_sizes := TRIM(TRAILING ', ' FROM v_product_sizes);
    v_product_colors := TRIM(TRAILING ', ' FROM v_product_colors);

    -- Calculate total
    DECLARE
        v_total_amount DECIMAL(10, 2) := v_subtotal + p_shipping_cost - p_discount_amount;
    BEGIN
        -- Create order
        INSERT INTO orders (
            user_id,
            address_id,
            total_amount,
            subtotal,
            shipping_cost,
            discount_amount,
            order_status,
            payment_status,
            payment_method,
            product_names,
            product_sizes,
            product_colors,
            items_count
        ) VALUES (
            auth.uid(),
            p_address_id,
            v_total_amount,
            v_subtotal,
            p_shipping_cost,
            p_discount_amount,
            'pending',
            CASE 
                WHEN p_payment_method = 'cod' THEN 'pending'
                ELSE 'paid'
            END,
            p_payment_method,
            v_product_names,
            v_product_sizes,
            v_product_colors,
            v_items_count
        )
        RETURNING * INTO v_order_record;

        v_order_id := v_order_record.id;
    END;

    -- Move cart items to order items and update inventory
    FOR v_cart_item IN 
        SELECT 
            ci.id as cart_item_id,
            ci.product_id,
            ci.variant_id,
            ci.size,
            ci.color,
            ci.quantity,
            ci.price,
            p.name as product_name,
            pv.image_url
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = auth.uid()
    LOOP
        -- Insert order item
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            size,
            color,
            quantity,
            price,
            image_url
        ) VALUES (
            v_order_id,
            v_cart_item.product_id,
            v_cart_item.variant_id,
            v_cart_item.product_name,
            v_cart_item.size,
            v_cart_item.color,
            v_cart_item.quantity,
            v_cart_item.price,
            v_cart_item.image_url
        );

        -- Update inventory (reduce stock)
        UPDATE product_variants
        SET stock = stock - v_cart_item.quantity,
            updated_at = NOW()
        WHERE id = v_cart_item.variant_id;
    END LOOP;

    -- Clear cart after successful order
    DELETE FROM cart_items WHERE user_id = auth.uid();

    -- Return the created order
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.address_id,
        o.order_number,
        o.total_amount,
        o.subtotal,
        o.shipping_cost,
        o.discount_amount,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.product_names,
        o.product_sizes,
        o.product_colors,
        o.items_count,
        o.created_at,
        o.updated_at
    FROM orders o
    WHERE o.id = v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET USER ORDERS
-- Returns all orders for the authenticated user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    address_id UUID,
    order_number VARCHAR(50),
    total_amount DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    order_status VARCHAR(20),
    payment_status VARCHAR(20),
    payment_method VARCHAR(20),
    product_names TEXT,
    product_sizes TEXT,
    product_colors TEXT,
    product_images TEXT[],
    items_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.address_id,
        o.order_number,
        o.total_amount,
        o.subtotal,
        o.shipping_cost,
        o.discount_amount,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.product_names,
        o.product_sizes,
        o.product_colors,
        o.product_images,
        o.items_count,
        o.created_at,
        o.updated_at
    FROM orders o
    WHERE o.user_id = auth.uid()
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET ORDER BY ID
-- Returns a specific order with its items
-- ============================================================================
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    address_id UUID,
    order_number VARCHAR(50),
    total_amount DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    shipping_cost DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    order_status VARCHAR(20),
    payment_status VARCHAR(20),
    payment_method VARCHAR(20),
    product_names TEXT,
    product_sizes TEXT,
    product_colors TEXT,
    product_images TEXT[],
    items_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.address_id,
        o.order_number,
        o.total_amount,
        o.subtotal,
        o.shipping_cost,
        o.discount_amount,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.product_names,
        o.product_sizes,
        o.product_colors,
        o.product_images,
        o.items_count,
        o.created_at,
        o.updated_at
    FROM orders o
    WHERE o.id = p_order_id AND o.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET ORDER ITEMS
-- Returns all items for a specific order
-- ============================================================================
CREATE OR REPLACE FUNCTION get_order_items(p_order_id UUID)
RETURNS TABLE (
    id UUID,
    order_id UUID,
    product_id UUID,
    variant_id UUID,
    product_name VARCHAR(255),
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10, 2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.variant_id,
        oi.product_name,
        oi.size,
        oi.color,
        oi.quantity,
        oi.price,
        oi.image_url,
        oi.created_at
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.order_id = p_order_id AND o.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CANCEL ORDER
-- Cancels an order (only if pending or confirmed)
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_order_status VARCHAR(20);
    v_order_record RECORD;
BEGIN
    -- Get current order status
    SELECT order_status INTO v_order_status
    FROM orders
    WHERE id = p_order_id AND user_id = auth.uid();

    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Only allow cancellation of pending or confirmed orders
    IF v_order_status NOT IN ('pending', 'confirmed') THEN
        RAISE EXCEPTION 'Cannot cancel order with status: %', v_order_status;
    END IF;

    -- Update order status
    UPDATE orders
    SET order_status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_order_id AND user_id = auth.uid();

    -- Restore inventory
    UPDATE product_variants pv
    SET stock = stock + oi.quantity,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = p_order_id
    AND pv.id = oi.variant_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE ORDER STATUS (Admin only)
-- Updates order status - for admin use
-- ============================================================================
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_new_status VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admins can update order status';
    END IF;

    -- Validate status
    IF p_new_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
        RAISE EXCEPTION 'Invalid order status: %', p_new_status;
    END IF;

    -- Update status
    UPDATE orders
    SET order_status = p_new_status,
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET ORDER ADDRESS
-- Returns the shipping address for an order
-- ============================================================================
CREATE OR REPLACE FUNCTION get_order_address(p_order_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    street_address VARCHAR(255),
    apartment VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_default BOOLEAN,
    address_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.*
    FROM addresses a
    JOIN orders o ON a.id = o.address_id
    WHERE o.id = p_order_id AND o.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF ORDER FUNCTIONS
-- ============================================================================
