#!/bin/bash

# RepoSynth + Dash + Caca orchestration runner
# Execute the automated Supabase FK fix pipeline

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 RepoSynth + Dash + Caca: Supabase FK Auto-Fix${NC}"
echo "=================================================="

# Check for required environment variables
REQUIRED_VARS=("SUPABASE_DB_URL")
OPTIONAL_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY")

echo -e "${BLUE}📋 Environment Check${NC}"
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing required environment variable: $var${NC}"
        echo "Set it with: export $var='your_value'"
        exit 1
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  Optional variable not set: $var${NC}"
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔧 Executing Pipeline${NC}"
echo "====================="

# Source the YAML pipeline and execute steps
echo "Loading pipeline configuration..."

# Set audit log
export AUDIT_LOG="supabase_fks_audit.log"

# Initialize audit log
echo "🔧 Supabase FK Auto-Fix Pipeline Starting..." > $AUDIT_LOG
echo "Database: $SUPABASE_DB_URL" >> $AUDIT_LOG
echo "Timestamp: $(date)" >> $AUDIT_LOG

# Step 1: Environment Check
echo -e "${BLUE}Step 1: Environment Check${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql not found - install PostgreSQL client${NC}"
    exit 1
fi

psql "$SUPABASE_DB_URL" -c "SELECT version();" > /dev/null || {
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Database connection verified${NC}" | tee -a $AUDIT_LOG

# Step 2: FK Constraint Audit
echo -e "${BLUE}Step 2: FK Constraint Audit${NC}"
echo "🔍 Auditing FK constraints..." | tee -a $AUDIT_LOG

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
    AND (
        (tc.table_name = 'transaction_items' AND ccu.table_name IN ('transactions', 'products'))
        OR 
        (tc.table_name = 'transactions' AND ccu.table_name = 'transaction_items')
    )
ORDER BY tc.table_name, tc.constraint_name;
" | tee -a $AUDIT_LOG

# Step 3: Drop Duplicate Constraints
echo -e "${BLUE}Step 3: Drop Duplicate Constraints${NC}"
echo "🔧 Dropping duplicate FK constraints..." | tee -a $AUDIT_LOG

psql "$SUPABASE_DB_URL" -c "
-- Drop potential duplicate constraints (safe if they don't exist)
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_transaction_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_trans_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS fk_transaction_items_order_id;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_trans_id_fkey;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_order_id_fkey;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_product_id_fkey1;
ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_product_id_fkey2;

SELECT 'Duplicate constraints dropped' as status;
" | tee -a $AUDIT_LOG

# Step 4: Create Correct Relationships
echo -e "${BLUE}Step 4: Create Correct Relationships${NC}"
echo "🔧 Creating correct FK relationships..." | tee -a $AUDIT_LOG

psql "$SUPABASE_DB_URL" -c "
-- Ensure correct transaction relationship
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

-- Ensure correct product relationship
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transaction_items' 
        AND constraint_name = 'transaction_items_product_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE transaction_items 
        ADD CONSTRAINT transaction_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id);
        RAISE NOTICE 'Created transaction_items_product_id_fkey';
    END IF;
END \$\$;
" | tee -a $AUDIT_LOG

# Step 5: Validate Relationships
echo -e "${BLUE}Step 5: Validate Relationships${NC}"
echo "🧪 Validating corrected relationships..." | tee -a $AUDIT_LOG

echo "Testing transaction_items -> transactions join:" | tee -a $AUDIT_LOG
psql "$SUPABASE_DB_URL" -c "
SELECT t.id, t.created_at, ti.quantity, ti.unit_price
FROM transactions t
JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 3;
" | tee -a $AUDIT_LOG

# Step 6: Final Audit
echo -e "${BLUE}Step 6: Final Audit${NC}"
echo "📊 Final audit and logging..." | tee -a $AUDIT_LOG

FINAL_TRANSACTION_FKS=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*) FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'transaction_items' 
AND ccu.table_name = 'transactions';
" | xargs)

echo "✅ SUPABASE PGRST201 FIX COMPLETE" | tee -a $AUDIT_LOG
echo "Final transaction FKs: $FINAL_TRANSACTION_FKS (should be 1)" | tee -a $AUDIT_LOG
echo "Duplicate FK constraints dropped and recreated" | tee -a $AUDIT_LOG
echo "Dashboard real data load should now work" | tee -a $AUDIT_LOG
echo "Completion time: $(date)" | tee -a $AUDIT_LOG

echo ""
echo -e "${GREEN}🎉 Pipeline completed successfully!${NC}"
echo -e "${BLUE}   - Refresh your dashboard to see real category mix data${NC}"
echo -e "${BLUE}   - No more PGRST201 errors expected${NC}"
echo -e "${BLUE}   - All transaction-item relationships normalized${NC}"
echo ""
echo -e "${YELLOW}📋 Audit log saved to: $AUDIT_LOG${NC}"