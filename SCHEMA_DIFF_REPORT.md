# 🔍 Consumer Sphere Intel - Schema Diff Analysis Report

**Generated:** June 19, 2025  
**Project:** Consumer Sphere Intel  
**Analysis Type:** Schema Diff (Mock Data vs Supabase)

## 📊 Executive Summary

This analysis compares the mock data structure used in development against the production Supabase schema to identify migration requirements and schema alignment issues.

## 🎯 Key Findings

### ✅ **Schema Detection Results**
- **Supabase Schema**: 17 tables detected (including views and functions)
- **Mock Data Schema**: 3 main interfaces detected
- **Complexity**: High - significant normalization required

### ⚠️ **Critical Issues Identified**
1. **Structure Mismatch** (HIGH) - Mock uses nested JSON, Supabase uses normalized tables
2. **ID Type Incompatibility** (MEDIUM) - String vs BigInt ID fields  
3. **Denormalization Required** (HIGH) - Basket arrays need flattening
4. **Missing Relationships** (MEDIUM) - Foreign key constraints not reflected in mock

## 🗺️ Schema Mapping Analysis

### **Mock Data Structure:**
```typescript
Transaction {
  id: string                    // → transactions.id (bigint conversion needed)
  date: string                  // → transactions.checkout_time
  basket: BasketItem[]          // → transaction_items (denormalization required)
  consumer_profile: Profile     // → customers table (flattening required)
  location data                 // → stores table (normalization required)
}

BasketItem {
  sku: string                   // → products.name + brands lookup
  brand: string                 // → brands.name  
  category: string              // → products.category
  units: number                 // → transaction_items.quantity
  price: number                 // → transaction_items.price
}

ConsumerProfile {
  gender: string                // → customers.gender
  age: number                   // → customers.age
  segment: string               // → customers.loyalty_tier
}
```

### **Supabase Production Schema:**
```sql
-- Core transaction tables
transactions (17 fields) ✅
transaction_items (6 fields) ✅
customers (11 fields) ✅
products (5 fields) ✅
brands (5 fields) ✅
stores (9 fields) ✅

-- Advanced features (not in mock)
devices (12 fields) ⚠️
device_health (11 fields) ⚠️
product_detections (11 fields) ⚠️
edge_logs (8 fields) ⚠️
request_behaviors (14 fields) ⚠️
substitutions (6 fields) ⚠️

-- Analytics views
basket_analytics ✅
brand_analytics ✅
customer_analytics ✅
daily_trends ✅
```

## 🚨 Schema Differences & Impact

### **1. Structure Mismatch (CRITICAL)**
- **Issue**: Mock data uses nested JSON objects within single transactions
- **Impact**: Cannot directly map to normalized Supabase tables
- **Solution**: ETL pipeline to denormalize Transaction.basket → transaction_items

### **2. ID Field Type Incompatibility (HIGH)**
- **Issue**: Mock uses string UUIDs, Supabase uses bigint sequences
- **Impact**: All foreign key relationships need ID transformation
- **Solution**: Create ID mapping logic during ETL

### **3. Missing Normalization (HIGH)**  
- **Issue**: Mock stores everything in Transaction object
- **Impact**: Duplicated data, no referential integrity
- **Solution**: Extract and normalize:
  - Brand data → brands table
  - Product data → products table  
  - Customer data → customers table
  - Location data → stores table

### **4. Advanced Features Gap (MEDIUM)**
- **Issue**: Production schema has IoT device management not in mock
- **Impact**: Mock data cannot test device-related features
- **Solution**: Supplement mock data with device simulation

## 🔄 Required Transformations

### **Transaction Mapping:**
```javascript
// Mock structure:
{
  id: "uuid-string",
  basket: [
    {sku: "Product A", brand: "Brand X", units: 2, price: 100}
  ],
  consumer_profile: {gender: "M", age: 30}
}

// Supabase structure:
transactions: {id: 1, customer_id: 123, store_id: 456, total_amount: 200}
transaction_items: {id: 1, transaction_id: 1, product_id: 789, quantity: 2, price: 100}
customers: {id: 123, gender: "M", age: 30}
products: {id: 789, name: "Product A", brand_id: 101}
brands: {id: 101, name: "Brand X"}
```

### **ETL Pipeline Requirements:**
1. **Extract** transaction data from mock JSON
2. **Transform** nested structures to relational format
3. **Load** into normalized Supabase tables
4. **Validate** foreign key relationships
5. **Test** data integrity and completeness

## 🛠️ Migration Recommendations

### **Phase 1: Core Data Migration (Week 1)**
```bash
# 1. Create lookup tables
./etl-pipeline extract-brands mockTransactions.json → brands
./etl-pipeline extract-products mockTransactions.json → products  
./etl-pipeline extract-customers mockTransactions.json → customers
./etl-pipeline extract-stores mockTransactions.json → stores

# 2. Migrate transaction data
./etl-pipeline transform-transactions mockTransactions.json → transactions
./etl-pipeline denormalize-baskets mockTransactions.json → transaction_items
```

### **Phase 2: Validation & Testing (Week 2)**
```bash
# 3. Validate data integrity
./qa-pipeline validate-foreign-keys
./qa-pipeline validate-totals
./qa-pipeline validate-completeness

# 4. Performance testing
./qa-pipeline benchmark-queries
./qa-pipeline test-dashboard-load
```

### **Phase 3: Advanced Features (Week 3)**
```bash
# 5. Simulate IoT data
./data-generator create-devices
./data-generator simulate-device-health
./data-generator create-product-detections
```

## 📋 Implementation Plan

### **Immediate Actions (Today)**
1. ✅ Schema diff analysis complete
2. 🔄 Create ETL transformation scripts
3. 🔄 Set up data validation pipeline
4. 🔄 Design ID mapping strategy

### **Next Steps (This Week)**
1. Implement Transaction → transactions mapping
2. Create basket denormalization logic
3. Build customer profile extraction
4. Set up brand/product lookup tables

### **Validation Gates**
- ✅ All mock transactions successfully migrated
- ✅ Row counts match between source and target
- ✅ Financial totals reconcile exactly
- ✅ Foreign key relationships validated
- ✅ Dashboard queries return expected results

## 🎯 Success Metrics

### **Data Integrity**
- 100% transaction record migration success
- 0% data loss during transformation
- All financial totals must reconcile exactly

### **Performance**  
- Dashboard load time < 3 seconds with real data
- Query response time < 500ms for analytics
- ETL pipeline completion < 10 minutes

### **Completeness**
- All mock data entities represented in Supabase
- All dashboard features working with real data
- Complete audit trail of transformation process

## 🚀 Conclusion

The schema diff analysis reveals significant structural differences requiring a comprehensive ETL pipeline. The main challenges are:

1. **Denormalization** of nested JSON to relational tables
2. **ID transformation** from string UUIDs to bigint sequences  
3. **Normalization** of embedded data to separate tables
4. **Advanced feature gaps** requiring data simulation

**Recommended approach**: Implement a phased migration strategy with robust validation at each step to ensure data integrity and system reliability.

---

**Status**: ✅ Analysis Complete  
**Next Step**: Implement ETL Pipeline  
**Priority**: HIGH - Required for production deployment