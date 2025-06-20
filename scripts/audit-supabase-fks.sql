-- Comprehensive Supabase FK Audit Script
-- Identifies ambiguous, duplicate, and problematic foreign key relationships

\echo '🔍 SUPABASE FK AUDIT STARTED'
\echo '================================='

-- 1. Find ALL foreign key constraints in the database
\echo ''
\echo '📋 ALL FOREIGN KEY CONSTRAINTS:'
\echo '-------------------------------'

SELECT 
    schemaname,
    tablename,
    constraintname,
    definition
FROM pg_views 
WHERE schemaname = 'information_schema' 
    AND viewname = 'table_constraints'
UNION ALL
SELECT
    tc.table_schema as schemaname,
    tc.table_name as tablename,
    tc.constraint_name as constraintname,
    pg_get_constraintdef(pc.oid) as definition
FROM 
    information_schema.table_constraints tc
    JOIN pg_constraint pc ON pc.conname = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tablename, constraintname;

-- 2. Identify DUPLICATE/AMBIGUOUS foreign keys (the main problem)
\echo ''
\echo '🚨 DUPLICATE/AMBIGUOUS FOREIGN KEYS:'
\echo '-----------------------------------'

WITH fk_analysis AS (
    SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        COUNT(*) OVER (PARTITION BY tc.table_name, kcu.column_name) as constraint_count
    FROM 
        information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
)
SELECT 
    table_name,
    column_name,
    foreign_table_name,
    constraint_count,
    STRING_AGG(constraint_name, ', ') as all_constraints
FROM fk_analysis 
WHERE constraint_count > 1
GROUP BY table_name, column_name, foreign_table_name, constraint_count
ORDER BY constraint_count DESC, table_name;

-- 3. Specific check for transactions <-> transaction_items ambiguity
\echo ''
\echo '🎯 TRANSACTIONS <-> TRANSACTION_ITEMS RELATIONSHIPS:'
\echo '--------------------------------------------------'

SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (
        (tc.table_name = 'transaction_items' AND ccu.table_name = 'transactions') OR
        (tc.table_name = 'transactions' AND ccu.table_name = 'transaction_items')
    )
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Check for missing indexes on FK columns (performance issue)
\echo ''
\echo '⚡ MISSING INDEXES ON FK COLUMNS:'
\echo '--------------------------------'

SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name,
    CASE 
        WHEN idx.indexname IS NULL THEN '❌ NO INDEX'
        ELSE '✅ INDEXED'
    END as index_status
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN pg_indexes idx ON idx.tablename = tc.table_name 
        AND idx.indexdef LIKE '%' || kcu.column_name || '%'
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    CASE WHEN idx.indexname IS NULL THEN 0 ELSE 1 END,
    tc.table_name;

-- 5. Validate table existence (missing tables that FKs reference)
\echo ''
\echo '🔍 VALIDATING REFERENCED TABLES EXIST:'
\echo '-------------------------------------'

WITH fk_targets AS (
    SELECT DISTINCT
        ccu.table_name as referenced_table
    FROM 
        information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
)
SELECT 
    ft.referenced_table,
    CASE 
        WHEN t.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as table_status
FROM fk_targets ft
LEFT JOIN information_schema.tables t ON t.table_name = ft.referenced_table 
    AND t.table_schema = 'public'
ORDER BY table_status, ft.referenced_table;

-- 6. Generate FK cleanup script for duplicates
\echo ''
\echo '🔧 GENERATED CLEANUP COMMANDS:'
\echo '-----------------------------'

WITH duplicate_fks AS (
    SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_name,
        ccu.table_name AS foreign_table_name,
        COUNT(*) OVER (PARTITION BY tc.table_name, kcu.column_name) as constraint_count,
        ROW_NUMBER() OVER (PARTITION BY tc.table_name, kcu.column_name ORDER BY tc.constraint_name) as rn
    FROM 
        information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
)
SELECT 
    '-- Drop duplicate FK: ' || constraint_name as comment,
    'ALTER TABLE public.' || table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_name || ';' as cleanup_sql
FROM duplicate_fks 
WHERE constraint_count > 1 AND rn > 1
ORDER BY table_name, constraint_name;

-- 7. Summary report
\echo ''
\echo '📊 FK AUDIT SUMMARY:'
\echo '-------------------'

SELECT 
    'Total FK Constraints' as metric,
    COUNT(*)::text as value
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'

UNION ALL

SELECT 
    'Tables with Ambiguous FKs' as metric,
    COUNT(DISTINCT table_name)::text as value
FROM (
    SELECT 
        tc.table_name,
        kcu.column_name,
        COUNT(*) as constraint_count
    FROM 
        information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    GROUP BY tc.table_name, kcu.column_name
    HAVING COUNT(*) > 1
) duplicates

UNION ALL

SELECT 
    'Missing FK Indexes' as metric,
    COUNT(*)::text as value
FROM (
    SELECT 
        tc.table_name,
        kcu.column_name
    FROM 
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN pg_indexes idx ON idx.tablename = tc.table_name 
            AND idx.indexdef LIKE '%' || kcu.column_name || '%'
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND idx.indexname IS NULL
) missing_indexes;

\echo ''
\echo '✅ FK AUDIT COMPLETE'
\echo '==================='