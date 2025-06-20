#!/usr/bin/env node

/**
 * Schema Drift Detection Script
 * Validates that mock and real data services maintain identical schemas
 * 
 * Usage: npm run check-schema-drift
 * Exit Code: 0 = no drift, 1 = drift detected
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 SCHEMA DRIFT DETECTION STARTED');
console.log('=====================================');

// Run schema drift tests
try {
  console.log('📋 Running schema validation tests...');
  execSync('npm test -- src/__tests__/schemaDrift.test.ts --run', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Schema validation tests passed');
} catch (error) {
  console.error('❌ Schema validation tests failed');
  console.error('Schema drift detected! This is a CRITICAL BUG.');
  process.exit(1);
}

// Check if schema files exist
const schemaPath = path.join(process.cwd(), 'src/schema/index.ts');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Canonical schema file missing: src/schema/index.ts');
  process.exit(1);
}

// Validate service files use v2 versions
const mockServicePath = path.join(process.cwd(), 'src/services/MockDataService.v2.ts');
const realServicePath = path.join(process.cwd(), 'src/services/RealDataService.v2.ts');

if (!fs.existsSync(mockServicePath)) {
  console.error('❌ Schema-compliant MockDataService.v2.ts missing');
  process.exit(1);
}

if (!fs.existsSync(realServicePath)) {
  console.error('❌ Schema-compliant RealDataService.v2.ts missing');
  process.exit(1);
}

// Check that DataProvider imports v2 services
const dataProviderPath = path.join(process.cwd(), 'src/providers/DataProvider.tsx');
const dataProviderContent = fs.readFileSync(dataProviderPath, 'utf8');

if (!dataProviderContent.includes('MockDataServiceV2') || !dataProviderContent.includes('RealDataServiceV2')) {
  console.error('❌ DataProvider not using schema-compliant v2 services');
  console.error('Must import MockDataServiceV2 and RealDataServiceV2');
  process.exit(1);
}

// Validate TypeScript compilation with strict checks
try {
  console.log('🔨 Running TypeScript strict compilation check...');
  execSync('npx tsc --noEmit --strict', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ TypeScript compilation passed');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  console.error('Schema type mismatches detected');
  process.exit(1);
}

// Generate schema drift report
const report = {
  timestamp: new Date().toISOString(),
  status: 'NO_DRIFT_DETECTED',
  schema_version: '1.0',
  services_validated: [
    'MockDataServiceV2',
    'RealDataServiceV2'
  ],
  tests_passed: [
    'Schema structure validation',
    'Data type validation', 
    'Relational integrity validation',
    'Business rule validation',
    'Filter consistency validation',
    'Runtime contract validation'
  ],
  critical_files: [
    'src/schema/index.ts',
    'src/services/MockDataService.v2.ts',
    'src/services/RealDataService.v2.ts',
    'src/providers/DataProvider.tsx'
  ]
};

const reportPath = path.join(process.cwd(), 'schema-drift-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('');
console.log('🎯 SCHEMA DRIFT DETECTION COMPLETED');
console.log('===================================');
console.log('✅ Status: NO DRIFT DETECTED');
console.log('📊 Report saved to: schema-drift-report.json');
console.log('');
console.log('🔒 Schema Policy Enforced:');
console.log('  • Mock and real data services use identical schemas');
console.log('  • All data types match canonical definitions');
console.log('  • Relational integrity maintained');
console.log('  • Business rules validated');
console.log('  • Filter behavior is consistent');
console.log('');
console.log('⚠️  REMEMBER: Any schema changes require updates to BOTH services');

process.exit(0);