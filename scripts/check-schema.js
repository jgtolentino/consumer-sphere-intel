import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM0NTMyNywiZXhwIjoyMDYzOTIxMzI3fQ.42ByHcIAi1jrcpzdvfcMJyE6ibqr81d-rIjsqxL_Bbk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking Supabase schema...\n');
  
  const tables = [
    'brands',
    'customers', 
    'transactions',
    'products',
    'stores',
    'transaction_items',
    'substitutions',
    'customer_requests',
    'request_behaviors',
    'devices',
    'device_health',
    'edge_logs',
    'product_detections'
  ];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Check for specific columns
  console.log('\nChecking critical columns...');
  
  try {
    const { data: sample } = await supabase
      .from('transaction_items')
      .select('id, unit_price, price')
      .limit(1);
      
    if (sample && sample.length > 0) {
      console.log('✅ transaction_items has unit_price column');
    }
  } catch (err) {
    console.log('❌ Error checking transaction_items columns:', err.message);
  }
}

checkSchema();