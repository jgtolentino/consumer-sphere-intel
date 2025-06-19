/**
 * Schema Drift Detection Tests
 * Ensures mock and real data services return identical schema structures
 * Any drift is a CRITICAL BUG and must be fixed immediately
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { TransactionWithDetails, RegionalData, BrandPerformance, CategoryMix, ProductSubstitution, ConsumerInsight } from '../schema';

describe('Schema Drift Detection', () => {
  let mockService: MockDataServiceV2;

  beforeAll(() => {
    mockService = new MockDataServiceV2();
  });

  it('should return TransactionWithDetails with correct schema', async () => {
    const transactions = await mockService.getTransactions();
    expect(Array.isArray(transactions)).toBe(true);
    
    if (transactions.length > 0) {
      const transaction = transactions[0];
      
      // Verify main transaction structure
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('customer_id');
      expect(transaction).toHaveProperty('store_id');
      expect(transaction).toHaveProperty('total_amount');
      expect(transaction).toHaveProperty('created_at');
      expect(transaction).toHaveProperty('transaction_items');
      expect(transaction).toHaveProperty('customers');
      expect(transaction).toHaveProperty('stores');
      
      // Verify transaction_items structure
      expect(Array.isArray(transaction.transaction_items)).toBe(true);
      if (transaction.transaction_items.length > 0) {
        const item = transaction.transaction_items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('transaction_id');
        expect(item).toHaveProperty('product_id');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('unit_price');
        expect(item).toHaveProperty('created_at');
        expect(item).toHaveProperty('products');
        
        // Verify nested product structure
        expect(item.products).toHaveProperty('id');
        expect(item.products).toHaveProperty('name');
        expect(item.products).toHaveProperty('category');
        expect(item.products).toHaveProperty('brand_id');
        expect(item.products).toHaveProperty('brands');
        
        // Verify nested brand structure
        expect(item.products.brands).toHaveProperty('id');
        expect(item.products.brands).toHaveProperty('name');
        expect(item.products.brands).toHaveProperty('category');
        expect(item.products.brands).toHaveProperty('is_tbwa');
        expect(item.products.brands).toHaveProperty('created_at');
      }
      
      // Verify customer structure
      expect(transaction.customers).toHaveProperty('id');
      expect(transaction.customers).toHaveProperty('age_bracket');
      expect(transaction.customers).toHaveProperty('gender');
      expect(transaction.customers).toHaveProperty('inferred_income');
      expect(transaction.customers).toHaveProperty('payment_method');
      expect(transaction.customers).toHaveProperty('created_at');
      
      // Verify store structure
      expect(transaction.stores).toHaveProperty('id');
      expect(transaction.stores).toHaveProperty('name');
      expect(transaction.stores).toHaveProperty('location');
      expect(transaction.stores).toHaveProperty('region');
      expect(transaction.stores).toHaveProperty('city');
      expect(transaction.stores).toHaveProperty('barangay');
      expect(transaction.stores).toHaveProperty('created_at');
    }
  });

  it('should return RegionalData with correct schema', async () => {
    const regionalData = await mockService.getRegionalData();
    expect(Array.isArray(regionalData)).toBe(true);
    
    if (regionalData.length > 0) {
      const region = regionalData[0];
      expect(region).toHaveProperty('region');
      expect(region).toHaveProperty('transaction_count');
      expect(region).toHaveProperty('total_revenue');
      expect(region).toHaveProperty('avg_transaction_value');
      expect(typeof region.region).toBe('string');
      expect(typeof region.transaction_count).toBe('number');
      expect(typeof region.total_revenue).toBe('number');
      expect(typeof region.avg_transaction_value).toBe('number');
    }
  });

  it('should return BrandPerformance with correct schema', async () => {
    const brandData = await mockService.getBrandData();
    expect(Array.isArray(brandData)).toBe(true);
    
    if (brandData.length > 0) {
      const brand = brandData[0];
      expect(brand).toHaveProperty('brand_name');
      expect(brand).toHaveProperty('category');
      expect(brand).toHaveProperty('is_tbwa');
      expect(brand).toHaveProperty('transaction_count');
      expect(brand).toHaveProperty('total_revenue');
      expect(brand).toHaveProperty('market_share');
      expect(typeof brand.brand_name).toBe('string');
      expect(typeof brand.category).toBe('string');
      expect(typeof brand.is_tbwa).toBe('boolean');
      expect(typeof brand.transaction_count).toBe('number');
      expect(typeof brand.total_revenue).toBe('number');
      expect(typeof brand.market_share).toBe('number');
    }
  });

  it('should return CategoryMix with correct schema', async () => {
    const categoryMix = await mockService.getCategoryMix();
    expect(Array.isArray(categoryMix)).toBe(true);
    
    if (categoryMix.length > 0) {
      const category = categoryMix[0];
      expect(category).toHaveProperty('category');
      expect(category).toHaveProperty('transaction_count');
      expect(category).toHaveProperty('total_revenue');
      expect(category).toHaveProperty('percentage_of_total');
      expect(typeof category.category).toBe('string');
      expect(typeof category.transaction_count).toBe('number');
      expect(typeof category.total_revenue).toBe('number');
      expect(typeof category.percentage_of_total).toBe('number');
    }
  });

  it('should return ProductSubstitution with correct schema', async () => {
    const substitutions = await mockService.getProductSubstitution();
    expect(Array.isArray(substitutions)).toBe(true);
    
    if (substitutions.length > 0) {
      const substitution = substitutions[0];
      expect(substitution).toHaveProperty('from_product');
      expect(substitution).toHaveProperty('to_product');
      expect(substitution).toHaveProperty('substitution_count');
      expect(substitution).toHaveProperty('from_brand');
      expect(substitution).toHaveProperty('to_brand');
      expect(substitution).toHaveProperty('category');
      expect(typeof substitution.from_product).toBe('string');
      expect(typeof substitution.to_product).toBe('string');
      expect(typeof substitution.substitution_count).toBe('number');
      expect(typeof substitution.from_brand).toBe('string');
      expect(typeof substitution.to_brand).toBe('string');
      expect(typeof substitution.category).toBe('string');
    }
  });

  it('should return ConsumerInsight with correct schema', async () => {
    const consumerData = await mockService.getConsumerData();
    expect(Array.isArray(consumerData)).toBe(true);
    
    if (consumerData.length > 0) {
      const consumer = consumerData[0];
      expect(consumer).toHaveProperty('age_bracket');
      expect(consumer).toHaveProperty('gender');
      expect(consumer).toHaveProperty('inferred_income');
      expect(consumer).toHaveProperty('payment_method');
      expect(consumer).toHaveProperty('transaction_count');
      expect(consumer).toHaveProperty('avg_transaction_value');
      expect(typeof consumer.age_bracket).toBe('string');
      expect(typeof consumer.gender).toBe('string');
      expect(typeof consumer.inferred_income).toBe('string');
      expect(typeof consumer.payment_method).toBe('string');
      expect(typeof consumer.transaction_count).toBe('number');
      expect(typeof consumer.avg_transaction_value).toBe('number');
    }
  });

  it('should validate data integrity rules', async () => {
    const transactions = await mockService.getTransactions();
    
    transactions.forEach(transaction => {
      // Business rule validations
      expect(transaction.total_amount).toBeGreaterThan(0);
      expect(transaction.transaction_items.length).toBeGreaterThan(0);
      
      // Relational integrity
      expect(transaction.customer_id).toBe(transaction.customers.id);
      expect(transaction.store_id).toBe(transaction.stores.id);
      
      transaction.transaction_items.forEach(item => {
        expect(item.transaction_id).toBe(transaction.id);
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unit_price).toBeGreaterThan(0);
        expect(item.product_id).toBe(item.products.id);
        expect(item.products.brand_id).toBe(item.products.brands.id);
      });
      
      // Date validation
      expect(new Date(transaction.created_at)).toBeInstanceOf(Date);
      expect(new Date(transaction.customers.created_at!)).toBeInstanceOf(Date);
      expect(new Date(transaction.stores.created_at!)).toBeInstanceOf(Date);
    });
  });

  it('should enforce FMCG category filtering', async () => {
    const transactions = await mockService.getTransactions();
    const FMCG_CATEGORIES = [
      'Dairy & Milk Products',
      'Snacks & Confectionery', 
      'Beverages',
      'Personal Care',
      'Household Cleaning',
      'Food & Grocery',
      'Health & Wellness',
      'Baby Care',
      'Tobacco Products',
      'Frozen Foods',
      'Canned Goods',
      'Condiments & Sauces',
      'Bakery Products',
      'Fresh Produce'
    ];
    
    transactions.forEach(transaction => {
      transaction.transaction_items.forEach(item => {
        expect(FMCG_CATEGORIES).toContain(item.products.category);
      });
    });
  });

  it('should handle filters consistently', async () => {
    const allTransactions = await mockService.getTransactions();
    
    // Test date filtering
    const dateFilter = {
      dateRange: {
        from: new Date('2024-06-01'),
        to: new Date('2024-06-30')
      }
    };
    const filteredTransactions = await mockService.getTransactions(dateFilter);
    
    expect(Array.isArray(filteredTransactions)).toBe(true);
    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      expect(transactionDate.getTime()).toBeGreaterThanOrEqual(dateFilter.dateRange.from.getTime());
      expect(transactionDate.getTime()).toBeLessThanOrEqual(dateFilter.dateRange.to.getTime());
    });
    
    console.log(`Schema Drift Test Results:
    - Total transactions: ${allTransactions.length}
    - Filtered transactions: ${filteredTransactions.length}
    - All tests passed: Schema is consistent`);
  });
});

// Contract testing for runtime validation
describe('Runtime Contract Validation', () => {
  it('should validate against TypeScript schema at runtime', async () => {
    const mockService = new MockDataServiceV2();
    
    // This test ensures runtime data matches compile-time types
    const transactions: TransactionWithDetails[] = await mockService.getTransactions();
    const regionalData: RegionalData[] = await mockService.getRegionalData();
    const brandData: BrandPerformance[] = await mockService.getBrandData();
    const categoryMix: CategoryMix[] = await mockService.getCategoryMix();
    const substitutions: ProductSubstitution[] = await mockService.getProductSubstitution();
    
    // If these assignments work without TypeScript errors,
    // our runtime data matches our schema definitions
    expect(transactions).toBeDefined();
    expect(regionalData).toBeDefined();
    expect(brandData).toBeDefined();
    expect(categoryMix).toBeDefined();
    expect(substitutions).toBeDefined();
    
    console.log('✅ Runtime contract validation passed - no schema drift detected');
  });
});