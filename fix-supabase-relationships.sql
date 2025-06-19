-- Fix PGRST201 relationship ambiguity error
-- Run this in Supabase SQL Editor to diagnose and fix multiple FK relationships

-- 1. DIAGNOSE: Check all foreign key constraints between transactions and transaction_items
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND (
        (tc.table_name = 'transaction_items' AND ccu.table_name = 'transactions')
        OR 
        (tc.table_name = 'transactions' AND ccu.table_name = 'transaction_items')
    );

-- 2. EXPECTED RESULT: Should show only ONE FK relationship
-- transaction_items.transaction_id -> transactions.id

-- 3. If you see MULTIPLE relationships, run commands below to clean up:

-- Example cleanup (adjust constraint names based on your actual results):
-- DROP CONSTRAINT IF EXISTS constraint_name_to_remove;

-- 4. Verify the correct relationship exists:
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'transaction_items' 
    AND column_name IN ('transaction_id', 'id');

-- 5. Test the corrected relationship:
SELECT t.id, t.created_at, ti.quantity, ti.unit_price
FROM transactions t
JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 5;

-- 6. VERIFICATION: This query should work after fixing relationships
-- (This is what the RealDataService is trying to execute)
SELECT 
    t.*,
    json_agg(
        json_build_object(
            'quantity', ti.quantity,
            'unit_price', ti.unit_price,
            'product_category', p.category
        )
    ) as items
FROM transactions t
LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
LEFT JOIN products p ON p.id = ti.product_id
GROUP BY t.id
LIMIT 10;