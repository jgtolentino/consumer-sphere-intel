
/**
 * PERMANENT FIX FOR SUPABASE 1000 ROW LIMITS
 *
 * Configure your table limits here once and never worry about them again!
 *
 * The enhanced Supabase client will automatically apply these limits
 * to all queries without you having to remember to add .limit() manually.
 */

export const SUPABASE_LIMITS = {
  // Core transaction tables - set high for your 18K+ dataset
  transactions: 25000,        // Your main transaction table
  products: 10000,           // Product catalog
  customers: 15000,          // Customer base
  transaction_items: 50000,  // Line items (can be many per transaction)
  barangays: 1000,           // Geographic regions
  categories: 500,           // Product categories
  brands: 2000,              // Brand master
  skus: 10000               // SKU master
} as const;

export type TableName = keyof typeof SUPABASE_LIMITS;
