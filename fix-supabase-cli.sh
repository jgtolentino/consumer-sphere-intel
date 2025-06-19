#!/bin/bash

# Supabase PGRST201 Relationship Fix CLI Tool
# Run this script to diagnose and fix foreign key relationship issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Supabase PGRST201 Relationship Fix Tool${NC}"
echo "=============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    echo "Or: brew install supabase/tap/supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}❌ Not in a Supabase project directory${NC}"
    echo "Run 'supabase init' first or navigate to your project directory"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Function to run SQL and handle errors
run_sql() {
    local sql_query="$1"
    local description="$2"
    
    echo -e "${BLUE}🔍 ${description}${NC}"
    echo "Query: $sql_query"
    echo ""
    
    if supabase db reset --db-url "$SUPABASE_DB_URL" --sql "$sql_query" 2>/dev/null; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${YELLOW}⚠️  Query failed or returned no results${NC}"
    fi
    echo ""
}

# Get database URL from environment or prompt
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}📝 Enter your Supabase database URL:${NC}"
    echo "Format: postgresql://postgres:[password]@[host]:5432/postgres"
    read -r SUPABASE_DB_URL
    export SUPABASE_DB_URL
fi

echo -e "${BLUE}🔍 STEP 1: Diagnosing Foreign Key Relationships${NC}"
echo "================================================"

# Diagnostic query to find all FK relationships
DIAGNOSTIC_SQL="
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
    )
ORDER BY tc.table_name, tc.constraint_name;
"

echo "Running FK diagnostic query..."
echo "$DIAGNOSTIC_SQL" | supabase db reset --db-url "$SUPABASE_DB_URL" --sql -

echo ""
echo -e "${BLUE}🔍 STEP 2: Check Current Table Structure${NC}"
echo "========================================"

STRUCTURE_SQL="
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transaction_items' 
    AND column_name LIKE '%transaction%'
ORDER BY ordinal_position;
"

echo "Checking transaction_items table structure..."
echo "$STRUCTURE_SQL" | supabase db reset --db-url "$SUPABASE_DB_URL" --sql -

echo ""
echo -e "${BLUE}🔍 STEP 3: Test Current Relationship${NC}"
echo "==================================="

TEST_SQL="
SELECT t.id, t.created_at, ti.quantity, ti.unit_price
FROM transactions t
JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 5;
"

echo "Testing current relationship..."
echo "$TEST_SQL" | supabase db reset --db-url "$SUPABASE_DB_URL" --sql -

echo ""
echo -e "${YELLOW}📋 ANALYSIS COMPLETE${NC}"
echo "==================="
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the FK relationships shown above"
echo "2. If you see multiple FKs pointing to 'transactions', that's the problem"
echo "3. Run the fix commands below to remove duplicates:"
echo ""

echo -e "${RED}⚠️  MANUAL FIX REQUIRED:${NC}"
echo "If you found duplicate relationships, run these commands:"
echo ""
echo -e "${GREEN}# Example - adjust constraint names based on your results:${NC}"
echo "ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_trans_id;"
echo "ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_order_id;"
echo ""

echo -e "${BLUE}🔍 STEP 4: Test API Call${NC}"
echo "======================="
echo "After fixing, test this PostgREST query:"
echo ""
echo "curl -X GET '$SUPABASE_URL/rest/v1/transactions?select=*,transaction_items(quantity,unit_price)&limit=1' \\"
echo "  -H 'apikey: $SUPABASE_ANON_KEY' \\"
echo "  -H 'Authorization: Bearer $SUPABASE_ANON_KEY'"
echo ""

echo -e "${GREEN}✅ Diagnostic complete! Follow the manual steps above to fix the relationships.${NC}"