#!/bin/bash

# Test Supabase API relationships and data access

set -e

# API credentials
API_URL="https://lcoxtanyckjzyxxcsjzz.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDUzMjcsImV4cCI6MjA2MzkyMTMyN30.W2JgvZdXubvWpKCNZ7TfjLiKANZO1Hlb164fBEKH2dA"

echo "🔍 Testing Supabase API Relationships"
echo "===================================="

# Test basic table access
echo "1. Testing basic tables..."

echo "Brands:"
curl -s -X GET "$API_URL/rest/v1/brands?limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq -r '.[] | "\(.id): \(.name) (\(.category))"' || echo "No brands found"

echo ""
echo "Products:"
curl -s -X GET "$API_URL/rest/v1/products?limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq -r '.[] | "\(.id): \(.name)"' || echo "No products found"

echo ""
echo "Transactions:"
curl -s -X GET "$API_URL/rest/v1/transactions?limit=3" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq -r '.[] | "\(.id): ₱\(.total_amount) (\(.store_location // "No location"))"' || echo "No transactions found"

echo ""
echo "2. Testing the PGRST201 relationship issue..."

# This is the query that was failing with PGRST201
echo "Testing transaction_items embedding (this was failing with PGRST201):"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X GET "$API_URL/rest/v1/transactions?select=*,transaction_items(quantity,unit_price)&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Transaction items embedding works!"
    echo "Response: $RESPONSE_BODY" | jq '.'
else
    echo "❌ PGRST201 error still exists:"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "3. Testing category mix data..."

# Test the category mix query our dashboard needs
echo "Testing category mix via products and transaction_items:"
CATEGORY_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X GET "$API_URL/rest/v1/products?select=category&limit=10" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

CATEGORY_HTTP_STATUS=$(echo $CATEGORY_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
CATEGORY_RESPONSE_BODY=$(echo $CATEGORY_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "Category HTTP Status: $CATEGORY_HTTP_STATUS"
if [ "$CATEGORY_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Categories accessible:"
    echo "$CATEGORY_RESPONSE_BODY" | jq -r '.[].category' | sort | uniq || echo "No category data"
else
    echo "❌ Category access failed: $CATEGORY_RESPONSE_BODY"
fi

echo ""
echo "4. Testing substitution patterns..."

echo "Substitutions data:"
curl -s -X GET "$API_URL/rest/v1/substitutions?limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq -r '.[] | "ID \(.id): Product \(.original_product_id) → \(.substitute_product_id) (\(.reason))"' || echo "No substitutions found"

echo ""
echo "5. Summary and recommendations..."

# Count records in key tables
echo "Record counts:"
BRANDS_COUNT=$(curl -s -X GET "$API_URL/rest/v1/brands?select=count" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" -H "Prefer: count=exact" | jq -r '.[] | .count // 0' 2>/dev/null || echo "0")
PRODUCTS_COUNT=$(curl -s -X GET "$API_URL/rest/v1/products?select=count" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" -H "Prefer: count=exact" | jq -r '.[] | .count // 0' 2>/dev/null || echo "0")
TRANSACTIONS_COUNT=$(curl -s -X GET "$API_URL/rest/v1/transactions?select=count" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" -H "Prefer: count=exact" | jq -r '.[] | .count // 0' 2>/dev/null || echo "0")

echo "- Brands: $BRANDS_COUNT"
echo "- Products: $PRODUCTS_COUNT" 
echo "- Transactions: $TRANSACTIONS_COUNT"

echo ""
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "🎉 Good news: The PGRST201 relationship issue appears to be resolved!"
    echo "   Your dashboard should now load real data."
else
    echo "⚠️  The PGRST201 relationship issue still exists."
    echo "   You may need to check FK constraints in Supabase dashboard."
fi

echo ""
echo "Next steps:"
echo "1. If PGRST201 is fixed: Refresh your dashboard to see real data"
echo "2. If PGRST201 persists: Check foreign key constraints in Supabase dashboard"
echo "3. Add TBWA brand data if brands table is empty"