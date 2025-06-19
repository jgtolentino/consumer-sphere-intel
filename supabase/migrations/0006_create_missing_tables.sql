-- Create missing core tables required by the application
-- This migration adds products, stores, and transaction_items tables

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL,
    unit_price NUMERIC(10,2) DEFAULT 0,
    barcode VARCHAR(100),
    description TEXT,
    unit_size VARCHAR(50),
    unit_of_measure VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    region VARCHAR(100),
    city VARCHAR(100),
    barangay VARCHAR(100),
    store_code VARCHAR(50) UNIQUE,
    contact_number VARCHAR(50),
    manager_name VARCHAR(255),
    opening_hours JSONB,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Create transaction_items table (properly named with single FK to transactions)
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    price NUMERIC(10,2), -- Compatibility alias
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update price column to match unit_price
UPDATE public.transaction_items SET price = unit_price WHERE price IS NULL;

-- Create substitutions table for product substitution analysis
CREATE TABLE IF NOT EXISTS public.substitutions (
    id BIGSERIAL PRIMARY KEY,
    from_product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    to_product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    reason VARCHAR(255),
    frequency INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer_requests table for behavioral analysis
CREATE TABLE IF NOT EXISTS public.customer_requests (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES public.customers(id) ON DELETE SET NULL,
    request_type VARCHAR(100),
    accepted_suggestion BOOLEAN DEFAULT false,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

CREATE INDEX IF NOT EXISTS idx_stores_region ON public.stores(region);
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_barangay ON public.stores(barangay);
CREATE INDEX IF NOT EXISTS idx_stores_code ON public.stores(store_code);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON public.transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_quantity_price ON public.transaction_items(quantity, unit_price);

CREATE INDEX IF NOT EXISTS idx_substitutions_from_product ON public.substitutions(from_product_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_to_product ON public.substitutions(to_product_id);

CREATE INDEX IF NOT EXISTS idx_customer_requests_customer_id ON public.customer_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_requests_type ON public.customer_requests(request_type);

-- Fix foreign key constraint for transactions -> stores
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_store;
ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_store 
    FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;

-- Add missing columns to customers for compatibility with mock data
DO $$ 
BEGIN
    -- Add age_bracket column (different from age_group)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'age_bracket') THEN
        ALTER TABLE public.customers ADD COLUMN age_bracket VARCHAR(20);
        -- Map age_group to age_bracket for compatibility
        UPDATE public.customers SET age_bracket = age_group::text WHERE age_bracket IS NULL;
    END IF;
    
    -- Add inferred_income column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'inferred_income') THEN
        ALTER TABLE public.customers ADD COLUMN inferred_income VARCHAR(50) DEFAULT 'middle';
    END IF;
    
    -- Add payment_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'payment_method') THEN
        ALTER TABLE public.customers ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash';
    END IF;
    
    -- Add is_tbwa column to brands for compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'brands' AND column_name = 'is_tbwa') THEN
        ALTER TABLE public.brands ADD COLUMN is_tbwa BOOLEAN DEFAULT false;
        -- Map is_client to is_tbwa
        UPDATE public.brands SET is_tbwa = is_client WHERE is_tbwa IS NULL;
    END IF;
END $$;

-- Create audit triggers for new tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transaction_items_updated_at BEFORE UPDATE ON public.transaction_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_substitutions_updated_at BEFORE UPDATE ON public.substitutions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_customer_requests_updated_at BEFORE UPDATE ON public.customer_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables (public read, service role write)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Products are editable by service role" ON public.products
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Stores are viewable by everyone" ON public.stores
    FOR SELECT USING (true);

CREATE POLICY "Stores are editable by service role" ON public.stores
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Transaction items viewable with transaction" ON public.transaction_items
    FOR SELECT USING (
        transaction_id IN (
            SELECT id FROM public.transactions 
            WHERE customer_id IN (
                SELECT id FROM public.customers WHERE user_id = auth.uid()
            )
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Transaction items editable by service role" ON public.transaction_items
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Substitutions are viewable by everyone" ON public.substitutions
    FOR SELECT USING (true);

CREATE POLICY "Substitutions are editable by service role" ON public.substitutions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Customer requests viewable by owner" ON public.customer_requests
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Customer requests editable by service role" ON public.customer_requests
    FOR ALL USING (auth.role() = 'service_role');

-- Add table comments
COMMENT ON TABLE public.products IS 'Product catalog with brand relationships';
COMMENT ON TABLE public.stores IS 'Store locations and details';
COMMENT ON TABLE public.transaction_items IS 'Individual items within transactions';
COMMENT ON TABLE public.substitutions IS 'Product substitution patterns';
COMMENT ON TABLE public.customer_requests IS 'Customer service requests and interactions';

COMMENT ON COLUMN public.products.unit_price IS 'Base unit price for the product';
COMMENT ON COLUMN public.stores.store_code IS 'Unique store identifier code';
COMMENT ON COLUMN public.transaction_items.transaction_id IS 'References parent transaction (single FK)';
COMMENT ON COLUMN public.transaction_items.price IS 'Compatibility alias for unit_price';