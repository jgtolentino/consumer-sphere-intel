#!/bin/bash

# Test different connection methods to Supabase

set -e

echo "🔍 Testing Supabase Connection Methods"
echo "===================================="

# Project details
PROJECT_ID="lcoxtanyckjzyxxcsjzz"
HOST="db.lcoxtanyckjzyxxcsjzz.supabase.co"
PASSWORD="R@nd0mPA$$2025!"

echo "Project ID: $PROJECT_ID"
echo "Host: $HOST"
echo ""

# Method 1: URL-encoded password
echo "Method 1: URL-encoded password"
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('R@nd0mPA$$2025!'))")
echo "Encoded password: $ENCODED_PASSWORD"

DB_URL_1="postgresql://postgres:$ENCODED_PASSWORD@$HOST:5432/postgres"
echo "Testing connection 1..."
if timeout 10 psql "$DB_URL_1" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection 1 successful"
    export WORKING_DB_URL="$DB_URL_1"
else
    echo "❌ Connection 1 failed"
fi

# Method 2: Without special chars encoding
echo ""
echo "Method 2: Direct password (with quotes)"
DB_URL_2="postgresql://postgres:'R@nd0mPA$$2025!'@$HOST:5432/postgres"
echo "Testing connection 2..."
if timeout 10 psql "$DB_URL_2" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection 2 successful"
    export WORKING_DB_URL="$DB_URL_2"
else
    echo "❌ Connection 2 failed"
fi

# Method 3: Using PGPASSWORD environment variable
echo ""
echo "Method 3: Using PGPASSWORD"
export PGPASSWORD="R@nd0mPA$$2025!"
DB_URL_3="postgresql://postgres@$HOST:5432/postgres"
echo "Testing connection 3..."
if timeout 10 psql "$DB_URL_3" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection 3 successful"
    export WORKING_DB_URL="$DB_URL_3"
else
    echo "❌ Connection 3 failed"
fi

# Method 4: Test API endpoint instead
echo ""
echo "Method 4: Testing REST API"
API_URL="https://$PROJECT_ID.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDUzMjcsImV4cCI6MjA2MzkyMTMyN30.W2JgvZdXubvWpKCNZ7TfjLiKANZO1Hlb164fBEKH2dA"

echo "Testing API endpoint: $API_URL/rest/v1/"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X GET "$API_URL/rest/v1/" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
    echo "✅ API endpoint accessible"
    echo "Response: $RESPONSE_BODY"
    
    # Test specific table access
    echo ""
    echo "Testing transactions table access..."
    TABLE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
      -X GET "$API_URL/rest/v1/transactions?limit=1" \
      -H "apikey: $ANON_KEY" \
      -H "Authorization: Bearer $ANON_KEY")
    
    TABLE_HTTP_STATUS=$(echo $TABLE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    TABLE_RESPONSE_BODY=$(echo $TABLE_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "Table HTTP Status: $TABLE_HTTP_STATUS"
    echo "Table Response: $TABLE_RESPONSE_BODY"
    
    if [ "$TABLE_HTTP_STATUS" -eq 200 ]; then
        echo "✅ Transactions table accessible via API"
    else
        echo "❌ Transactions table not accessible: $TABLE_RESPONSE_BODY"
    fi
else
    echo "❌ API endpoint failed: $RESPONSE_BODY"
fi

echo ""
if [ -n "$WORKING_DB_URL" ]; then
    echo "✅ Found working database connection!"
    echo "Working URL: $WORKING_DB_URL"
    echo ""
    echo "Testing FK relationships..."
    psql "$WORKING_DB_URL" -c "
    SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'transaction_items'
    LIMIT 5;
    "
else
    echo "❌ No working database connection found"
    echo "The Supabase database may not be accessible with the provided credentials"
    echo ""
    echo "Possible issues:"
    echo "1. Password might be incorrect"
    echo "2. Database might not exist yet"
    echo "3. SSL/connection settings might be wrong"
    echo "4. Need to deploy schema first"
fi