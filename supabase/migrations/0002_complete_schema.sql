-- Complete InsightPulseAI schema with all missing tables, constraints, and indexes
-- Migration 0002: Add all remaining tables and relationships

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs
CREATE TYPE public.log_level AS ENUM ('info', 'warning', 'error', 'debug');
CREATE TYPE public.device_status AS ENUM ('online', 'offline', 'maintenance', 'error');
CREATE TYPE public.substitution_reason AS ENUM ('out_of_stock', 'price_sensitive', 'brand_preference', 'recommendation');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile', 'gcash', 'paymaya');
CREATE TYPE public.request_type AS ENUM ('branded', 'generic', 'substitute', 'recommendation');
CREATE TYPE public.loyalty_tier AS ENUM ('regular', 'silver', 'gold', 'platinum');

-- Products table
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    brand_id INT REFERENCES public.brands(id),
    sku VARCHAR UNIQUE,
    unit_price NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stores table
CREATE TABLE public.stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    location TEXT NOT NULL,
    region VARCHAR NOT NULL,
    city VARCHAR,
    barangay VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction items table
CREATE TABLE public.transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Substitutions table
CREATE TABLE public.substitutions (
    id SERIAL PRIMARY KEY,
    original_product_id INT NOT NULL REFERENCES public.products(id),
    substitute_product_id INT NOT NULL REFERENCES public.products(id),
    transaction_id INT REFERENCES public.transactions(id),
    customer_id INT REFERENCES public.customers(id),
    reason substitution_reason DEFAULT 'recommendation',
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer requests table
CREATE TABLE public.customer_requests (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES public.customers(id),
    request_text TEXT NOT NULL,
    request_type request_type DEFAULT 'generic',
    nlp_processed BOOLEAN DEFAULT FALSE,
    nlp_confidence NUMERIC,
    response_text TEXT,
    satisfaction_score INT CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Request behaviors table
CREATE TABLE public.request_behaviors (
    id SERIAL PRIMARY KEY,
    customer_request_id INT NOT NULL REFERENCES public.customer_requests(id) ON DELETE CASCADE,
    behavior_type VARCHAR NOT NULL,
    behavior_value TEXT,
    confidence_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Devices table
CREATE TABLE public.devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR UNIQUE NOT NULL,
    device_name VARCHAR,
    store_id INT REFERENCES public.stores(id),
    device_type VARCHAR DEFAULT 'pos',
    status device_status DEFAULT 'online',
    last_seen TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Device health table
CREATE TABLE public.device_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR NOT NULL REFERENCES public.devices(device_id),
    cpu_usage NUMERIC,
    memory_usage NUMERIC,
    disk_usage NUMERIC,
    network_latency NUMERIC,
    status device_status DEFAULT 'online',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Edge logs table
CREATE TABLE public.edge_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR REFERENCES public.devices(device_id),
    log_level log_level DEFAULT 'info',
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product detections table
CREATE TABLE public.product_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR REFERENCES public.devices(device_id),
    product_id INT REFERENCES public.products(id),
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    detection_metadata JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraints to existing tables
ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_store 
    FOREIGN KEY (store_id) REFERENCES public.stores(id);

-- Create indexes for performance
CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON public.transaction_items(product_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX idx_transactions_customer_age ON public.transactions(customer_age);
CREATE INDEX idx_customers_region ON public.customers(region);
CREATE INDEX idx_customers_loyalty_tier ON public.customers(loyalty_tier);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_substitutions_original_product ON public.substitutions(original_product_id);
CREATE INDEX idx_substitutions_substitute_product ON public.substitutions(substitute_product_id);
CREATE INDEX idx_customer_requests_customer_id ON public.customer_requests(customer_id);
CREATE INDEX idx_customer_requests_created_at ON public.customer_requests(created_at);
CREATE INDEX idx_device_health_device_id ON public.device_health(device_id);
CREATE INDEX idx_device_health_created_at ON public.device_health(created_at);
CREATE INDEX idx_edge_logs_device_id ON public.edge_logs(device_id);
CREATE INDEX idx_edge_logs_created_at ON public.edge_logs(created_at);
CREATE INDEX idx_edge_logs_log_level ON public.edge_logs(log_level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that have updated_at column
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_detections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.transaction_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.substitutions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.customer_requests FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.request_behaviors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.device_health FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.edge_logs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.product_detections FOR SELECT USING (true);

-- Service role write policies
CREATE POLICY "Enable write for service role" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.stores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.transaction_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.substitutions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.customer_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.request_behaviors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.devices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.device_health FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.edge_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable write for service role" ON public.product_detections FOR ALL TO service_role USING (true) WITH CHECK (true);