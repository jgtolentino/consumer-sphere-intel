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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('\n---\n');

  // Test 1: Basic connection test
  console.log('1️⃣ Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Basic connection failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      console.log('✅ Basic connection successful');
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 2: Test transactions table access
  console.log('2️⃣ Testing transactions table access...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, created_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Transactions access failed:', error);
      if (error.code === '42P01') {
        console.error('→ Table does not exist');
      } else if (error.code === '42501') {
        console.error('→ Permission denied (check RLS policies)');
      }
    } else {
      console.log('✅ Transactions access successful');
      console.log(`Found ${data?.length || 0} records`);
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 3: Test substitutions table access
  console.log('3️⃣ Testing substitutions table access...');
  try {
    const { data, error } = await supabase
      .from('substitutions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Substitutions access failed:', error);
      if (error.code === '42P01') {
        console.error('→ Table does not exist');
      } else if (error.code === '42501') {
        console.error('→ Permission denied (check RLS policies)');
      }
    } else {
      console.log('✅ Substitutions access successful');
      console.log(`Found ${data?.length || 0} records`);
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 4: Test complex join query
  console.log('4️⃣ Testing complex join query...');
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        total_amount,
        transaction_items!inner(
          quantity,
          unit_price,
          products!inner(
            name,
            category,
            brands!inner(name)
          )
        )
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Complex join failed:', error);
      console.error('→ This might indicate missing foreign key relationships or table permissions');
    } else {
      console.log('✅ Complex join successful');
      if (data && data.length > 0) {
        console.log('Sample data structure:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test 5: Check RLS status
  console.log('5️⃣ Checking RLS (Row Level Security) status...');
  try {
    // This is a workaround to check if RLS is enabled
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (!authData.session && transData) {
      console.log('⚠️  RLS might be disabled (anonymous access allowed)');
    } else if (!authData.session && transError?.code === '42501') {
      console.log('✅ RLS is enabled (anonymous access blocked)');
      console.log('→ You may need to authenticate or adjust RLS policies');
    } else {
      console.log('ℹ️  RLS status unclear, might need manual verification');
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');
  console.log('📊 Diagnosis complete!\n');
  
  console.log('🔧 Common fixes:');
  console.log('1. If tables don\'t exist: Run migration scripts');
  console.log('2. If permission denied: Check RLS policies in Supabase dashboard');
  console.log('3. If 400/404 errors: Verify table names and column names match');
  console.log('4. If joins fail: Check foreign key constraints');
}

testConnection().catch(console.error);