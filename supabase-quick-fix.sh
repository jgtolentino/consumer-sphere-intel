#!/bin/bash

# Quick Supabase relationship fix via CLI
# Usage: ./supabase-quick-fix.sh [DATABASE_URL]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Supabase PGRST201 Fix${NC}"
echo "=============================="

# Check for database URL
DB_URL="${1:-$SUPABASE_DB_URL}"
if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ Database URL required${NC}"
    echo "Usage: $0 <database_url>"
    echo "Or set SUPABASE_DB_URL environment variable"
    exit 1
fi

echo -e "${BLUE}🔍 Checking relationships...${NC}"

# Run diagnostic
psql "$DB_URL" -c "
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
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'transaction_items' 
    AND ccu.table_name = 'transactions';
"

echo ""
echo -e "${YELLOW}⚠️  If you see multiple FK constraints above, continue with fix...${NC}"
echo ""

read -p "Proceed with relationship cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo -e "${BLUE}🔧 Applying fix...${NC}"

# Generic cleanup - remove common duplicate constraint patterns
psql "$DB_URL" -c "
-- Remove potential duplicate constraints (safe if they don't exist)
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_trans_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_order_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_trans_id_fkey;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_order_id_fkey;

-- Ensure the correct relationship exists
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transaction_items' 
        AND constraint_name = 'transaction_items_transaction_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE transaction_items 
        ADD CONSTRAINT transaction_items_transaction_id_fkey 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id);
    END IF;
END \$\$;
"

echo -e "${GREEN}✅ Relationship cleanup complete${NC}"

echo -e "${BLUE}🧪 Testing fix...${NC}"

# Test the relationship
psql "$DB_URL" -c "
SELECT t.id, t.created_at, ti.quantity, ti.unit_price
FROM transactions t
JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 3;
"

echo ""
echo -e "${GREEN}🎉 Fix applied! Your dashboard should now load real data.${NC}"
echo -e "${BLUE}Next: Refresh your browser and check for PGRST201 errors.${NC}"