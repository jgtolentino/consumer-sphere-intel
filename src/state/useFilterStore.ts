
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  dateRange: { from: Date | null; to: Date | null };
  barangays: string[];
  categories: string[];
  brands: string[];
  skus: string[];
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  setBarangays: (barangays: string[]) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setSkus: (skus: string[]) => void;
  setFilter: (type: 'categories' | 'brands' | 'barangays' | 'dateRange' | 'skus', values: any) => void;
  clearFilters: () => void;
  reset: () => void;
  getQueryString: () => string;
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
      skus: [],
      
      setDateRange: (range) => set({ dateRange: range }),
      setBarangays: (barangays) => set({ barangays }),
      setCategories: (categories) => set({ categories }),
      setBrands: (brands) => set({ brands }),
      setSkus: (skus) => set({ skus }),
      
      setFilter: (type, values) => {
        if (type === 'dateRange') {
          set({ dateRange: values });
        } else {
          set({ [type]: values });
        }
      },
      
      clearFilters: () => set({ 
        barangays: [], 
        categories: [], 
        brands: [],
        skus: []
      }),

      reset: () => set({ 
        dateRange: { 
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date() 
        },
        barangays: [], 
        categories: [], 
        brands: [],
        skus: []
      }),

      getQueryString: () => {
        const state = get();
        const params = new URLSearchParams();
        
        if (state.dateRange.from) {
          params.set('from', state.dateRange.from.toISOString());
        }
        if (state.dateRange.to) {
          params.set('to', state.dateRange.to.toISOString());
        }
        if (state.barangays.length > 0) {
          params.set('barangays', state.barangays.join(','));
        }
        if (state.categories.length > 0) {
          params.set('categories', state.categories.join(','));
        }
        if (state.brands.length > 0) {
          params.set('brands', state.brands.join(','));
        }
        if (state.skus.length > 0) {
          params.set('skus', state.skus.join(','));
        }
        
        return params.toString();
      },
      
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
        brands: state.brands,
        skus: state.skus
      })
    }
  )
);
