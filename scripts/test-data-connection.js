import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDUzMjcsImV4cCI6MjA2MzkyMTMyN30.W2JgvZdXubvWpKCNZ7TfjLiKANZO1Hlb164fBEKH2dA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDataConnection() {
  console.log('Testing Consumer Sphere Intel data connection...\n');
  
  try {
    // Test 1: Get dashboard summary
    console.log('1. Testing dashboard summary function...');
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_dashboard_summary');
      
    if (summaryError) {
      console.log('❌ Dashboard summary error:', summaryError.message);
    } else {
      console.log('✅ Dashboard summary:', JSON.stringify(summary, null, 2));
    }
    
    // Test 2: Get recent transactions with items
    console.log('\n2. Testing transactions with items...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select(`
        id,
        total_amount,
        transaction_date,
        customer:customers!customer_id(name, barangay, city),
        transaction_items(
          quantity,
          unit_price,
          product:products!product_id(name, category, brand:brands!brand_id(name))
        )
      `)
      .order('transaction_date', { ascending: false })
      .limit(3);
      
    if (transError) {
      console.log('❌ Transactions error:', transError.message);
    } else {
      console.log('✅ Recent transactions:', JSON.stringify(transactions, null, 2));
    }
    
    // Test 3: Get brand performance
    console.log('\n3. Testing brand performance...');
    const { data: brandPerf, error: brandError } = await supabase
      .rpc('get_brand_performance');
      
    if (brandError) {
      console.log('❌ Brand performance error:', brandError.message);
    } else {
      console.log('✅ Brand performance (top 5):', JSON.stringify(brandPerf?.slice(0, 5), null, 2));
    }
    
    // Test 4: Get category mix
    console.log('\n4. Testing category mix...');
    const { data: categoryMix, error: catError } = await supabase
      .rpc('get_category_mix');
      
    if (catError) {
      console.log('❌ Category mix error:', catError.message);
    } else {
      console.log('✅ Category mix:', JSON.stringify(categoryMix, null, 2));
    }
    
    // Test 5: Check data mode from frontend perspective
    console.log('\n5. Checking data configuration...');
    console.log('VITE_DATA_MODE:', process.env.VITE_DATA_MODE || 'not set (should be "real")');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDataConnection();