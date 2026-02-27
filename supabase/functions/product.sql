-- ============================================================================
-- PRODUCT FETCH FUNCTIONS
-- Supabase Database Functions for Product Operations
-- ============================================================================

-- ============================================================================
-- GET ALL PRODUCTS
-- Returns products with optional filters
-- ============================================================================
CREATE OR REPLACE FUNCTION get_products(
    p_category TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.is_active = true
        AND (p_category IS NULL OR p.category = p_category)
        AND (
            p_search IS NULL OR 
            p.name ILIKE '%' || p_search || '%' OR 
            p.description ILIKE '%' || p_search || '%' OR
            p.brand ILIKE '%' || p_search || '%'
        )
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET PRODUCT BY ID
-- Returns a single product by ID
-- ============================================================================
CREATE OR REPLACE FUNCTION get_product_by_id(p_product_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.id = p_product_id AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET PRODUCT VARIANTS
-- Returns all variants for a product
-- ============================================================================
CREATE OR REPLACE FUNCTION get_product_variants(p_product_id UUID)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    stock INTEGER,
    price DECIMAL(10, 2),
    sku VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.id,
        pv.product_id,
        pv.size,
        pv.color,
        pv.stock,
        pv.price,
        pv.sku,
        pv.image_url,
        pv.is_active,
        pv.created_at,
        pv.updated_at
    FROM product_variants pv
    WHERE pv.product_id = p_product_id 
        AND pv.is_active = true
    ORDER BY pv.size, pv.color;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET VARIANT BY ID
-- Returns a specific variant
-- ============================================================================
CREATE OR REPLACE FUNCTION get_variant_by_id(p_variant_id UUID)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    stock INTEGER,
    price DECIMAL(10, 2),
    sku VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.id,
        pv.product_id,
        pv.size,
        pv.color,
        pv.stock,
        pv.price,
        pv.sku,
        pv.image_url,
        pv.is_active,
        pv.created_at,
        pv.updated_at
    FROM product_variants pv
    WHERE pv.id = p_variant_id 
        AND pv.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET PRODUCT WITH VARIANTS
-- Returns product with all its variants
-- ============================================================================
CREATE OR REPLACE FUNCTION get_product_with_variants(p_product_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pv.id,
                    'size', pv.size,
                    'color', pv.color,
                    'stock', pv.stock,
                    'price', pv.price,
                    'sku', pv.sku,
                    'image_url', pv.image_url
                )
            )
            FROM product_variants pv
            WHERE pv.product_id = p.id AND pv.is_active = true
        ) AS variants
    FROM products p
    WHERE p.id = p_product_id AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET FEATURED PRODUCTS
-- Returns featured products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_featured_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.is_active = true AND p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET NEW ARRIVALS
-- Returns new arrival products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_new_arrivals(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.is_active = true AND p.is_new_arrival = true
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET CATEGORIES
-- Returns all unique categories
-- ============================================================================
CREATE OR REPLACE FUNCTION get_categories()
RETURNS TABLE (category VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.category
    FROM products p
    WHERE p.is_active = true
    ORDER BY p.category;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET SUBCATEGORIES
-- Returns subcategories for a given category
-- ============================================================================
CREATE OR REPLACE FUNCTION get_subcategories(p_category VARCHAR(50))
RETURNS TABLE (subcategory VARCHAR(100)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.subcategory
    FROM products p
    WHERE p.is_active = true 
        AND p.category = p_category
        AND p.subcategory IS NOT NULL
    ORDER BY p.subcategory;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET BRANDS
-- Returns all unique brands
-- ============================================================================
CREATE OR REPLACE FUNCTION get_brands()
RETURNS TABLE (brand VARCHAR(100)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.brand
    FROM products p
    WHERE p.is_active = true AND p.brand IS NOT NULL
    ORDER BY p.brand;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET AVAILABLE SIZES
-- Returns available sizes for a product
-- ============================================================================
CREATE OR REPLACE FUNCTION get_available_sizes(p_product_id UUID)
RETURNS TABLE (size VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT pv.size
    FROM product_variants pv
    WHERE pv.product_id = p_product_id 
        AND pv.is_active = true
        AND pv.stock > 0
    ORDER BY 
        CASE pv.size
            WHEN 'XS' THEN 1
            WHEN 'S' THEN 2
            WHEN 'M' THEN 3
            WHEN 'L' THEN 4
            WHEN 'XL' THEN 5
            WHEN 'XXL' THEN 6
            WHEN '3XL' THEN 7
            WHEN '4XL' THEN 8
            WHEN '5XL' THEN 9
            ELSE 10
        END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET AVAILABLE COLORS
-- Returns available colors for a product
-- ============================================================================
CREATE OR REPLACE FUNCTION get_available_colors(p_product_id UUID)
RETURNS TABLE (color VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT pv.color
    FROM product_variants pv
    WHERE pv.product_id = p_product_id 
        AND pv.is_active = true
        AND pv.stock > 0
    ORDER BY pv.color;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET VARIANT BY SIZE AND COLOR
-- Returns a specific variant by size and color
-- ============================================================================
CREATE OR REPLACE FUNCTION get_variant_by_size_color(
    p_product_id UUID,
    p_size VARCHAR(20),
    p_color VARCHAR(50)
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    size VARCHAR(20),
    color VARCHAR(50),
    stock INTEGER,
    price DECIMAL(10, 2),
    sku VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.id,
        pv.product_id,
        pv.size,
        pv.color,
        pv.stock,
        pv.price,
        pv.sku,
        pv.image_url,
        pv.is_active,
        pv.created_at,
        pv.updated_at
    FROM product_variants pv
    WHERE pv.product_id = p_product_id 
        AND pv.size = p_size 
        AND pv.color = p_color
        AND pv.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET RELATED PRODUCTS
-- Returns related products based on category and subcategory
-- ============================================================================
CREATE OR REPLACE FUNCTION get_related_products(
    p_product_id UUID,
    p_limit INTEGER DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    base_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    brand VARCHAR(100),
    images TEXT[],
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_category VARCHAR(50);
    v_subcategory VARCHAR(100);
BEGIN
    -- Get the category and subcategory of the current product
    SELECT p.category, p.subcategory INTO v_category, v_subcategory
    FROM products p
    WHERE p.id = p_product_id;

    RETURN QUERY
    SELECT 
        p.id,
        p.name::TEXT,
        p.description::TEXT,
        p.category,
        p.subcategory,
        p.base_price,
        p.discount_percentage,
        p.brand,
        p.images,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.is_active = true 
        AND p.id != p_product_id
        AND (
            p.category = v_category 
            OR p.subcategory = v_subcategory
        )
    ORDER BY 
        CASE 
            WHEN p.category = v_category AND p.subcategory = v_subcategory THEN 1
            WHEN p.category = v_category THEN 2
            ELSE 3
        END,
        p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF PRODUCT FUNCTIONS
-- ============================================================================
