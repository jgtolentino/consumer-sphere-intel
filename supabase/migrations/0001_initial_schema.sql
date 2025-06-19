-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE age_group AS ENUM ('18-24', '25-34', '35-44', '45-54', '55-64', '65+');

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create brands table
CREATE TABLE public.brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    parent_company VARCHAR(255),
    is_client BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for brands
CREATE INDEX idx_brands_name ON public.brands(name);
CREATE INDEX idx_brands_category ON public.brands(category);
CREATE INDEX idx_brands_is_client ON public.brands(is_client);

-- Create customers table
CREATE TABLE public.customers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    gender gender,
    age_group age_group,
    status customer_status DEFAULT 'active',
    
    -- Location fields
    barangay VARCHAR(255),
    city VARCHAR(255),
    province VARCHAR(255),
    region VARCHAR(255),
    
    -- Analytics fields
    total_purchases NUMERIC(12,2) DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    last_purchase_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for customers
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_barangay ON public.customers(barangay);
CREATE INDEX idx_customers_city ON public.customers(city);
CREATE INDEX idx_customers_region ON public.customers(region);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_gender ON public.customers(gender);
CREATE INDEX idx_customers_age_group ON public.customers(age_group);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);

-- Create transactions table
CREATE TABLE public.transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES public.customers(id) ON DELETE SET NULL,
    store_id BIGINT,
    transaction_number VARCHAR(100) UNIQUE,
    status transaction_status DEFAULT 'completed',
    
    -- Financial fields
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    
    -- Transaction details
    items_count INTEGER DEFAULT 0,
    payment_method VARCHAR(50),
    cashier_id VARCHAR(100),
    register_id VARCHAR(100),
    
    -- Timestamps
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_amounts CHECK (
        subtotal >= 0 AND 
        tax_amount >= 0 AND 
        discount_amount >= 0 AND 
        total_amount >= 0
    )
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX idx_transactions_transaction_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_payment_method ON public.transactions(payment_method);
CREATE INDEX idx_transactions_transaction_number ON public.transactions(transaction_number);
CREATE INDEX idx_transactions_date_range ON public.transactions(transaction_date DESC);

-- Create audit triggers
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brands (public read, authenticated write)
CREATE POLICY "Brands are viewable by everyone" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "Brands are editable by authenticated users" ON public.brands
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for customers (users can see their own data)
CREATE POLICY "Customers can view their own profile" ON public.customers
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Customers can update their own profile" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all customers" ON public.customers
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for transactions (users can see their own transactions)
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage all transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.brands IS 'Product brands including TBWA clients and competitors';
COMMENT ON TABLE public.customers IS 'Customer profiles with demographics and location data';
COMMENT ON TABLE public.transactions IS 'Purchase transactions with financial details';

COMMENT ON COLUMN public.brands.is_client IS 'True if this is a TBWA client brand';
COMMENT ON COLUMN public.customers.user_id IS 'Links to Supabase auth.users for authentication';
COMMENT ON COLUMN public.transactions.transaction_number IS 'Unique transaction identifier from POS system';