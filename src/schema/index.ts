/**
 * Canonical Schema Definitions
 * These types MUST match both Supabase schema and mock data structure
 * Any drift between mock/real data is a critical bug
 */

// Base types from Supabase
export interface Brand {
  id: number;
  name: string;
  category: string | null;
  is_tbwa: boolean | null;
  created_at: string | null;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand_id: number;
  created_at: string | null;
  brands?: Brand; // Foreign key relation
}

export interface Customer {
  id: number;
  age_bracket: string;
  gender: string;
  inferred_income: string;
  payment_method: string;
  created_at: string | null;
}

export interface Store {
  id: number;
  name: string;
  location: string;
  region: string;
  city: string;
  barangay: string | null;
  created_at: string | null;
}

export interface Transaction {
  id: number;
  customer_id: number;
  store_id: number;
  total_amount: number;
  created_at: string;
  transaction_items?: TransactionItem[]; // Foreign key relation
  customers?: Customer; // Foreign key relation
  stores?: Store; // Foreign key relation
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  created_at: string | null;
  products?: Product; // Foreign key relation
  transactions?: Transaction; // Foreign key relation
}

export interface CustomerRequest {
  id: number;
  transaction_id: number | null;
  request_type: string | null;
  request_mode: string | null;
  accepted_suggestion: boolean | null;
  created_at: string | null;
  transactions?: Transaction; // Foreign key relation
}

export interface Substitution {
  id: number;
  transaction_id: number | null;
  from_product_id: number | null;
  to_product_id: number | null;
  created_at: string | null;
  transactions?: Transaction; // Foreign key relation
  from_products?: Product; // Foreign key relation
  to_products?: Product; // Foreign key relation
}

// Aggregated types for UI consumption
export interface TransactionWithDetails extends Transaction {
  transaction_items: (TransactionItem & {
    products: Product & {
      brands: Brand;
    };
  })[];
  customers: Customer;
  stores: Store;
}

export interface RegionalData {
  region: string;
  transaction_count: number;
  total_revenue: number;
  avg_transaction_value: number;
}

export interface BrandPerformance {
  brand_name: string;
  category: string;
  is_tbwa: boolean;
  transaction_count: number;
  total_revenue: number;
  market_share: number;
}

export interface CategoryMix {
  category: string;
  transaction_count: number;
  total_revenue: number;
  percentage_of_total: number;
}

export interface ProductSubstitution {
  from_product: string;
  to_product: string;
  substitution_count: number;
  from_brand: string;
  to_brand: string;
  category: string;
}

export interface ConsumerInsight {
  age_bracket: string;
  gender: string;
  inferred_income: string;
  payment_method: string;
  transaction_count: number;
  avg_transaction_value: number;
}

// Filter types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardFilters {
  dateRange?: DateRange;
  regions?: string[];
  brands?: string[];
  categories?: string[];
}

// Response types for data services
export interface DashboardMetrics {
  totalTransactions: number;
  totalRevenue: number;
  avgTransactionValue: number;
  uniqueCustomers: number;
  topRegion: string;
  topBrand: string;
  topCategory: string;
}

export interface BehavioralAnalytics {
  substitution_patterns: ProductSubstitution[];
  request_type_distribution: {
    verbal: number;
    pointing: number;
    indirect: number;
  };
  storekeeper_influence_rate: number;
  suggestion_acceptance_rate: number;
}