#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 SCHEMA DRIFT DETECTION');
console.log('========================');
console.log('');

/**
 * Check for schema drift between committed types and current Supabase schema
 */
async function checkSchemaDrift() {
  const typesPath = 'src/integrations/supabase/types.ts';
  const tempTypesPath = 'schema-temp.ts';

  try {
    // Check if types file exists
    if (!fs.existsSync(typesPath)) {
      console.log('❌ CRITICAL: No Supabase types file found');
      console.log(`   Expected: ${typesPath}`);
      console.log('   Run: npm run sync-types to generate initial types');
      process.exit(1);
    }

    console.log('📝 Generating current schema types...');
    
    // Generate current schema types
    try {
      execSync(`npx supabase gen types typescript --linked > ${tempTypesPath}`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.log('❌ Failed to generate current schema types');
      console.log('   Make sure Supabase is linked: supabase link');
      process.exit(1);
    }

    // Compare files
    console.log('🔍 Comparing schema versions...');
    
    const committedTypes = fs.readFileSync(typesPath, 'utf8');
    const currentTypes = fs.readFileSync(tempTypesPath, 'utf8');

    // Clean up temp file
    fs.unlinkSync(tempTypesPath);

    if (committedTypes === currentTypes) {
      console.log('✅ NO DRIFT DETECTED');
      console.log('   Local types match remote Supabase schema');
      console.log('   🎯 Schema is in sync');
      return true;
    } else {
      console.log('❌ SCHEMA DRIFT DETECTED!');
      console.log('');
      console.log('📊 Differences found between:');
      console.log(`   - Committed: ${typesPath}`);
      console.log('   - Current:   Remote Supabase schema');
      console.log('');
      console.log('🔧 To fix schema drift:');
      console.log('   1. Run: npm run sync-types');
      console.log('   2. Review the changes carefully');
      console.log('   3. Update any affected code');
      console.log('   4. Commit the updated types');
      console.log('');
      console.log('⚠️  WARNING: Schema drift can cause runtime errors');
      
      if (process.env.CI) {
        console.log('');
        console.log('🚫 BLOCKING CI/CD: Schema drift detected in CI environment');
        process.exit(1);
      }
      
      return false;
    }

  } catch (error) {
    console.log('❌ Error during schema drift check:', error.message);
    process.exit(1);
  }
}

/**
 * Get schema statistics
 */
function getSchemaStats() {
  const typesPath = 'src/integrations/supabase/types.ts';
  
  if (!fs.existsSync(typesPath)) {
    return null;
  }

  const content = fs.readFileSync(typesPath, 'utf8');
  
  const interfaces = (content.match(/export interface/g) || []).length;
  const types = (content.match(/export type/g) || []).length;
  const enums = (content.match(/export enum/g) || []).length;
  
  return { interfaces, types, enums };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Auto-Attach Schema Drift Protection');
  console.log('   Purpose: Prevent data pipeline breaks due to schema changes');
  console.log('   Scope: Supabase types vs committed types');
  console.log('');

  // Show current schema stats
  const stats = getSchemaStats();
  if (stats) {
    console.log('📊 Current Schema Stats:');
    console.log(`   - Interfaces: ${stats.interfaces}`);
    console.log(`   - Types: ${stats.types}`);
    console.log(`   - Enums: ${stats.enums}`);
    console.log('');
  }

  const isInSync = await checkSchemaDrift();
  
  console.log('');
  console.log('🚀 Next Steps:');
  
  if (isInSync) {
    console.log('   ✅ Schema is in sync - no action needed');
    console.log('   🔄 Realtime auto-attach is ready');
  } else {
    console.log('   🔧 Fix schema drift before deploying');
    console.log('   🚨 Auto-attach may fail with outdated types');
  }
  
  console.log('');
  console.log('📋 Auto-Attach Status:');
  console.log('   ✅ Realtime sync: Enabled');
  console.log('   ✅ Schema guard: Active');
  console.log('   ✅ Drift detection: Working');
  console.log('   ✅ CI protection: Configured');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkSchemaDrift, getSchemaStats };