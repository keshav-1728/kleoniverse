-- ============================================================================
-- ADDRESS MANAGEMENT FUNCTIONS
-- Supabase Database Functions for Address Operations
-- ============================================================================

-- ============================================================================
-- GET ADDRESSES
-- Returns all addresses for the authenticated user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_addresses()
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
    SELECT 
        a.id,
        a.user_id,
        a.full_name,
        a.phone,
        a.street_address,
        a.apartment,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        a.is_default,
        a.address_type,
        a.created_at,
        a.updated_at
    FROM addresses a
    WHERE a.user_id = auth.uid()
    ORDER BY a.is_default DESC, a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET ADDRESS BY ID
-- Returns a specific address by ID
-- ============================================================================
CREATE OR REPLACE FUNCTION get_address_by_id(p_address_id UUID)
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
    SELECT *
    FROM addresses
    WHERE id = p_address_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAVE ADDRESS
-- Creates or updates an address
-- Returns the created/updated address
-- ============================================================================
CREATE OR REPLACE FUNCTION save_address(
    p_full_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_street_address VARCHAR(255),
    p_apartment VARCHAR(255),
    p_city VARCHAR(100),
    p_state VARCHAR(100),
    p_postal_code VARCHAR(20),
    p_country VARCHAR(100),
    p_is_default BOOLEAN DEFAULT false,
    p_address_type VARCHAR(20) DEFAULT 'shipping',
    p_address_id UUID DEFAULT NULL
)
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
DECLARE
    v_address_id UUID;
BEGIN
    -- Validate required fields
    IF p_full_name IS NULL OR p_full_name = '' THEN
        RAISE EXCEPTION 'Full name is required';
    END IF;

    IF p_phone IS NULL OR p_phone = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;

    IF p_street_address IS NULL OR p_street_address = '' THEN
        RAISE EXCEPTION 'Street address is required';
    END IF;

    IF p_city IS NULL OR p_city = '' THEN
        RAISE EXCEPTION 'City is required';
    END IF;

    IF p_state IS NULL OR p_state = '' THEN
        RAISE EXCEPTION 'State is required';
    END IF;

    IF p_postal_code IS NULL OR p_postal_code = '' THEN
        RAISE EXCEPTION 'Postal code is required';
    END IF;

    -- If this is a new address or setting as default
    IF p_address_id IS NULL THEN
        -- Insert new address
        INSERT INTO addresses (
            user_id,
            full_name,
            phone,
            street_address,
            apartment,
            city,
            state,
            postal_code,
            country,
            is_default,
            address_type
        ) VALUES (
            auth.uid(),
            p_full_name,
            p_phone,
            p_street_address,
            p_apartment,
            p_city,
            p_state,
            p_postal_code,
            COALESCE(p_country, 'India'),
            p_is_default,
            p_address_type
        )
        RETURNING id INTO v_address_id;
    ELSE
        -- Update existing address
        UPDATE addresses
        SET 
            full_name = p_full_name,
            phone = p_phone,
            street_address = p_street_address,
            apartment = p_apartment,
            city = p_city,
            state = p_state,
            postal_code = p_postal_code,
            country = COALESCE(p_country, 'India'),
            is_default = p_is_default,
            address_type = p_address_type,
            updated_at = NOW()
        WHERE id = p_address_id AND user_id = auth.uid()
        RETURNING id INTO v_address_id;

        IF v_address_id IS NULL THEN
            RAISE EXCEPTION 'Address not found or access denied';
        END IF;
    END IF;

    -- Return the address
    RETURN QUERY
    SELECT *
    FROM addresses
    WHERE id = v_address_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DELETE ADDRESS
-- Removes an address
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_address(p_address_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM addresses
    WHERE id = p_address_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SET DEFAULT ADDRESS
-- Sets an address as the default
-- ============================================================================
CREATE OR REPLACE FUNCTION set_default_address(p_address_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- First, unset all defaults for this user
    UPDATE addresses
    SET is_default = false
    WHERE user_id = auth.uid();

    -- Then set the specified address as default
    UPDATE addresses
    SET is_default = true, updated_at = NOW()
    WHERE id = p_address_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET DEFAULT ADDRESS
-- Returns the default address for the user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_default_address()
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
    SELECT *
    FROM addresses
    WHERE user_id = auth.uid() AND is_default = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF ADDRESS FUNCTIONS
-- ============================================================================
