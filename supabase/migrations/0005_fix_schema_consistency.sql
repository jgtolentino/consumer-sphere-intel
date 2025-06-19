-- Fix schema consistency and add missing columns
-- This migration ensures all tables have the necessary columns and constraints

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add customer_age to transactions if missing (referenced in indexes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'customer_age') THEN
        ALTER TABLE public.transactions ADD COLUMN customer_age INTEGER;
    END IF;
    
    -- Add loyalty_tier to customers if missing (referenced in indexes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'loyalty_tier') THEN
        ALTER TABLE public.customers ADD COLUMN loyalty_tier loyalty_tier DEFAULT 'regular';
    END IF;
    
    -- Add price column to transaction_items if missing (referenced in fix migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transaction_items' AND column_name = 'price') THEN
        ALTER TABLE public.transaction_items ADD COLUMN price NUMERIC;
        -- Copy unit_price to price for consistency
        UPDATE public.transaction_items SET price = unit_price WHERE price IS NULL;
    END IF;
END $$;

-- Fix stores table foreign key constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_store;
ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_store 
    FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;

-- Add missing product columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_size VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20);

-- Add missing store columns
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS store_code VARCHAR(50) UNIQUE;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS opening_hours JSONB;

-- Add missing transaction columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_voided BOOLEAN DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS void_reason TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS promotion_code VARCHAR(50);

-- Create composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date_customer ON public.transactions(transaction_date, customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_product ON public.transaction_items(transaction_id, product_id);
CREATE INDEX IF NOT EXISTS idx_customers_location ON public.customers(region, city, barangay);
CREATE INDEX IF NOT EXISTS idx_products_brand_category ON public.products(brand_id, category);

-- Add CHECK constraints for data integrity
ALTER TABLE public.transaction_items ADD CONSTRAINT IF NOT EXISTS check_positive_quantity 
    CHECK (quantity > 0);
    
ALTER TABLE public.products ADD CONSTRAINT IF NOT EXISTS check_positive_unit_price 
    CHECK (unit_price >= 0);
    
ALTER TABLE public.stores ADD CONSTRAINT IF NOT EXISTS check_valid_coordinates 
    CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    );

-- Add comments for better documentation
COMMENT ON COLUMN public.transactions.customer_age IS 'Customer age at time of transaction for analytics';
COMMENT ON COLUMN public.customers.loyalty_tier IS 'Customer loyalty program tier';
COMMENT ON COLUMN public.transaction_items.price IS 'Alias for unit_price for compatibility';
COMMENT ON COLUMN public.products.barcode IS 'Product barcode/UPC code';
COMMENT ON COLUMN public.stores.store_code IS 'Unique store identifier code';
COMMENT ON COLUMN public.stores.opening_hours IS 'JSON object with daily opening hours';

-- Create function to update customer purchase statistics
CREATE OR REPLACE FUNCTION public.update_customer_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.customers
    SET 
        total_purchases = total_purchases + NEW.total_amount,
        purchase_count = purchase_count + 1,
        last_purchase_date = NEW.transaction_date
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update customer stats on new transaction
DROP TRIGGER IF EXISTS update_customer_stats_on_transaction ON public.transactions;
CREATE TRIGGER update_customer_stats_on_transaction
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION public.update_customer_purchase_stats();

-- Create function to calculate transaction totals
CREATE OR REPLACE FUNCTION public.calculate_transaction_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update transaction totals based on items
    UPDATE public.transactions
    SET 
        subtotal = COALESCE((
            SELECT SUM(quantity * unit_price)
            FROM public.transaction_items
            WHERE transaction_id = NEW.transaction_id
        ), 0),
        items_count = COALESCE((
            SELECT COUNT(*)
            FROM public.transaction_items
            WHERE transaction_id = NEW.transaction_id
        ), 0)
    WHERE id = NEW.transaction_id;
    
    -- Update total_amount (subtotal + tax - discount)
    UPDATE public.transactions
    SET total_amount = subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
    WHERE id = NEW.transaction_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update transaction totals on item changes
DROP TRIGGER IF EXISTS update_transaction_totals ON public.transaction_items;
CREATE TRIGGER update_transaction_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_transaction_totals();