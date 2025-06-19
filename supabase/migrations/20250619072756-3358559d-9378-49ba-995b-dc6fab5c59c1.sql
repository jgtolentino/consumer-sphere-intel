
-- First, let's check the current structure and add missing columns/relationships

-- Add missing unit_price column to transaction_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transaction_items' AND column_name = 'unit_price') THEN
        ALTER TABLE transaction_items ADD COLUMN unit_price NUMERIC DEFAULT 0;
        UPDATE transaction_items SET unit_price = price WHERE unit_price = 0;
    END IF;
END $$;

-- Ensure foreign key relationships exist
DO $$
BEGIN
    -- Add foreign key from transaction_items to transactions if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_transaction_items_transaction_id') THEN
        ALTER TABLE transaction_items 
        ADD CONSTRAINT fk_transaction_items_transaction_id 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key from transaction_items to products if not exists  
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_transaction_items_product_id') THEN
        ALTER TABLE transaction_items 
        ADD CONSTRAINT fk_transaction_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key from products to brands if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_products_brand_id') THEN
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_brand_id 
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Test the relationships work
SELECT 
  ti.id,
  ti.quantity,
  ti.unit_price,
  p.name as product_name,
  p.category,
  b.name as brand_name,
  b.category as brand_category
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
LEFT JOIN brands b ON p.brand_id = b.id
LIMIT 5;
