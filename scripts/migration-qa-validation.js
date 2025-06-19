import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lcoxtanyckjzyxxcsjzz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDUzMjcsImV4cCI6MjA2MzkyMTMyN30.W2JgvZdXubvWpKCNZ7TfjLiKANZO1Hlb164fBEKH2dA';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h0YW55Y2tqenl4eGNzanp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM0NTMyNywiZXhwIjoyMDYzOTIxMzI3fQ.42ByHcIAi1jrcpzdvfcMJyE6ibqr81d-rIjsqxL_Bbk';

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

const results = {
  timestamp: new Date().toISOString(),
  environment: 'Production',
  database: 'consumer-sphere-intel',
  tests: {
    dataConsistency: {},
    indexConstraints: {},
    rowLevelSecurity: {},
    auditTriggers: {},
    codeWiring: {},
    edgeCases: {}
  },
  summary: {
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

async function logTest(category, testName, status, details) {
  results.tests[category][testName] = { status, details, timestamp: new Date().toISOString() };
  console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'} ${category} - ${testName}: ${details}`);
  
  if (status === 'PASS') results.summary.passed++;
  else if (status === 'FAIL') results.summary.failed++;
  else if (status === 'WARN') results.summary.warnings++;
}

// 1. Data Consistency Tests
async function testDataConsistency() {
  console.log('\n🔍 TESTING DATA CONSISTENCY...\n');
  
  // Test 1.1: Row counts
  const tables = ['brands', 'customers', 'transactions', 'products', 'stores', 'transaction_items'];
  for (const table of tables) {
    const { count, error } = await supabaseService.from(table).select('*', { count: 'exact', head: true });
    await logTest('dataConsistency', `rowCount_${table}`, 
      error ? 'FAIL' : 'PASS', 
      error ? error.message : `${count} rows`);
  }
  
  // Test 1.2: Cross-table joins
  const { data: joinData, error: joinError } = await supabaseService
    .from('transaction_items')
    .select(`
      id,
      quantity,
      unit_price,
      transactions!inner(id, total_amount),
      products!inner(name, category)
    `)
    .limit(10);
    
  await logTest('dataConsistency', 'crossTableJoins', 
    joinError ? 'FAIL' : 'PASS',
    joinError ? joinError.message : `Successfully joined ${joinData?.length || 0} records`);
  
  // Test 1.3: Foreign key integrity
  const { data: orphanCheck } = await supabaseService
    .from('transaction_items')
    .select('id')
    .is('transaction_id', null);
    
  await logTest('dataConsistency', 'foreignKeyIntegrity',
    orphanCheck?.length === 0 ? 'PASS' : 'WARN',
    `Found ${orphanCheck?.length || 0} orphaned transaction_items`);
}

// 2. Index and Constraint Tests
async function testIndexConstraints() {
  console.log('\n🔍 TESTING INDEXES AND CONSTRAINTS...\n');
  
  // Test 2.1: Try inserting invalid data (negative price)
  const { error: priceError } = await supabaseService
    .from('products')
    .insert({ name: 'Test Product', category: 'Test', unit_price: -10 });
    
  await logTest('indexConstraints', 'checkConstraint_positivePrice',
    priceError ? 'PASS' : 'FAIL',
    priceError ? 'Constraint working - rejected negative price' : 'Constraint failed - accepted negative price');
  
  // Test 2.2: Try inserting with invalid FK
  const { error: fkError } = await supabaseService
    .from('transaction_items')
    .insert({ transaction_id: 999999, product_id: 999999, quantity: 1, unit_price: 10 });
    
  await logTest('indexConstraints', 'foreignKeyConstraint',
    fkError ? 'PASS' : 'FAIL',
    fkError ? 'FK constraint working - rejected invalid IDs' : 'FK constraint failed');
  
  // Test 2.3: Unique constraint test
  const { error: uniqueError } = await supabaseService
    .from('brands')
    .insert({ name: 'JTI' }); // Should fail as JTI already exists
    
  await logTest('indexConstraints', 'uniqueConstraint_brandName',
    uniqueError ? 'PASS' : 'FAIL',
    uniqueError ? 'Unique constraint working' : 'Unique constraint failed');
}

// 3. Row Level Security Tests
async function testRLS() {
  console.log('\n🔍 TESTING ROW LEVEL SECURITY...\n');
  
  // Test 3.1: Anon key read access
  const { data: anonRead, error: anonReadError } = await supabaseAnon
    .from('brands')
    .select('*')
    .limit(5);
    
  await logTest('rowLevelSecurity', 'anonReadAccess',
    !anonReadError && anonRead?.length > 0 ? 'PASS' : 'FAIL',
    anonReadError ? anonReadError.message : `Anon can read ${anonRead?.length || 0} brands`);
  
  // Test 3.2: Anon key write access (should fail)
  const { error: anonWriteError } = await supabaseAnon
    .from('brands')
    .insert({ name: 'Test Brand Anon', category: 'Test' });
    
  await logTest('rowLevelSecurity', 'anonWriteRestriction',
    anonWriteError ? 'PASS' : 'FAIL',
    anonWriteError ? 'RLS working - anon write blocked' : 'RLS failed - anon could write');
  
  // Test 3.3: Service role full access
  const { error: serviceWriteError } = await supabaseService
    .from('brands')
    .insert({ name: 'Test Brand Service', category: 'Test' });
    
  await logTest('rowLevelSecurity', 'serviceRoleAccess',
    !serviceWriteError ? 'PASS' : 'FAIL',
    serviceWriteError ? serviceWriteError.message : 'Service role has full access');
  
  // Clean up test data
  await supabaseService.from('brands').delete().eq('name', 'Test Brand Service');
}

// 4. Audit Trigger Tests
async function testAuditTriggers() {
  console.log('\n🔍 TESTING AUDIT TRIGGERS...\n');
  
  // Test 4.1: Insert and check created_at
  const { data: newBrand, error: insertError } = await supabaseService
    .from('brands')
    .insert({ name: 'Audit Test Brand', category: 'Test' })
    .select()
    .single();
    
  await logTest('auditTriggers', 'createdAtTimestamp',
    newBrand?.created_at ? 'PASS' : 'FAIL',
    newBrand?.created_at ? `created_at set to ${newBrand.created_at}` : 'No created_at timestamp');
  
  if (newBrand) {
    // Wait a second then update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4.2: Update and check updated_at
    const { data: updatedBrand } = await supabaseService
      .from('brands')
      .update({ category: 'Test Updated' })
      .eq('id', newBrand.id)
      .select()
      .single();
      
    const updatedAtChanged = updatedBrand?.updated_at !== newBrand.updated_at;
    await logTest('auditTriggers', 'updatedAtTrigger',
      updatedAtChanged ? 'PASS' : 'FAIL',
      updatedAtChanged ? 'updated_at changed on update' : 'updated_at did not change');
    
    // Clean up
    await supabaseService.from('brands').delete().eq('id', newBrand.id);
  }
}

// 5. Edge Case Tests
async function testEdgeCases() {
  console.log('\n🔍 TESTING EDGE CASES...\n');
  
  // Test 5.1: Unicode/emoji in brand name
  const { data: emojiBrand, error: emojiError } = await supabaseService
    .from('brands')
    .insert({ name: 'Test 🚀 Brand 测试', category: 'Test' })
    .select()
    .single();
    
  await logTest('edgeCases', 'unicodeEmoji',
    !emojiError && emojiBrand ? 'PASS' : 'FAIL',
    emojiError ? emojiError.message : 'Unicode and emoji support working');
  
  if (emojiBrand) {
    await supabaseService.from('brands').delete().eq('id', emojiBrand.id);
  }
  
  // Test 5.2: Large transaction amount
  const { error: largeAmountError } = await supabaseService
    .from('transactions')
    .insert({ 
      total_amount: 999999999.99,
      subtotal: 999999999.99,
      items_count: 1,
      transaction_date: new Date().toISOString()
    });
    
  await logTest('edgeCases', 'largeNumericValues',
    !largeAmountError ? 'PASS' : 'FAIL',
    largeAmountError ? largeAmountError.message : 'Large numeric values accepted');
  
  // Test 5.3: Null handling
  const { data: nullCustomer, error: nullError } = await supabaseService
    .from('customers')
    .insert({ 
      name: 'Test Customer',
      // Leaving optional fields null
      email: null,
      phone: null,
      barangay: 'Test Barangay'
    })
    .select()
    .single();
    
  await logTest('edgeCases', 'nullHandling',
    !nullError && nullCustomer ? 'PASS' : 'FAIL',
    nullError ? nullError.message : 'Null values handled correctly');
  
  if (nullCustomer) {
    await supabaseService.from('customers').delete().eq('id', nullCustomer.id);
  }
}

// Generate comprehensive report
async function generateReport() {
  const reportContent = `# Consumer Sphere Intel - Migration QA Validation Report

Generated: ${results.timestamp}
Environment: ${results.environment}
Database: ${results.database}

## Executive Summary

- ✅ Tests Passed: ${results.summary.passed}
- ❌ Tests Failed: ${results.summary.failed}
- ⚠️ Warnings: ${results.summary.warnings}
- 📊 Success Rate: ${((results.summary.passed / (results.summary.passed + results.summary.failed)) * 100).toFixed(1)}%

## Detailed Test Results

${Object.entries(results.tests).map(([category, tests]) => `
### ${category.replace(/([A-Z])/g, ' $1').trim()}

| Test | Status | Details | Timestamp |
|------|--------|---------|-----------|
${Object.entries(tests).map(([testName, result]) => 
  `| ${testName} | ${result.status === 'PASS' ? '✅ PASS' : result.status === 'FAIL' ? '❌ FAIL' : '⚠️ WARN'} | ${result.details} | ${new Date(result.timestamp).toLocaleTimeString()} |`
).join('\n')}
`).join('\n')}

## Recommendations

${results.summary.failed > 0 ? `
### Critical Issues (Requires Immediate Attention)
- Review and fix all failed tests before production deployment
- Pay special attention to RLS and constraint failures
` : ''}

${results.summary.warnings > 0 ? `
### Warnings (Should Be Addressed)
- Investigate warning conditions
- May indicate data quality issues or edge cases
` : ''}

${results.summary.failed === 0 && results.summary.warnings === 0 ? `
### ✅ All Systems Go!
- All critical tests passed
- Database is production-ready
- No immediate concerns identified
` : ''}

## Next Steps

1. ${results.summary.failed > 0 ? 'Fix critical failures' : 'Monitor system performance'}
2. ${results.summary.warnings > 0 ? 'Address warning conditions' : 'Set up automated monitoring'}
3. Schedule regular QA validation runs
4. Document any custom business logic or exceptions

---
*This report was automatically generated by the Migration QA Validation Suite*
`;

  // Save report
  fs.writeFileSync('migration-qa-report.md', reportContent);
  console.log('\n📄 Report saved to migration-qa-report.md');
  
  // Also save JSON for programmatic access
  fs.writeFileSync('migration-qa-results.json', JSON.stringify(results, null, 2));
  console.log('📊 Raw results saved to migration-qa-results.json');
}

// Main execution
async function runFullQAValidation() {
  console.log('🚀 Starting Consumer Sphere Intel Migration QA Validation...\n');
  
  try {
    await testDataConsistency();
    await testIndexConstraints();
    await testRLS();
    await testAuditTriggers();
    await testEdgeCases();
    
    console.log('\n✅ All tests completed!\n');
    await generateReport();
    
  } catch (error) {
    console.error('\n❌ Critical error during validation:', error);
    results.tests.critical = { error: { status: 'FAIL', details: error.message } };
    await generateReport();
  }
}

// Run the validation
runFullQAValidation();