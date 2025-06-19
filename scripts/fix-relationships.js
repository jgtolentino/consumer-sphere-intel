import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM0NTMyNywiZXhwIjoyMDYzOTIxMzI3fQ.42ByHcIAi1jrcpzdvfcMJyE6ibqr81d-rIjsqxL_Bbk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRelationships() {
  console.log('Testing database relationships...\n');
  
  // Test simpler query first
  const { data: trans, error: transError } = await supabase
    .from('transactions')
    .select('id, total_amount, customer_id')
    .limit(1);
    
  console.log('Transaction sample:', trans);
  
  // Test if customer exists
  if (trans && trans[0]) {
    const { data: cust, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', trans[0].customer_id)
      .single();
      
    console.log('Customer for transaction:', cust);
  }
  
  // Test transaction items
  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select(`
      id,
      quantity,
      unit_price,
      transaction_id,
      product_id
    `)
    .limit(3);
    
  console.log('\nTransaction items:', items);
  
  // Test if we can join manually
  if (items && items[0]) {
    const { data: prod, error: prodError } = await supabase
      .from('products')
      .select('*, brands(*)')
      .eq('id', items[0].product_id)
      .single();
      
    console.log('\nProduct with brand:', prod);
  }
}

testRelationships();