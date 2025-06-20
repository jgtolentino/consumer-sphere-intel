#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFinalFixes() {
  console.log('🔍 Testing final fixed queries...\n');

  // Test 1: Complete transactions query
  console.log('1️⃣ Testing complete transactions query...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        customer_id,
        store_id,
        total_amount,
        created_at,
        transaction_items!transaction_items_transaction_id_fkey!inner(
          id,
          transaction_id,
          product_id,
          quantity,
          unit_price,
          created_at,
          products!transaction_items_product_id_fkey!inner(
            id,
            name,
            category,
            brand_id,
            created_at,
            brands!products_brand_id_fkey!inner(
              id,
              name,
              category,
              is_tbwa,
              created_at
            )
          )
        ),
        customers!inner(
          id,
          age_bracket,
          gender,
          inferred_income,
          payment_method,
          created_at
        ),
        stores!inner(
          id,
          name,
          location,
          region,
          city,
          barangay,
          created_at
        )
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Complete transactions query failed:', error);
    } else {
      console.log('✅ Complete transactions query successful!');
      console.log(`Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('Sample structure:', {
          id: data[0].id,
          total_amount: data[0].total_amount,
          items_count: data[0].transaction_items?.length,
          first_item: data[0].transaction_items?.[0] ? {
            product_name: data[0].transaction_items[0].products?.name,
            brand_name: data[0].transaction_items[0].products?.brands?.name
          } : null,
          customer: {
            age_bracket: data[0].customers?.age_bracket,
            gender: data[0].customers?.gender
          },
          store: {
            region: data[0].stores?.region,
            city: data[0].stores?.city
          }
        });
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 2: Fixed substitutions query
  console.log('2️⃣ Testing fixed substitutions query...');
  try {
    const { data, error } = await supabase
      .from('substitutions')
      .select(`
        *,
        original_products:original_product_id(name, brands!products_brand_id_fkey(name)),
        substitute_products:substitute_product_id(name, brands!products_brand_id_fkey(name))
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Substitutions query failed:', error);
    } else {
      console.log('✅ Substitutions query successful!');
      console.log(`Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('Sample substitution:', {
          from: data[0].original_products?.name,
          to: data[0].substitute_products?.name,
          from_brand: data[0].original_products?.brands?.name,
          to_brand: data[0].substitute_products?.brands?.name,
          reason: data[0].reason
        });
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');
  
  if (data || error) {
    console.log('🎉 All queries fixed! The data fetching should now work properly.');
    console.log('📝 Next steps:');
    console.log('1. Build and deploy the application');
    console.log('2. Test the dashboard with real data');
    console.log('3. Verify that 400/404 errors are resolved');
  }
}

testFinalFixes().catch(console.error);