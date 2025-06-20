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

async function discoverRelationships() {
  console.log('🔍 Discovering foreign key relationships...\n');

  // Test 1: Try without specifying relationship for transaction_items
  console.log('1️⃣ Testing transaction_items relationships...');
  try {
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*, products(*)')
      .limit(1);
    
    if (error && error.details) {
      console.log('Available relationships:', JSON.stringify(error.details, null, 2));
    } else if (data) {
      console.log('✅ Default relationship works');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  console.log('\n---\n');

  // Test 2: Try substitutions without specifying relationship
  console.log('2️⃣ Testing substitutions to products relationships...');
  try {
    // First try original_product_id
    const { data: d1, error: e1 } = await supabase
      .from('substitutions')
      .select('*, original_product:original_product_id(*)')
      .limit(1);
    
    if (e1) {
      console.log('original_product_id error:', e1.message);
    } else {
      console.log('✅ original_product_id works');
    }

    // Then try substitute_product_id
    const { data: d2, error: e2 } = await supabase
      .from('substitutions')
      .select('*, substitute_product:substitute_product_id(*)')
      .limit(1);
    
    if (e2) {
      console.log('substitute_product_id error:', e2.message);
    } else {
      console.log('✅ substitute_product_id works');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  console.log('\n---\n');

  // Test 3: Try simpler queries first
  console.log('3️⃣ Testing simple relationships...');
  try {
    // Test products to brands
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(*)')
      .limit(1);
    
    if (error) {
      console.log('Products->Brands error:', error);
    } else {
      console.log('✅ Products->Brands works');
      if (data && data.length > 0) {
        console.log('Sample:', { 
          product: data[0].name, 
          brand: data[0].brands?.name 
        });
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }

  console.log('\n---\n');

  // Test 4: Try the full transaction query step by step
  console.log('4️⃣ Building transaction query step by step...');
  
  // Step 1: Just transactions
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, total_amount')
      .limit(1);
    
    if (error) {
      console.log('❌ Basic transactions failed:', error);
    } else {
      console.log('✅ Basic transactions work');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  // Step 2: Add transaction_items
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, total_amount, transaction_items(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ With transaction_items failed:', error);
    } else {
      console.log('✅ With transaction_items works');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  // Step 3: Add products to transaction_items
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, total_amount, transaction_items(*, products(*))')
      .limit(1);
    
    if (error) {
      console.log('❌ With nested products failed:', error);
    } else {
      console.log('✅ With nested products works');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  // Step 4: Add brands to products
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, total_amount, transaction_items(*, products(*, brands(*)))')
      .limit(1);
    
    if (error) {
      console.log('❌ With nested brands failed:', error);
    } else {
      console.log('✅ Full nested query works');
      if (data && data.length > 0) {
        console.log('Sample structure:', JSON.stringify(data[0], null, 2).substring(0, 300) + '...');
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

discoverRelationships().catch(console.error);