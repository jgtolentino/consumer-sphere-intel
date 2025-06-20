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

async function testFixedQueries() {
  console.log('🔍 Testing fixed queries...\n');

  // Test 1: Fixed transactions query
  console.log('1️⃣ Testing fixed transactions query...');
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
          products!inner(
            id,
            name,
            category,
            brand_id,
            created_at,
            brands!inner(
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
      console.error('❌ Fixed transactions query failed:', error);
    } else {
      console.log('✅ Fixed transactions query successful');
      console.log(`Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('Sample structure:', JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 2: Test substitutions query
  console.log('2️⃣ Testing substitutions query...');
  try {
    const { data, error } = await supabase
      .from('substitutions')
      .select(`
        *,
        from_products:products!from_product_id(name, brands(name)),
        to_products:products!to_product_id(name, brands(name))
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Substitutions query failed:', error);
      if (error.details) {
        console.log('Available relationships:', JSON.stringify(error.details, null, 2));
      }
    } else {
      console.log('✅ Substitutions query successful');
      console.log(`Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('Sample data:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');
  console.log('✅ Test complete!');
}

testFixedQueries().catch(console.error);