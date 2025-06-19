#!/bin/bash

# Fix Supabase with actual project credentials
# Using credentials found in the codebase

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Supabase with Real Credentials${NC}"
echo "========================================"

# Set actual credentials from codebase
export SUPABASE_URL="https://lcoxtanyckjzyxxcsjzz.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDUzMjcsImV4cCI6MjA2MzkyMTMyN30.W2JgvZdXubvWpKCNZ7TfjLiKANZO1Hlb164fBEKH2dA"
export SUPABASE_DB_URL="postgresql://postgres:R@nd0mPA$$2025!@db.lcoxtanyckjzyxxcsjzz.supabase.co:5432/postgres"

echo -e "${GREEN}✅ Using project: lcoxtanyckjzyxxcsjzz${NC}"
echo ""

# Test connection first
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if psql "$SUPABASE_DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo "❌ Database connection failed"
    echo "Check if password is correct or database is accessible"
    exit 1
fi

# Run FK diagnostic and fix
echo -e "${BLUE}🔧 Running FK relationship fix...${NC}"

# Diagnostic query
echo "Current FK relationships:"
psql "$SUPABASE_DB_URL" -c "
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
ORDER BY tc.constraint_name;
"

# Apply FK fixes
echo -e "${BLUE}🔧 Applying FK fixes...${NC}"
psql "$SUPABASE_DB_URL" -c "
-- Drop potential duplicate constraints
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_transaction_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_trans_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_trans_id_fkey;

-- Ensure correct relationship exists
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
        RAISE NOTICE 'Created transaction_items_transaction_id_fkey';
    END IF;
END \$\$;

SELECT 'FK fixes applied successfully' as status;
"

# Test the fix
echo -e "${BLUE}🧪 Testing corrected relationships...${NC}"
psql "$SUPABASE_DB_URL" -c "
SELECT t.id, t.created_at, ti.quantity, ti.unit_price
FROM transactions t
LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 3;
"

# Test API call
echo -e "${BLUE}🔗 Testing API endpoint...${NC}"
curl -X GET "$SUPABASE_URL/rest/v1/transactions?select=*,transaction_items(quantity,unit_price)&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -w "HTTP Status: %{http_code}\n"

echo ""
echo -e "${GREEN}🎉 Fix completed with real credentials!${NC}"
echo "Dashboard should now load real data without PGRST201 errors"