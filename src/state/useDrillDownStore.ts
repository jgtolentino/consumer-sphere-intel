
import { create } from 'zustand';

export interface DrillLevel {
  type: 'island_group' | 'region' | 'province' | 'city' | 'barangay' | 'store' | 'brand' | 'category' | 'sku';
  value: string;
  label: string;
}

interface DrillDownState {
  drillPath: DrillLevel[];
  currentLevel: string;
  availableOptions: Record<string, any[]>;
  drillDown: (level: DrillLevel) => void;
  jumpToLevel: (index: number) => void;
  reset: () => void;
  getCurrentContext: () => string;
}

// Mock hierarchical data structure
const hierarchyData = {
  island_group: [
    { value: 'luzon', label: 'Luzon', children: ['ncr', 'region-3', 'region-4a'] },
    { value: 'visayas', label: 'Visayas', children: ['region-7', 'region-8'] },
    { value: 'mindanao', label: 'Mindanao', children: ['region-11', 'region-12'] }
  ],
  region: [
    { value: 'ncr', label: 'NCR', parent: 'luzon', children: ['metro-manila'] },
    { value: 'region-3', label: 'Region 3', parent: 'luzon', children: ['bulacan', 'pampanga'] },
    { value: 'region-7', label: 'Region 7 (Cebu)', parent: 'visayas', children: ['cebu-province'] },
    { value: 'region-11', label: 'Region 11 (Davao)', parent: 'mindanao', children: ['davao-del-sur'] }
  ],
  province: [
    { value: 'metro-manila', label: 'Metro Manila', parent: 'ncr', children: ['quezon-city', 'manila', 'makati'] },
    { value: 'cebu-province', label: 'Cebu', parent: 'region-7', children: ['cebu-city', 'mandaue'] },
    { value: 'davao-del-sur', label: 'Davao del Sur', parent: 'region-11', children: ['davao-city'] }
  ],
  city: [
    { value: 'quezon-city', label: 'Quezon City', parent: 'metro-manila', children: ['barangay-commonwealth', 'barangay-diliman'] },
    { value: 'manila', label: 'Manila', parent: 'metro-manila', children: ['barangay-ermita', 'barangay-malate'] },
    { value: 'cebu-city', label: 'Cebu City', parent: 'cebu-province', children: ['barangay-lahug', 'barangay-capitol'] },
    { value: 'davao-city', label: 'Davao City', parent: 'davao-del-sur', children: ['barangay-poblacion', 'barangay-matina'] }
  ],
  barangay: [
    { value: 'barangay-commonwealth', label: 'Barangay Commonwealth', parent: 'quezon-city', children: ['store-sm-commonwealth', 'store-robinsons-commonwealth'] },
    { value: 'barangay-diliman', label: 'Barangay Diliman', parent: 'quezon-city', children: ['store-sm-north', 'store-trinoma'] },
    { value: 'barangay-lahug', label: 'Barangay Lahug', parent: 'cebu-city', children: ['store-sm-cebu', 'store-ayala-cebu'] }
  ],
  store: [
    { value: 'store-sm-commonwealth', label: 'SM Commonwealth', parent: 'barangay-commonwealth', children: ['brand-oishi', 'brand-alaska'] },
    { value: 'store-sm-north', label: 'SM North EDSA', parent: 'barangay-diliman', children: ['brand-oishi', 'brand-del-monte'] },
    { value: 'store-sm-cebu', label: 'SM City Cebu', parent: 'barangay-lahug', children: ['brand-alaska', 'brand-peerless'] }
  ]
};

export const useDrillDownStore = create<DrillDownState>((set, get) => ({
  drillPath: [],
  currentLevel: 'region',
  availableOptions: hierarchyData,

  drillDown: (level: DrillLevel) => set((state) => {
    const newPath = [...state.drillPath, level];
    return {
      drillPath: newPath,
      currentLevel: getNextLevelType(level.type)
    };
  }),

  jumpToLevel: (index: number) => set((state) => {
    const newPath = state.drillPath.slice(0, index + 1);
    const lastLevel = newPath[newPath.length - 1];
    return {
      drillPath: newPath,
      currentLevel: lastLevel ? getNextLevelType(lastLevel.type) : 'region'
    };
  }),

  reset: () => set({
    drillPath: [],
    currentLevel: 'region'
  }),

  getCurrentContext: () => {
    const { drillPath } = get();
    return drillPath.map(level => level.label).join(' > ') || 'All Regions';
  }
}));

const getNextLevelType = (currentType: string): string => {
  const hierarchy = ['island_group', 'region', 'province', 'city', 'barangay', 'store', 'brand', 'category', 'sku'];
  const currentIndex = hierarchy.indexOf(currentType);
  return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : currentType;
};
