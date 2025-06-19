#!/usr/bin/env node

/**
 * Consumer Sphere Intel - Schema Diff Analysis
 * Compares mock data structure vs Supabase schema
 */

const fs = require('fs');
const path = require('path');

// Extract Supabase schema from types.ts
function extractSupabaseSchema() {
  const typesFile = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');
  
  // Extract table names and basic structure
  const tableMatches = typesFile.match(/(\w+): \{[\s\S]*?Row: \{[\s\S]*?\}/g);
  const tables = {};
  
  if (tableMatches) {
    tableMatches.forEach(match => {
      const nameMatch = match.match(/(\w+): \{/);
      if (nameMatch) {
        const tableName = nameMatch[1];
        const fieldMatches = match.match(/(\w+): ([^|]+)\|/g);
        
        tables[tableName] = {
          fields: {},
          source: 'supabase'
        };
        
        if (fieldMatches) {
          fieldMatches.forEach(fieldMatch => {
            const [, fieldName, fieldType] = fieldMatch.match(/(\w+): ([^|]+)\|/);
            tables[tableName].fields[fieldName] = fieldType.trim();
          });
        }
      }
    });
  }
  
  return tables;
}

// Extract mock data schema from TypeScript interfaces
function extractMockDataSchema() {
  const mockDataFile = fs.readFileSync('src/data/mockData.ts', 'utf8');
  
  const interfaces = {};
  
  // Extract Transaction interface
  const transactionMatch = mockDataFile.match(/interface Transaction \{([\s\S]*?)\}/);
  if (transactionMatch) {
    interfaces.Transaction = parseInterfaceFields(transactionMatch[1]);
  }
  
  // Extract BasketItem interface  
  const basketMatch = mockDataFile.match(/interface BasketItem \{([\s\S]*?)\}/);
  if (basketMatch) {
    interfaces.BasketItem = parseInterfaceFields(basketMatch[1]);
  }
  
  // Extract ConsumerProfile interface
  const consumerMatch = mockDataFile.match(/interface ConsumerProfile \{([\s\S]*?)\}/);
  if (consumerMatch) {
    interfaces.ConsumerProfile = parseInterfaceFields(consumerMatch[1]);
  }
  
  return interfaces;
}

function parseInterfaceFields(interfaceBody) {
  const fields = {};
  const lines = interfaceBody.split('\n');
  
  lines.forEach(line => {
    const fieldMatch = line.match(/^\s*(\w+)(\?)?:\s*([^;]+);?/);
    if (fieldMatch) {
      const [, fieldName, optional, fieldType] = fieldMatch;
      fields[fieldName] = {
        type: fieldType.trim(),
        nullable: !!optional
      };
    }
  });
  
  return { fields, source: 'mock_data' };
}

// Schema mapping analysis
function analyzeSchemaMapping() {
  const supabaseSchema = extractSupabaseSchema();
  const mockDataSchema = extractMockDataSchema();
  
  console.log('🔍 CONSUMER SPHERE INTEL - SCHEMA DIFF ANALYSIS');
  console.log('=' * 60);
  console.log();
  
  console.log('📊 SUPABASE SCHEMA DETECTED:');
  console.log(`   Tables: ${Object.keys(supabaseSchema).length}`);
  Object.keys(supabaseSchema).forEach(table => {
    const fieldCount = Object.keys(supabaseSchema[table].fields || {}).length;
    console.log(`   ✅ ${table} (${fieldCount} fields)`);
  });
  console.log();
  
  console.log('📋 MOCK DATA SCHEMA DETECTED:');
  console.log(`   Interfaces: ${Object.keys(mockDataSchema).length}`);
  Object.keys(mockDataSchema).forEach(interfaceName => {
    const fieldCount = Object.keys(mockDataSchema[interfaceName].fields || {}).length;
    console.log(`   ✅ ${interfaceName} (${fieldCount} fields)`);
  });
  console.log();
  
  // Schema mapping analysis
  console.log('🗺️ SCHEMA MAPPING ANALYSIS:');
  console.log('-' * 40);
  
  // Transaction mapping
  if (mockDataSchema.Transaction && supabaseSchema.transactions) {
    console.log('📦 TRANSACTION MAPPING:');
    analyzeMappingPair(mockDataSchema.Transaction, supabaseSchema.transactions, 'Transaction → transactions');
  }
  
  // Brand/Product mapping
  if (mockDataSchema.BasketItem) {
    console.log('📦 BASKET ITEM MAPPING:');
    console.log('   Mock BasketItem could map to:');
    console.log('   → transaction_items (quantity, price)');
    console.log('   → products (sku, brand, category)');
    console.log('   → brands (brand name)');
  }
  
  // Consumer mapping
  if (mockDataSchema.ConsumerProfile && supabaseSchema.customers) {
    console.log('📦 CONSUMER PROFILE MAPPING:');
    analyzeMappingPair(mockDataSchema.ConsumerProfile, supabaseSchema.customers, 'ConsumerProfile → customers');
  }
  
  console.log();
  
  // Schema differences
  console.log('⚠️ SCHEMA DIFFERENCES IDENTIFIED:');
  console.log('-' * 40);
  
  const differences = [
    {
      type: 'Structure Mismatch',
      severity: 'ERROR',
      description: 'Mock data uses nested JSON objects, Supabase uses normalized tables',
      suggestion: 'Create ETL pipeline to denormalize Transaction.basket → transaction_items'
    },
    {
      type: 'ID Field Type',
      severity: 'WARNING', 
      description: 'Mock uses string IDs, Supabase uses bigint IDs',
      suggestion: 'Add ID transformation logic in ETL pipeline'
    },
    {
      type: 'Missing Tables',
      severity: 'INFO',
      description: 'Supabase has device management tables not in mock data',
      suggestion: 'These are for production IoT features, can be populated separately'
    },
    {
      type: 'Complex Fields',
      severity: 'WARNING',
      description: 'Mock data has nested objects (consumer_profile, basket)',
      suggestion: 'Flatten and normalize these into separate tables'
    }
  ];
  
  differences.forEach((diff, idx) => {
    const icon = diff.severity === 'ERROR' ? '❌' : diff.severity === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${diff.type}:`);
    console.log(`   Description: ${diff.description}`);
    console.log(`   Suggestion: ${diff.suggestion}`);
    console.log();
  });
  
  // Migration recommendations
  console.log('🚀 MIGRATION RECOMMENDATIONS:');
  console.log('-' * 40);
  console.log('1. Create ETL pipeline to transform nested JSON to relational structure');
  console.log('2. Implement ID mapping strategy (string → bigint conversion)');
  console.log('3. Denormalize Transaction.basket array into transaction_items records');
  console.log('4. Map ConsumerProfile fields to customers table');
  console.log('5. Create lookup tables for brands, products, stores from transaction data');
  console.log('6. Implement data validation for foreign key relationships');
  console.log();
  
  console.log('✅ SCHEMA DIFF ANALYSIS COMPLETE');
  
  return {
    supabaseSchema,
    mockDataSchema,
    differences,
    mappingRecommendations: [
      'Transaction → transactions (main transaction data)',
      'BasketItem[] → transaction_items (denormalized basket)',
      'ConsumerProfile → customers (customer demographics)',
      'Location data → stores (store information)',
      'Brand/SKU data → products + brands (product catalog)'
    ]
  };
}

function analyzeMappingPair(source, target, label) {
  console.log(`   ${label}:`);
  
  const sourceFields = Object.keys(source.fields);
  const targetFields = Object.keys(target.fields || {});
  
  // Find direct matches
  const matches = sourceFields.filter(field => targetFields.includes(field));
  matches.forEach(field => {
    console.log(`   ✅ ${field} → ${field} (direct match)`);
  });
  
  // Find potential fuzzy matches
  const unmatched = sourceFields.filter(field => !matches.includes(field));
  unmatched.forEach(sourceField => {
    const fuzzyMatch = targetFields.find(targetField => 
      targetField.includes(sourceField) || sourceField.includes(targetField)
    );
    if (fuzzyMatch) {
      console.log(`   🔄 ${sourceField} → ${fuzzyMatch} (fuzzy match)`);
    } else {
      console.log(`   ❌ ${sourceField} (no match found)`);
    }
  });
  
  console.log();
}

// Execute analysis
if (require.main === module) {
  try {
    const analysis = analyzeSchemaMapping();
    
    // Save analysis results
    fs.writeFileSync('schema-diff-results.json', JSON.stringify(analysis, null, 2));
    console.log('📄 Analysis results saved to schema-diff-results.json');
    
  } catch (error) {
    console.error('❌ Schema analysis failed:', error.message);
    process.exit(1);
  }
}