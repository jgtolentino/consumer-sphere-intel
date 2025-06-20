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

async function checkTableStructure() {
  console.log('🔍 Checking table structure...\n');

  // Test substitutions table columns
  console.log('1️⃣ Checking substitutions table...');
  try {
    const { data, error } = await supabase
      .from('substitutions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Substitutions table accessible');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
      } else {
        console.log('No data in substitutions table');
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test products table
  console.log('2️⃣ Checking products table...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Products table accessible');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  console.log('\n---\n');

  // Test transaction_items table structure
  console.log('3️⃣ Checking transaction_items table...');
  try {
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Transaction_items table accessible');
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }
}

checkTableStructure().catch(console.error);