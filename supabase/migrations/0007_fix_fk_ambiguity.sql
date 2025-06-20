-- Fix Supabase FK Ambiguity
-- Remove duplicate or ambiguous foreign key constraints

-- 1. Fix transaction_items → transactions FK ambiguity
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS transaction_items_transaction_id_fkey;
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS fk_transaction_items_transaction_id;
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS transaction_items_transaction_fkey;

-- Add single, canonical FK for transactions
ALTER TABLE public.transaction_items
ADD CONSTRAINT transaction_items_transaction_id_fkey
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

-- 2. Fix transaction_items → products FK ambiguity
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS transaction_items_product_id_fkey;
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS fk_transaction_items_product_id;
ALTER TABLE public.transaction_items
DROP CONSTRAINT IF EXISTS transaction_items_product_fkey;

-- Add single, canonical FK for products
ALTER TABLE public.transaction_items
ADD CONSTRAINT transaction_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- 3. Fix products → brands FK ambiguity
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_brand_id_fkey;
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS fk_products_brand_id;
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_brand_fkey;

-- Add single, canonical FK for brands
ALTER TABLE public.products
ADD CONSTRAINT products_brand_id_fkey
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;

-- 4. Fix transactions → customers FK ambiguity
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_customer_id_fkey;
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS fk_transactions_customer_id;
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_customer_fkey;

-- Add single, canonical FK for customers
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

-- 5. Fix transactions → stores FK ambiguity
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_store_id_fkey;
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS fk_transactions_store_id;
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS fk_transactions_store;
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_store_fkey;

-- Add single, canonical FK for stores
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_store_id_fkey
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;

-- 6. Fix substitutions table FKs
ALTER TABLE public.substitutions
DROP CONSTRAINT IF EXISTS substitutions_from_product_id_fkey;
ALTER TABLE public.substitutions
DROP CONSTRAINT IF EXISTS fk_substitutions_from_product_id;
ALTER TABLE public.substitutions
DROP CONSTRAINT IF EXISTS substitutions_to_product_id_fkey;
ALTER TABLE public.substitutions
DROP CONSTRAINT IF EXISTS fk_substitutions_to_product_id;

-- Add canonical substitution FKs
ALTER TABLE public.substitutions
ADD CONSTRAINT substitutions_from_product_id_fkey
FOREIGN KEY (from_product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.substitutions
ADD CONSTRAINT substitutions_to_product_id_fkey
FOREIGN KEY (to_product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- 7. Fix customer_requests table FK
ALTER TABLE public.customer_requests
DROP CONSTRAINT IF EXISTS customer_requests_customer_id_fkey;
ALTER TABLE public.customer_requests
DROP CONSTRAINT IF EXISTS fk_customer_requests_customer_id;

-- Add canonical customer_requests FK
ALTER TABLE public.customer_requests
ADD CONSTRAINT customer_requests_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

-- 8. Create indexes for performance on all FK columns
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON public.transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_from_product_id ON public.substitutions(from_product_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_to_product_id ON public.substitutions(to_product_id);
CREATE INDEX IF NOT EXISTS idx_customer_requests_customer_id ON public.customer_requests(customer_id);

-- 9. Add constraint names to table comments for documentation
COMMENT ON CONSTRAINT transaction_items_transaction_id_fkey ON public.transaction_items 
IS 'Canonical FK: transaction_items.transaction_id → transactions.id';

COMMENT ON CONSTRAINT transaction_items_product_id_fkey ON public.transaction_items 
IS 'Canonical FK: transaction_items.product_id → products.id';

COMMENT ON CONSTRAINT products_brand_id_fkey ON public.products 
IS 'Canonical FK: products.brand_id → brands.id';

COMMENT ON CONSTRAINT transactions_customer_id_fkey ON public.transactions 
IS 'Canonical FK: transactions.customer_id → customers.id';

COMMENT ON CONSTRAINT transactions_store_id_fkey ON public.transactions 
IS 'Canonical FK: transactions.store_id → stores.id';

-- 10. Verify FK constraints are clean (no duplicates)
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Check for duplicate FKs on transaction_items.transaction_id
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema, table_name)
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'transaction_items'
    AND kcu.column_name = 'transaction_id';
    
    IF fk_count > 1 THEN
        RAISE WARNING 'Multiple FKs still exist on transaction_items.transaction_id: %', fk_count;
    ELSE
        RAISE NOTICE 'FK cleanup successful: transaction_items.transaction_id has % constraint(s)', fk_count;
    END IF;
END $$;