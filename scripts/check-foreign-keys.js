import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM0NTMyNywiZXhwIjoyMDYzOTIxMzI3fQ.42ByHcIAi1jrcpzdvfcMJyE6ibqr81d-rIjsqxL_Bbk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking data integrity...\n');
  
  // Check transactions
  const { data: transCount, error: transCountError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });
  console.log('Total transactions:', transCount);
  
  // Get a sample transaction with simple select
  const { data: sampleTrans, error: sampleError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);
  console.log('\nSample transaction:', sampleTrans?.[0]);
  
  // Check if customer exists for that transaction
  if (sampleTrans?.[0]?.customer_id) {
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', sampleTrans[0].customer_id);
    console.log('\nCustomer exists:', customer?.length > 0 ? 'Yes' : 'No');
  }
  
  // Try the proper join syntax for Supabase
  const { data: joinTest, error: joinError } = await supabase
    .from('transactions')
    .select(`
      id,
      total_amount,
      customers:customer_id (
        id,
        name,
        barangay
      )
    `)
    .limit(1);
    
  console.log('\nJoin test result:', joinTest);
  console.log('Join error:', joinError?.message || 'None');
}

checkData();