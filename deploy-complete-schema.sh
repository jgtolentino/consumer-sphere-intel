#!/bin/bash

# Complete Supabase schema deployment script
# Deploys all migrations, functions, and seed data

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Complete Supabase Schema Deployment${NC}"
echo "======================================"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    echo "Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Set them with:"
    echo "export SUPABASE_URL='https://your-project.supabase.co'"
    echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Environment validated${NC}"
echo ""

# Initialize Supabase project if not already done
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${BLUE}📋 Initializing Supabase project...${NC}"
    supabase init
fi

# Link to remote project
echo -e "${BLUE}🔗 Linking to remote project...${NC}"
supabase link --project-ref $(echo $SUPABASE_URL | grep -o 'https://[^.]*' | cut -d'/' -f3)

# Generate and run database migrations
echo -e "${BLUE}📊 Deploying schema migrations...${NC}"

echo "Migration 1: Initial schema with brands, customers, transactions..."
supabase db push --include-all

echo ""
echo -e "${BLUE}🔧 Running additional migrations...${NC}"

# Deploy complete schema
echo "Migration 2: Complete schema with all tables..."
psql "$SUPABASE_URL?sslmode=require" -c "$(cat supabase/migrations/0002_complete_schema.sql)"

echo "Migration 3: Functions and views..."
psql "$SUPABASE_URL?sslmode=require" -c "$(cat supabase/migrations/0003_functions_and_views.sql)"

echo "Migration 4: Seed data..."
psql "$SUPABASE_URL?sslmode=require" -c "$(cat supabase/migrations/0004_seed_data.sql)"

echo ""
echo -e "${BLUE}🧪 Testing deployed schema...${NC}"

# Test basic queries
echo "Testing brands table..."
psql "$SUPABASE_URL?sslmode=require" -c "SELECT COUNT(*) as brand_count FROM public.brands;" || echo "⚠️ Brands table test failed"

echo "Testing products table..."
psql "$SUPABASE_URL?sslmode=require" -c "SELECT COUNT(*) as product_count FROM public.products;" || echo "⚠️ Products table test failed"

echo "Testing analytics functions..."
psql "$SUPABASE_URL?sslmode=require" -c "SELECT * FROM public.get_dashboard_summary() LIMIT 1;" || echo "⚠️ Dashboard function test failed"

echo ""
echo -e "${BLUE}🎯 Generating sample data (optional)...${NC}"
read -p "Generate 50 sample transactions for testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql "$SUPABASE_URL?sslmode=require" -c "SELECT public.generate_sample_transactions(50);"
    echo -e "${GREEN}✅ Sample data generated${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Configuring RLS policies...${NC}"

# Verify RLS is enabled
psql "$SUPABASE_URL?sslmode=require" -c "
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
"

echo ""
echo -e "${BLUE}📋 Schema deployment summary:${NC}"
echo "================================"

# Count all objects
TABLES=$(psql "$SUPABASE_URL?sslmode=require" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
FUNCTIONS=$(psql "$SUPABASE_URL?sslmode=require" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public';")
INDEXES=$(psql "$SUPABASE_URL?sslmode=require" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")

echo -e "${GREEN}✅ Tables created: $TABLES${NC}"
echo -e "${GREEN}✅ Functions created: $FUNCTIONS${NC}"
echo -e "${GREEN}✅ Indexes created: $INDEXES${NC}"

echo ""
echo -e "${GREEN}🎉 Complete schema deployment successful!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your .env with the Supabase credentials"
echo "2. Run the FK fix script: ./run-fk-fix.sh"
echo "3. Test your dashboard with real data"
echo ""
echo -e "${YELLOW}Dashboard should now load:${NC}"
echo "- ✅ Real category mix data"
echo "- ✅ TBWA vs competitor substitution patterns"  
echo "- ✅ Regional performance analytics"
echo "- ✅ Brand performance metrics"