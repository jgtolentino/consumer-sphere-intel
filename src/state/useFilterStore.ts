
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  dateRange: { from: Date | null; to: Date | null };
  barangays: string[];
  categories: string[];
  brands: string[];
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  setBarangays: (barangays: string[]) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setFilter: (type: 'categories' | 'brands' | 'barangays', values: string[]) => void;
  clearFilters: () => void;
  getMasterLists: () => {
    allRegions: string[];
    allCategories: string[];
    allBrands: string[];
    allCompanies: string[];
  };
}

// FMCG-focused master data lists
const MASTER_REGIONS = [
  'Metro Manila', 'Calabarzon', 'Central Luzon', 'Western Visayas', 
  'Central Visayas', 'Northern Mindanao', 'Davao Region', 'Ilocos Region',
  'Cagayan Valley', 'Bicol Region', 'Eastern Visayas', 'Zamboanga Peninsula'
];

const MASTER_CATEGORIES = [
  'Beverages', 'Snacks', 'Personal Care', 'Household', 'Dairy', 
  'Condiments', 'Instant Foods', 'Health & Wellness', 'Baby Care'
];

const MASTER_BRANDS = [
  'Coca-Cola', 'Pepsi', 'Alaska Milk', 'Nestlé', 'Unilever',
  'Procter & Gamble', 'Oishi', 'Jack n Jill', 'Century Tuna',
  'Lucky Me!', 'Maggi', 'Head & Shoulders', 'Palmolive', 'Colgate'
];

const MASTER_COMPANIES = [
  'Coca-Cola Philippines', 'Pepsi-Cola Products Philippines',
  'Alaska Milk Corporation', 'Nestlé Philippines', 'Unilever Philippines',
  'Procter & Gamble Philippines', 'Liwayway Marketing Corporation',
  'Universal Robina Corporation', 'Century Pacific Food'
];

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      dateRange: { 
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date() 
      },
      barangays: [],
      categories: [],
      brands: [],
      
      setDateRange: (range) => set({ dateRange: range }),
      setBarangays: (barangays) => set({ barangays }),
      setCategories: (categories) => set({ categories }),
      setBrands: (brands) => set({ brands }),
      
      setFilter: (type, values) => {
        set({ [type]: values });
      },
      
      clearFilters: () => set({ 
        barangays: [], 
        categories: [], 
        brands: [] 
      }),
      
      getMasterLists: () => ({
        allRegions: MASTER_REGIONS,
        allCategories: MASTER_CATEGORIES,
        allBrands: MASTER_BRANDS,
        allCompanies: MASTER_COMPANIES
      })
    }),
    {
      name: 'scout-filters',
      partialize: (state) => ({
        dateRange: state.dateRange,
        barangays: state.barangays,
        categories: state.categories,
        brands: state.brands
      })
    }
  )
);
