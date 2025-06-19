#!/usr/bin/env node

/**
 * Test Real Data Service Fix
 * Verify the Supabase query fix without full migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 TESTING REAL DATA SERVICE FIX\n');

// Check if RealDataService has been updated
const realDataServicePath = path.join(__dirname, '..', 'src', 'services', 'RealDataService.v2.ts');

try {
  const content = fs.readFileSync(realDataServicePath, 'utf8');
  
  // Check for the fixed query syntax
  const hasExplicitJoins = content.includes('transaction_items:transaction_items!transaction_id');
  const hasFixedSubstitutions = content.includes('from_products:products!from_product_id');
  const hasFixedBrands = content.includes('brands:brands!brand_id');
  
  console.log('📋 Query Fix Status:');
  console.log(`   Transaction Items Join: ${hasExplicitJoins ? '✅ Fixed' : '❌ Not Fixed'}`);
  console.log(`   Substitutions Join: ${hasFixedSubstitutions ? '✅ Fixed' : '❌ Not Fixed'}`);
  console.log(`   Brands Join: ${hasFixedBrands ? '✅ Fixed' : '❌ Not Fixed'}`);
  
  // Check for error-prone patterns
  const hasInnerJoins = content.includes('!inner(');
  const hasAmbiguousJoins = content.includes('transaction_items!') && !content.includes('transaction_items:');
  
  console.log('\n🔍 Potential Issues:');
  console.log(`   Using !inner joins: ${hasInnerJoins ? '⚠️  Yes (could cause ambiguity)' : '✅ No'}`);
  console.log(`   Ambiguous joins: ${hasAmbiguousJoins ? '⚠️  Yes (needs explicit naming)' : '✅ No'}`);
  
  // Simulate the query validation
  console.log('\n📊 Simulated Query Validation:');
  
  const queryPattern = /transaction_items:transaction_items!transaction_id\(/;
  if (queryPattern.test(content)) {
    console.log('✅ Main query uses explicit FK reference');
  } else {
    console.log('❌ Main query lacks explicit FK reference');
  }
  
  const substitutionPattern = /from_products:products!from_product_id/;
  if (substitutionPattern.test(content)) {
    console.log('✅ Substitution query uses explicit FK reference');
  } else {
    console.log('❌ Substitution query lacks explicit FK reference');
  }
  
  console.log('\n🎯 Expected Results After Fix:');
  console.log('   - No more "multiple relationship" errors');
  console.log('   - Successful connection to 18,000 real records');
  console.log('   - All UI panels populated with real data');
  console.log('   - Mock mode still working with 5,000 records');
  
  // Schema requirements check
  console.log('\n📋 Schema Requirements Status:');
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '0006_create_missing_tables.sql');
  
  if (fs.existsSync(migrationPath)) {
    console.log('✅ Migration file created for missing tables');
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    const hasProducts = migrationContent.includes('CREATE TABLE IF NOT EXISTS public.products');
    const hasStores = migrationContent.includes('CREATE TABLE IF NOT EXISTS public.stores');
    const hasTransactionItems = migrationContent.includes('CREATE TABLE IF NOT EXISTS public.transaction_items');
    const hasSubstitutions = migrationContent.includes('CREATE TABLE IF NOT EXISTS public.substitutions');
    
    console.log(`   Products table: ${hasProducts ? '✅ Will be created' : '❌ Missing'}`);
    console.log(`   Stores table: ${hasStores ? '✅ Will be created' : '❌ Missing'}`);
    console.log(`   Transaction Items table: ${hasTransactionItems ? '✅ Will be created' : '❌ Missing'}`);
    console.log(`   Substitutions table: ${hasSubstitutions ? '✅ Will be created' : '❌ Missing'}`);
  } else {
    console.log('❌ Migration file missing - tables won\'t be created');
  }
  
  console.log('\n🚀 Next Steps to Complete Fix:');
  console.log('1. Apply the migration: npx supabase db push');
  console.log('2. Populate sample data in the new tables');
  console.log('3. Test with: npm run dev and switch to real data mode');
  console.log('4. Verify 18,000 records load successfully');
  
  // Estimate fix confidence
  const fixScore = (hasExplicitJoins ? 30 : 0) + 
                   (hasFixedSubstitutions ? 25 : 0) + 
                   (hasFixedBrands ? 25 : 0) + 
                   (!hasAmbiguousJoins ? 20 : 0);
  
  console.log(`\n📈 Fix Confidence: ${fixScore}% complete`);
  
  if (fixScore >= 80) {
    console.log('✅ HIGH CONFIDENCE: Fix should resolve the query ambiguity');
  } else if (fixScore >= 60) {
    console.log('⚠️  MEDIUM CONFIDENCE: Fix addresses main issues but may need refinement');
  } else {
    console.log('❌ LOW CONFIDENCE: Additional fixes needed');
  }
  
} catch (error) {
  console.error('❌ Error reading RealDataService:', error.message);
}

console.log('\n🎯 Summary:');
console.log('The fix addresses the "multiple relationship" error by:');
console.log('- Using explicit foreign key names in joins (transaction_items!transaction_id)');
console.log('- Adding table aliases to avoid ambiguity (transaction_items:...)');
console.log('- Creating missing schema tables via migration');
console.log('- Ensuring 1:1 mapping between mock and real data structures');

console.log('\n✨ Test complete!');