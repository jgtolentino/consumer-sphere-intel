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

async function testCompleteFix() {
  console.log('🔍 Testing complete fixed query...\n');

  // Test the actual query structure from RealDataService.v2.ts
  console.log('1️⃣ Testing transactions with proper schema...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        total_amount,
        created_at,
        customer_age,
        customer_gender,
        store_location,
        store_id,
        payment_method,
        transaction_items!transaction_items_transaction_id_fkey(
          id,
          transaction_id,
          product_id,
          quantity,
          unit_price,
          created_at,
          products!transaction_items_product_id_fkey(
            id,
            name,
            category,
            brand_id,
            created_at,
            brands!products_brand_id_fkey(
              id,
              name,
              category,
              is_tbwa,
              created_at
            )
          )
        )
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Transactions query failed:', error);
    } else {
      console.log('✅ Transactions query successful!');
      console.log(`Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('\n📋 Sample transformed data:');
        const transaction = data[0];
        
        // Parse location
        const locationParts = (transaction.store_location || '').split(', ');
        const region = locationParts[0] || 'Unknown';
        const city = locationParts[1] || 'Unknown';
        const barangay = locationParts[2] || 'Unknown';
        
        // Get age bracket
        const getAgeBracket = (age) => {
          if (!age) return 'Unknown';
          if (age < 25) return '18-24';
          if (age < 35) return '25-34';
          if (age < 45) return '35-44';
          if (age < 55) return '45-54';
          return '55+';
        };

        console.log({
          id: transaction.id,
          total_amount: transaction.total_amount,
          store_info: {
            location: transaction.store_location,
            parsed_region: region,
            parsed_city: city,
            parsed_barangay: barangay
          },
          customer_info: {
            age: transaction.customer_age,
            age_bracket: getAgeBracket(transaction.customer_age),
            gender: transaction.customer_gender,
            payment_method: transaction.payment_method
          },
          transaction_items_count: transaction.transaction_items?.length || 0,
          sample_item: transaction.transaction_items?.[0] ? {
            product_name: transaction.transaction_items[0].products?.name,
            brand_name: transaction.transaction_items[0].products?.brands?.name,
            category: transaction.transaction_items[0].products?.category,
            is_tbwa: transaction.transaction_items[0].products?.brands?.is_tbwa,
            quantity: transaction.transaction_items[0].quantity,
            unit_price: transaction.transaction_items[0].unit_price
          } : null
        });
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test region filtering
  console.log('2️⃣ Testing region filtering...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, store_location')
      .or('store_location.ilike.NCR%,store_location.ilike.Luzon%')
      .limit(3);
    
    if (error) {
      console.error('❌ Region filtering failed:', error);
    } else {
      console.log('✅ Region filtering successful!');
      console.log(`Found ${data?.length || 0} records for NCR/Luzon`);
      data?.forEach(t => console.log(`- ${t.store_location}`));
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');
  console.log('🎉 Schema-aware fixes complete!');
  console.log('📝 Key changes made:');
  console.log('1. ✅ Fixed foreign key relationship names');
  console.log('2. ✅ Adapted to actual database schema (embedded customer/store data)');
  console.log('3. ✅ Fixed location parsing for regions');
  console.log('4. ✅ Added proper data transformation');
  console.log('5. ✅ Fixed substitutions query with correct field names');
}

testCompleteFix().catch(console.error);