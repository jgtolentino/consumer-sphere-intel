
import { create } from 'zustand';

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
  setFilter: <K extends keyof Omit<FilterState, 'setFilter' | 'reset' | 'getQueryString'>>(
    key: K, 
    value: FilterState[K]
  ) => void;
  reset: () => void;
  getQueryString: () => string;
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
    const { setFilter, reset, getQueryString, ...filters } = state;
    
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
  }
}));
