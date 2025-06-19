import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM0NTMyNywiZXhwIjoyMDYzOTIxMzI3fQ.42ByHcIAi1jrcpzdvfcMJyE6ibqr81d-rIjsqxL_Bbk';
const supabase = createClient(supabaseUrl, serviceKey);

async function inspectSchema() {
  console.log('🔍 INSPECTING ACTUAL DATABASE SCHEMA...\n');
  
  // Check transactions table structure
  const { data: transSample, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);
    
  if (transSample && transSample[0]) {
    console.log('Transactions table columns:');
    console.log(Object.keys(transSample[0]).sort());
  }
  
  // Check customers table structure
  const { data: custSample } = await supabase
    .from('customers')
    .select('*')
    .limit(1);
    
  if (custSample && custSample[0]) {
    console.log('\nCustomers table columns:');
    console.log(Object.keys(custSample[0]).sort());
  }
  
  // Check transaction_items table structure
  const { data: itemsSample } = await supabase
    .from('transaction_items')
    .select('*')
    .limit(1);
    
  if (itemsSample && itemsSample[0]) {
    console.log('\nTransaction_items table columns:');
    console.log(Object.keys(itemsSample[0]).sort());
  }
  
  // Check brands table structure and duplicates
  const { data: brandsData } = await supabase
    .from('brands')
    .select('name')
    .eq('name', 'JTI');
    
  console.log('\nBrands named "JTI":', brandsData?.length || 0);
  
  // Check for any brands with similar names
  const { data: allBrands } = await supabase
    .from('brands')
    .select('id, name')
    .order('name');
    
  if (allBrands) {
    console.log('\nAll brands (first 10):');
    allBrands.slice(0, 10).forEach(brand => console.log(`${brand.id}: ${brand.name}`));
  }
}

inspectSchema();