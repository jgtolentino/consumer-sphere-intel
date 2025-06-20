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

async function checkTransactionsStructure() {
  console.log('🔍 Checking transactions table structure...\n');

  // Check transactions table columns
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Transactions table accessible');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Check if customers table exists
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Customers table error:', error.message);
    } else {
      console.log('✅ Customers table exists');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Check if stores table exists
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Stores table error:', error.message);
    } else {
      console.log('✅ Stores table exists');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }
}

checkTransactionsStructure().catch(console.error);