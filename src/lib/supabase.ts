
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_LIMITS, TableName } from '../config/supabase-limits';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced query builder that automatically applies table limits
export function withLimit(tableName: TableName, query: any) {
  const limit = SUPABASE_LIMITS[tableName];
  return limit ? query.limit(limit) : query;
}

// Type definitions
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  barangay: string;
  age_group: string;
  gender: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  unit_price: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  total_amount: number;
  items_count: number;
  payment_method?: string;
  created_at: string;
  customers?: Customer;
  transaction_items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: Product;
}
