
import { create } from 'zustand';
import { tbwaClientBrands, competitorBrands, regions } from '../data/mockData';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface FilterState {
  dateRange: DateRange;
  barangays: string[];
  categories: string[];
  brands: string[];
  skus: string[];
  stores: string[];
  channels: string[];
  setFilter: <K extends keyof Omit<FilterState, 'setFilter' | 'reset' | 'getQueryString' | 'getMasterLists'>>(
    key: K, 
    value: FilterState[K]
  ) => void;
  reset: () => void;
  getQueryString: () => string;
  getMasterLists: () => {
    allRegions: string[];
    allBrands: string[];
    allCategories: string[];
    allCompanies: string[];
    allChannels: string[];
  };
}

const defaultState = {
  dateRange: { from: null, to: null },
  barangays: [],
  categories: [],
  brands: [],
  skus: [],
  stores: [],
  channels: []
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...defaultState,
  
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  
  reset: () => set(defaultState),
  
  getQueryString: () => {
    const state = get();
    const { setFilter, reset, getQueryString, getMasterLists, ...filters } = state;
    
    const params = new URLSearchParams();
    
    if (filters.dateRange.from) {
      params.set('from', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange.to) {
      params.set('to', filters.dateRange.to.toISOString());
    }
    if (filters.barangays.length > 0) {
      params.set('barangays', filters.barangays.join(','));
    }
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','));
    }
    if (filters.skus.length > 0) {
      params.set('skus', filters.skus.join(','));
    }
    if (filters.stores.length > 0) {
      params.set('stores', filters.stores.join(','));
    }
    if (filters.channels.length > 0) {
      params.set('channels', filters.channels.join(','));
    }
    
    return params.toString();
  },

  getMasterLists: () => {
    const allBrands = [...tbwaClientBrands, ...competitorBrands];
    
    return {
      allRegions: regions.map(r => r.name).sort(),
      allBrands: [...new Set(allBrands.map(b => b.name))].sort(),
      allCategories: [...new Set(allBrands.map(b => b.category))].sort(),
      allCompanies: [...new Set(allBrands.map(b => b.company))].sort(),
      allChannels: ['Traditional', 'Modern Trade', 'Sari-Sari Store'].sort()
    };
  }
}));
