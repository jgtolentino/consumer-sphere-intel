/**
 * MockDataService V2 - Schema Compliant
 * Mirrors Supabase schema exactly - no drift allowed
 */

import { DataService } from '../providers/DataProvider';
import {
  TransactionWithDetails,
  RegionalData,
  BrandPerformance,
  CategoryMix,
  ProductSubstitution,
  ConsumerInsight,
  DashboardFilters,
  Brand,
  Product,
  Customer,
  Store,
  Transaction,
  TransactionItem
} from '../schema';

// FMCG categories - matches Supabase categories exactly
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

// Mock data that mirrors Supabase schema exactly
const mockBrands: Brand[] = [
  { id: 1, name: "Coca-Cola", category: "Beverages", is_tbwa: true, created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Pepsi", category: "Beverages", is_tbwa: false, created_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Nestle", category: "Food & Grocery", is_tbwa: true, created_at: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Unilever", category: "Personal Care", is_tbwa: false, created_at: "2024-01-01T00:00:00Z" },
  { id: 5, name: "P&G", category: "Household Cleaning", is_tbwa: true, created_at: "2024-01-01T00:00:00Z" },
];

const mockProducts: Product[] = [
  { id: 1, name: "Coke 355ml", category: "Beverages", brand_id: 1, created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Pepsi 355ml", category: "Beverages", brand_id: 2, created_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Maggi Noodles", category: "Food & Grocery", brand_id: 3, created_at: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Dove Soap", category: "Personal Care", brand_id: 4, created_at: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Tide Powder", category: "Household Cleaning", brand_id: 5, created_at: "2024-01-01T00:00:00Z" },
];

const mockCustomers: Customer[] = [
  { id: 1, age_bracket: "25-34", gender: "F", inferred_income: "Middle", payment_method: "Cash", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, age_bracket: "35-44", gender: "M", inferred_income: "High", payment_method: "Digital", created_at: "2024-01-01T00:00:00Z" },
  { id: 3, age_bracket: "18-24", gender: "F", inferred_income: "Low", payment_method: "Cash", created_at: "2024-01-01T00:00:00Z" },
  { id: 4, age_bracket: "45-54", gender: "M", inferred_income: "Middle", payment_method: "Cash", created_at: "2024-01-01T00:00:00Z" },
  { id: 5, age_bracket: "55+", gender: "F", inferred_income: "High", payment_method: "Digital", created_at: "2024-01-01T00:00:00Z" },
];

const mockStores: Store[] = [
  { id: 1, name: "Sari-Sari Store A", location: "NCR", region: "NCR", city: "Manila", barangay: "Barangay 1", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Convenience Store B", location: "CALABARZON", region: "CALABARZON", city: "Calamba", barangay: "Poblacion", created_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Mini Mart C", location: "Central Luzon", region: "Central Luzon", city: "Angeles", barangay: "San Jose", created_at: "2024-01-01T00:00:00Z" },
];

// Generate mock transactions with proper normalization
const generateMockTransactions = (count: number = 5000): TransactionWithDetails[] => {
  const transactions: TransactionWithDetails[] = [];
  
  for (let i = 1; i <= count; i++) {
    const customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    const store = mockStores[Math.floor(Math.random() * mockStores.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items per transaction
    
    const transactionItems: (TransactionItem & { products: Product & { brands: Brand } })[] = [];
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const brand = mockBrands.find(b => b.id === product.brand_id)!;
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Math.floor(Math.random() * 100) + 10;
      
      transactionItems.push({
        id: i * 10 + j,
        transaction_id: i,
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
        created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        products: {
          ...product,
          brands: brand
        }
      });
      
      totalAmount += quantity * unitPrice;
    }
    
    transactions.push({
      id: i,
      customer_id: customer.id,
      store_id: store.id,
      total_amount: totalAmount,
      created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      transaction_items: transactionItems,
      customers: customer,
      stores: store
    });
  }
  
  return transactions;
};

export class MockDataServiceV2 implements DataService {
  private mockTransactions: TransactionWithDetails[] = generateMockTransactions(5000);

  async getTransactions(filters?: DashboardFilters): Promise<TransactionWithDetails[]> {
    let filteredTransactions = [...this.mockTransactions];
    
    // Apply filters exactly like RealDataService would
    if (filters?.dateRange?.from) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.created_at) >= filters.dateRange!.from
      );
    }
    if (filters?.dateRange?.to) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.created_at) <= filters.dateRange!.to
      );
    }
    if (filters?.regions?.length) {
      filteredTransactions = filteredTransactions.filter(t => 
        filters.regions!.includes(t.stores.region)
      );
    }
    if (filters?.brands?.length) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.transaction_items.some(item => 
          filters.brands!.includes(item.products.brands.name)
        )
      );
    }
    
    // Filter to FMCG categories only
    filteredTransactions = filteredTransactions.map(t => ({
      ...t,
      transaction_items: t.transaction_items.filter(item => 
        FMCG_CATEGORIES.includes(item.products.category)
      )
    })).filter(t => t.transaction_items.length > 0);
    
    console.log(`Total FMCG transactions after filtering: ${filteredTransactions.length}`);
    return filteredTransactions;
  }

  async getRegionalData(): Promise<RegionalData[]> {
    const transactions = await this.getTransactions();
    const regionalMap = new Map<string, { count: number; revenue: number }>();
    
    transactions.forEach(t => {
      const region = t.stores.region;
      const current = regionalMap.get(region) || { count: 0, revenue: 0 };
      regionalMap.set(region, {
        count: current.count + 1,
        revenue: current.revenue + t.total_amount
      });
    });
    
    return Array.from(regionalMap.entries()).map(([region, data]) => ({
      region,
      transaction_count: data.count,
      total_revenue: data.revenue,
      avg_transaction_value: data.revenue / data.count
    }));
  }

  async getBrandData(): Promise<BrandPerformance[]> {
    const transactions = await this.getTransactions();
    const brandMap = new Map<string, { count: number; revenue: number; brand: Brand }>();
    
    transactions.forEach(t => {
      t.transaction_items.forEach(item => {
        const brandName = item.products.brands.name;
        const current = brandMap.get(brandName) || { count: 0, revenue: 0, brand: item.products.brands };
        brandMap.set(brandName, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.quantity * item.unit_price),
          brand: current.brand
        });
      });
    });
    
    const totalRevenue = Array.from(brandMap.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return Array.from(brandMap.entries()).map(([brandName, data]) => ({
      brand_name: brandName,
      category: data.brand.category || 'Unknown',
      is_tbwa: data.brand.is_tbwa || false,
      transaction_count: data.count,
      total_revenue: data.revenue,
      market_share: (data.revenue / totalRevenue) * 100
    }));
  }

  async getConsumerData(): Promise<ConsumerInsight[]> {
    const transactions = await this.getTransactions();
    const consumerMap = new Map<string, { count: number; revenue: number; customer: Customer }>();
    
    transactions.forEach(t => {
      const key = `${t.customers.age_bracket}-${t.customers.gender}-${t.customers.inferred_income}-${t.customers.payment_method}`;
      const current = consumerMap.get(key) || { count: 0, revenue: 0, customer: t.customers };
      consumerMap.set(key, {
        count: current.count + 1,
        revenue: current.revenue + t.total_amount,
        customer: current.customer
      });
    });
    
    return Array.from(consumerMap.values()).map(data => ({
      age_bracket: data.customer.age_bracket,
      gender: data.customer.gender,
      inferred_income: data.customer.inferred_income,
      payment_method: data.customer.payment_method,
      transaction_count: data.count,
      avg_transaction_value: data.revenue / data.count
    }));
  }

  async getProductData(): Promise<any> {
    const transactions = await this.getTransactions();
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    
    transactions.forEach(t => {
      t.transaction_items.forEach(item => {
        const category = item.products.category;
        const current = categoryMap.get(category) || { count: 0, revenue: 0 };
        categoryMap.set(category, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.quantity * item.unit_price)
        });
      });
    });
    
    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return {
      categories: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        transaction_count: data.count,
        total_revenue: data.revenue,
        percentage_of_total: (data.revenue / totalRevenue) * 100
      }))
    };
  }

  async getCategoryMix(): Promise<CategoryMix[]> {
    const productData = await this.getProductData();
    return productData.categories;
  }

  async getProductSubstitution(): Promise<ProductSubstitution[]> {
    // Mock substitution data with proper schema structure
    return [
      {
        from_product: "Pepsi 355ml",
        to_product: "Coke 355ml", 
        substitution_count: 150,
        from_brand: "Pepsi",
        to_brand: "Coca-Cola",
        category: "Beverages"
      },
      {
        from_product: "Generic Soap",
        to_product: "Dove Soap",
        substitution_count: 89,
        from_brand: "Generic",
        to_brand: "Unilever", 
        category: "Personal Care"
      }
    ];
  }
}