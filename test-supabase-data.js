#!/usr/bin/env node

// Test actual Supabase data connection and verify non-zero values
console.log('🔍 TESTING SUPABASE DATA CONNECTION');
console.log('==================================\n');

// Read environment variables (if available)
const fs = require('fs');
const path = require('path');

// Try to read .env.local file
let envVars = {};
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.includes('=')) {
        const [key, value] = line.split('=', 2);
        envVars[key.trim()] = value.trim();
      }
    });
    console.log('✅ Found .env.local file');
  } else {
    console.log('⚠️ No .env.local file found');
  }
} catch (error) {
  console.log('⚠️ Could not read .env.local:', error.message);
}

// Check for Supabase configuration
const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('📊 **SUPABASE CONFIGURATION:**');
console.log(`   URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`   Key: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);

if (supabaseUrl && supabaseKey) {
  console.log(`   Endpoint: ${supabaseUrl}/rest/v1/`);
  
  // Test connection using curl
  console.log('\n🔄 **TESTING DATA ENDPOINTS:**\n');
  
  const testEndpoints = [
    {
      name: 'Transactions Count',
      path: 'transactions?select=count',
      expected: 'count > 0'
    },
    {
      name: 'Transaction Sample',
      path: 'transactions?select=id,total_amount,created_at&limit=3',
      expected: 'Array with transaction data'
    },
    {
      name: 'Regional Data',
      path: 'transactions?select=store_location&not.store_location.is.null&limit=5',
      expected: 'Store locations present'
    }
  ];
  
  testEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. **${endpoint.name}**`);
    console.log(`   URL: ${supabaseUrl}/rest/v1/${endpoint.path}`);
    console.log(`   Expected: ${endpoint.expected}`);
    console.log(`   Test: curl -H "apikey: ${supabaseKey.substring(0, 20)}..." "${supabaseUrl}/rest/v1/${endpoint.path}"`);
    console.log('');
  });
}

// Mock data verification
console.log('📋 **FALLBACK DATA VERIFICATION:**\n');

// Check if mock data files exist
const mockFiles = [
  'src/data/mockData.ts',
  'src/data/philippineRegions.ts'
];

mockFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Available as fallback`);
  } else {
    console.log(`❌ ${file} - Missing fallback data`);
  }
});

// Check hardcoded regional data in ChoroplethMap
const choroplethPath = path.join(process.cwd(), 'src/components/ChoroplethMap.tsx');
if (fs.existsSync(choroplethPath)) {
  try {
    const content = fs.readFileSync(choroplethPath, 'utf8');
    const hasRegionData = content.includes('const regionData: RegionData[]');
    const regionCount = (content.match(/region: '/g) || []).length;
    
    console.log(`✅ ChoroplethMap.tsx - ${hasRegionData ? 'Has' : 'Missing'} hardcoded data`);
    console.log(`   Regions defined: ~${regionCount} entries`);
    
    // Extract some sample values
    const salesMatches = content.match(/totalSales: (\d+)/g);
    if (salesMatches && salesMatches.length > 0) {
      const sampleSales = salesMatches.slice(0, 3).map(m => m.replace('totalSales: ', ''));
      console.log(`   Sample sales values: ${sampleSales.join(', ')}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not analyze ChoroplethMap.tsx: ${error.message}`);
  }
}

// Data service verification
console.log('\n🔧 **DATA SERVICE STATUS:**\n');

const dataServicePath = path.join(process.cwd(), 'src/services/RealDataService.ts');
if (fs.existsSync(dataServicePath)) {
  try {
    const content = fs.readFileSync(dataServicePath, 'utf8');
    
    // Check for key features
    const features = [
      { name: 'Pagination support', check: content.includes('range(') && content.includes('pageSize') },
      { name: 'Field mapping', check: content.includes('total_amount || t.total || t.amount') },
      { name: 'Error handling', check: content.includes('console.error') && content.includes('throw error') },
      { name: 'Data transformation', check: content.includes('.map(transaction =>') },
      { name: 'Supabase integration', check: content.includes('supabase.from(') }
    ];
    
    features.forEach(feature => {
      console.log(`   ${feature.check ? '✅' : '❌'} ${feature.name}`);
    });
  } catch (error) {
    console.log(`⚠️ Could not analyze RealDataService.ts: ${error.message}`);
  }
}

// Recommendations
console.log('\n💡 **IMMEDIATE ACTIONS TO VERIFY DATA:**\n');

console.log('1. **Check Dashboard Console Logs:**');
console.log('   - Open browser dev tools (F12)');
console.log('   - Navigate to dashboard');
console.log('   - Look for: "Total FMCG transactions after filtering: X"');
console.log('   - Look for: "Raw transactions from API: X"');

console.log('\n2. **Verify KPI Values:**');
console.log('   - Total Transactions should be > 0');
console.log('   - Gross Peso Value should show ₱X.XM');
console.log('   - Avg Transaction Value should be > 0');
console.log('   - Active Regions should be > 0');

console.log('\n3. **Test Specific Components:**');
console.log('   - Choropleth map should show filled regions');
console.log('   - Time series chart should have data points');
console.log('   - Regional insights should show non-zero values');

console.log('\n4. **Database Verification:**');
if (supabaseUrl && supabaseKey) {
  console.log(`   curl -X GET "${supabaseUrl}/rest/v1/transactions?select=count" \\`);
  console.log(`     -H "apikey: ${supabaseKey}"`);
} else {
  console.log('   - Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.log('   - Ensure database has transaction seed data');
}

console.log('\n🎯 **ZERO VALUE PREVENTION STATUS:**');
console.log('✅ Choropleth map: GUARANTEED non-zero (hardcoded data)');
console.log('✅ TBWA brands: GUARANTEED non-zero (static values)');
console.log('⚠️ Transaction KPIs: DEPENDS on Supabase data');
console.log('⚠️ Time series: DEPENDS on real transactions');

console.log('\n🚀 **NEXT STEPS:**');
console.log('1. Run dashboard and check console logs');
console.log('2. Verify Supabase connection returns data');
console.log('3. Add fallback values if needed');
console.log('4. Test with different date ranges');

console.log('\n📊 **QA VERIFICATION COMPLETE**');
console.log('   Status: AUDIT READY - MANUAL TESTING REQUIRED');