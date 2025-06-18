
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

// Enhanced hierarchical data structure with more complete city and barangay data
const hierarchyData = {
  island_group: [
    { value: 'luzon', label: 'Luzon', children: ['metro-manila', 'region-3', 'region-4a'] },
    { value: 'visayas', label: 'Visayas', children: ['cebu', 'region-8'] },
    { value: 'mindanao', label: 'Mindanao', children: ['davao', 'region-12'] }
  ],
  region: [
    { value: 'metro-manila', label: 'Metro Manila', parent: 'luzon', children: ['quezon-city', 'manila', 'makati'] },
    { value: 'cebu', label: 'Cebu', parent: 'visayas', children: ['cebu-city', 'mandaue'] },
    { value: 'davao', label: 'Davao', parent: 'mindanao', children: ['davao-city'] }
  ],
  city: [
    { value: 'quezon-city', label: 'Quezon City', parent: 'metro-manila', children: ['barangay-commonwealth', 'barangay-diliman', 'barangay-fairview'] },
    { value: 'manila', label: 'Manila', parent: 'metro-manila', children: ['barangay-ermita', 'barangay-malate'] },
    { value: 'makati', label: 'Makati', parent: 'metro-manila', children: ['barangay-poblacion', 'barangay-bel-air'] },
    { value: 'cebu-city', label: 'Cebu City', parent: 'cebu', children: ['barangay-lahug', 'barangay-capitol-site'] },
    { value: 'mandaue', label: 'Mandaue', parent: 'cebu', children: ['barangay-centro', 'barangay-alang-alang'] },
    { value: 'davao-city', label: 'Davao City', parent: 'davao', children: ['barangay-poblacion', 'barangay-matina'] }
  ],
  barangay: [
    // Quezon City barangays
    { value: 'barangay-commonwealth', label: 'Barangay Commonwealth', parent: 'quezon-city', children: ['store-sm-commonwealth', 'store-robinsons-commonwealth'] },
    { value: 'barangay-diliman', label: 'Barangay Diliman', parent: 'quezon-city', children: ['store-sm-north', 'store-trinoma'] },
    { value: 'barangay-fairview', label: 'Barangay Fairview', parent: 'quezon-city', children: ['store-sm-fairview', 'store-ayala-fairview'] },
    // Manila barangays
    { value: 'barangay-ermita', label: 'Barangay Ermita', parent: 'manila', children: ['store-robinson-manila', 'store-sm-manila'] },
    { value: 'barangay-malate', label: 'Barangay Malate', parent: 'manila', children: ['store-harrison-plaza', 'store-midtown-mall'] },
    // Makati barangays
    { value: 'barangay-poblacion', label: 'Barangay Poblacion', parent: 'makati', children: ['store-greenbelt', 'store-glorietta'] },
    { value: 'barangay-bel-air', label: 'Barangay Bel-Air', parent: 'makati', children: ['store-century-mall', 'store-powerplant'] },
    // Cebu City barangays
    { value: 'barangay-lahug', label: 'Barangay Lahug', parent: 'cebu-city', children: ['store-sm-cebu', 'store-ayala-cebu'] },
    { value: 'barangay-capitol-site', label: 'Barangay Capitol Site', parent: 'cebu-city', children: ['store-robinson-cebu', 'store-jy-square'] },
    // Mandaue barangays
    { value: 'barangay-centro', label: 'Barangay Centro', parent: 'mandaue', children: ['store-parkmall', 'store-jcentre'] },
    { value: 'barangay-alang-alang', label: 'Barangay Alang-Alang', parent: 'mandaue', children: ['store-citymart', 'store-gaisano'] },
    // Davao City barangays
    { value: 'barangay-poblacion', label: 'Barangay Poblacion', parent: 'davao-city', children: ['store-sm-davao', 'store-abreeza'] },
    { value: 'barangay-matina', label: 'Barangay Matina', parent: 'davao-city', children: ['store-matina-town', 'store-gmall'] }
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
