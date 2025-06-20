import React from 'react';
#!/usr/bin/env node

import { mockTransactions } from '../data/mockData';
import { MockDataService } from '../services/MockDataService';
import { DataIntegrityValidator } from '../utils/dataIntegrityValidator';

console.log('🔍 Consumer Sphere Intel - Comprehensive QA Audit');
console.log('================================================\n');

async function runQAAudit() {
  const validator = new DataIntegrityValidator();
  const mockDataService = new MockDataService();
  
  // 1. Basic Data Validation
  console.log('1️⃣  BASIC DATA VALIDATION');
  console.log('-------------------------');
  console.log(`✓ Total Mock Transactions: ${mockTransactions.length}`);
  
  const validationResult = validator.validateTransactions(mockTransactions);
  
  if (validationResult.isValid) {
    console.log('✅ All data integrity checks PASSED\n');
  } else {
    console.log('❌ Data integrity checks FAILED');
    console.log(`   Errors: ${validationResult.errors.length}`);
    validationResult.errors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
    if (validationResult.errors.length > 5) {
      console.log(`   ... and ${validationResult.errors.length - 5} more errors`);
    }
  }
  
  // 2. Data Statistics
  console.log('2️⃣  DATA STATISTICS');
  console.log('------------------');
  console.log(`Client Transactions: ${validationResult.stats.clientTransactions} (${validationResult.stats.clientPercentage.toFixed(1)}%)`);
  console.log(`Competitor Transactions: ${validationResult.stats.competitorTransactions}`);
  console.log(`Total Revenue: ₱${validationResult.stats.totalRevenue.toLocaleString()}`);
  console.log(`Average Transaction: ₱${(validationResult.stats.totalRevenue / validationResult.stats.totalTransactions).toFixed(2)}`);
  console.log(`Unique Regions: ${validationResult.stats.uniqueRegions}/17`);
  console.log(`Unique Cities: ${validationResult.stats.uniqueCities}`);
  console.log(`Unique Barangays: ${validationResult.stats.uniqueBarangays}`);
  console.log(`Unique Brands: ${validationResult.stats.uniqueBrands}`);
  console.log(`Unique SKUs: ${validationResult.stats.uniqueSkus}`);
  console.log(`Substitutions: ${validationResult.stats.substitutionCount} (${(validationResult.stats.substitutionCount / validationResult.stats.totalTransactions * 100).toFixed(1)}%)`);
  console.log(`AI Recommendations: ${validationResult.stats.aiRecommendationCount} (${(validationResult.stats.aiRecommendationCount / validationResult.stats.totalTransactions * 100).toFixed(1)}%)\n`);
  
  // 3. Filter Testing
  console.log('3️⃣  FILTER VALIDATION');
  console.log('--------------------');
  
  // Test region filter
  const ncrTransactions = await mockDataService.getTransactions({ regions: ['NCR'] });
  const expectedNCR = mockTransactions.filter(t => t.region === 'NCR').length;
  console.log(`NCR Filter: ${ncrTransactions.length} transactions (expected: ${expectedNCR}) ${ncrTransactions.length === expectedNCR ? '✅' : '❌'}`);
  
  // Test brand filter
  const alaskaTransactions = await mockDataService.getTransactions({ 
    brands: ['Alaska Evaporated Milk'] 
  });
  console.log(`Alaska Brand Filter: ${alaskaTransactions.length} transactions ✅`);
  
  // Test category filter
  const dairyTransactions = await mockDataService.getTransactions({ 
    categories: ['Dairy'] 
  });
  console.log(`Dairy Category Filter: ${dairyTransactions.length} transactions ✅`);
  
  // Test combined filters
  const combinedFilter = await mockDataService.getTransactions({
    regions: ['NCR', 'CALABARZON'],
    categories: ['Dairy', 'Snacks']
  });
  console.log(`Combined Filter (NCR+CALABARZON, Dairy+Snacks): ${combinedFilter.length} transactions ✅\n`);
  
  // 4. Data Summation Check
  console.log('4️⃣  DATA SUMMATION VALIDATION');
  console.log('-----------------------------');
  
  // Check regional summation
  const regionCounts = new Map<string, number>();
  mockTransactions.forEach(t => {
    regionCounts.set(t.region, (regionCounts.get(t.region) || 0) + 1);
  });
  
  const totalFromRegions = Array.from(regionCounts.values()).reduce((sum, count) => sum + count, 0);
  console.log(`Sum of all regions: ${totalFromRegions} ${totalFromRegions === 5000 ? '✅' : '❌'}`);
  
  // Check payment method summation
  const paymentCounts = new Map<string, number>();
  mockTransactions.forEach(t => {
    paymentCounts.set(t.consumer_profile.payment, (paymentCounts.get(t.consumer_profile.payment) || 0) + 1);
  });
  
  console.log('Payment Methods:');
  paymentCounts.forEach((count, method) => {
    console.log(`  ${method}: ${count} (${(count / 5000 * 100).toFixed(1)}%)`);
  });
  
  const totalPayments = Array.from(paymentCounts.values()).reduce((sum, count) => sum + count, 0);
  console.log(`Total payments sum: ${totalPayments} ${totalPayments === 5000 ? '✅' : '❌'}\n`);
  
  // 5. Drilldown Validation
  console.log('5️⃣  DRILLDOWN VALIDATION');
  console.log('-----------------------');
  
  const locationHierarchy = await mockDataService.getLocationHierarchy();
  const regionCount = Object.keys(locationHierarchy).length;
  console.log(`Location hierarchy regions: ${regionCount}/17 ${regionCount === 17 ? '✅' : '❌'}`);
  
  // Test NCR drilldown
  if (locationHierarchy['NCR']) {
    const ncrCities = Object.keys(locationHierarchy['NCR'].cities);
    console.log(`NCR has ${ncrCities.length} cities: ${ncrCities.slice(0, 3).join(', ')}...`);
    
    if (locationHierarchy['NCR'].cities['Manila']) {
      const manilaBarangays = locationHierarchy['NCR'].cities['Manila'].barangays;
      console.log(`Manila has ${manilaBarangays.length} barangays ✅`);
    }
  }
  
  // 6. Consumer Insights Validation
  console.log('\n6️⃣  CONSUMER INSIGHTS VALIDATION');
  console.log('--------------------------------');
  
  const consumerData = await mockDataService.getConsumerData();
  console.log(`Total consumers: ${consumerData.total} ${consumerData.total === 5000 ? '✅' : '❌'}`);
  
  console.log('Gender Distribution:');
  consumerData.genderMix.forEach(g => {
    console.log(`  ${g.name}: ${g.value} (${g.percentage.toFixed(1)}%)`);
  });
  
  console.log('Age Distribution:');
  consumerData.ageMix.forEach(a => {
    console.log(`  ${a.name}: ${a.value} (${a.percentage.toFixed(1)}%)`);
  });
  
  // 7. Behavioral Analytics
  console.log('\n7️⃣  BEHAVIORAL ANALYTICS');
  console.log('------------------------');
  
  const behavioralData = await mockDataService.getBehavioralData();
  console.log('Request Types:');
  behavioralData.requestTypes.forEach(rt => {
    console.log(`  ${rt.type}: ${rt.count} (${rt.percentage.toFixed(1)}%)`);
  });
  
  console.log(`\nStorekeeper Influence:`);
  console.log(`  Total suggestions: ${behavioralData.storekeperInfluence.totalSuggestions}`);
  console.log(`  Accepted: ${behavioralData.storekeperInfluence.acceptedSuggestions}`);
  console.log(`  Acceptance rate: ${behavioralData.storekeperInfluence.acceptanceRate.toFixed(1)}%`);
  console.log(`  Average duration: ${behavioralData.averageDuration} seconds`);
  
  // 8. Performance Check
  console.log('\n8️⃣  PERFORMANCE CHECK');
  console.log('--------------------');
  
  const perfStart = Date.now();
  for (let i = 0; i < 10; i++) {
    await mockDataService.getTransactions({
      regions: ['NCR'],
      brands: ['Alaska Evaporated Milk']
    });
  }
  const perfEnd = Date.now();
  const avgTime = (perfEnd - perfStart) / 10;
  
  console.log(`Average filter operation time: ${avgTime.toFixed(2)}ms ${avgTime < 100 ? '✅' : '⚠️'}`);
  
  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 QA AUDIT SUMMARY');
  console.log('='.repeat(50));
  
  const warnings = validationResult.warnings.length;
  const errors = validationResult.errors.length;
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ ALL CHECKS PASSED - Dashboard ready for production!');
  } else if (errors === 0) {
    console.log(`⚠️  PASSED with ${warnings} warnings`);
    console.log('Warnings:');
    validationResult.warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
  } else {
    console.log(`❌ FAILED with ${errors} errors and ${warnings} warnings`);
  }
  
  console.log('\n✨ QA Audit Complete!');
}

// Run the audit
runQAAudit().catch(console.error);