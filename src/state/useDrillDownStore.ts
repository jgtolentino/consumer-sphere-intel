
import React from 'react';
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

// Enhanced hierarchical data structure with complete Philippine regions, cities, and barangays
const hierarchyData = {
  region: [
    // Luzon Regions
    { value: 'ncr', label: 'National Capital Region', children: ['quezon-city', 'manila', 'makati', 'taguig', 'pasig'] },
    { value: 'car', label: 'Cordillera Administrative Region', children: ['baguio', 'tabuk', 'la-trinidad'] },
    { value: 'region-1', label: 'Ilocos Region', children: ['laoag', 'vigan', 'dagupan', 'san-fernando-lr'] },
    { value: 'region-2', label: 'Cagayan Valley', children: ['tuguegarao', 'ilagan', 'cauayan'] },
    { value: 'region-3', label: 'Central Luzon', children: ['san-fernando-cl', 'angeles', 'malolos', 'cabanatuan'] },
    { value: 'region-4a', label: 'CALABARZON', children: ['calamba', 'antipolo', 'dasmarinas', 'bacoor'] },
    { value: 'region-4b', label: 'MIMAROPA', children: ['calapan', 'puerto-princesa', 'romblon'] },
    { value: 'region-5', label: 'Bicol Region', children: ['legazpi', 'naga', 'iriga', 'sorsogon'] },
    
    // Visayas Regions
    { value: 'region-6', label: 'Western Visayas', children: ['iloilo', 'bacolod', 'roxas', 'kalibo'] },
    { value: 'region-7', label: 'Central Visayas', children: ['cebu-city', 'mandaue', 'lapu-lapu', 'tagbilaran'] },
    { value: 'region-8', label: 'Eastern Visayas', children: ['tacloban', 'ormoc', 'maasin', 'borongan'] },
    
    // Mindanao Regions
    { value: 'region-9', label: 'Zamboanga Peninsula', children: ['zamboanga', 'pagadian', 'dipolog'] },
    { value: 'region-10', label: 'Northern Mindanao', children: ['cagayan-de-oro', 'iligan', 'valencia', 'gingoog'] },
    { value: 'region-11', label: 'Davao Region', children: ['davao-city', 'tagum', 'panabo', 'samal'] },
    { value: 'region-12', label: 'SOCCSKSARGEN', children: ['general-santos', 'koronadal', 'tacurong', 'kidapawan'] },
    { value: 'region-13', label: 'Caraga', children: ['butuan', 'surigao', 'tandag', 'bislig'] },
    { value: 'barmm', label: 'BARMM', children: ['cotabato-city', 'marawi', 'lamitan', 'jolo'] }
  ],
  
  city: [
    // NCR Cities
    { value: 'quezon-city', label: 'Quezon City', parent: 'ncr', children: ['barangay-commonwealth', 'barangay-diliman', 'barangay-fairview', 'barangay-novaliches'] },
    { value: 'manila', label: 'Manila', parent: 'ncr', children: ['barangay-ermita', 'barangay-malate', 'barangay-binondo', 'barangay-santa-cruz'] },
    { value: 'makati', label: 'Makati', parent: 'ncr', children: ['barangay-poblacion', 'barangay-bel-air', 'barangay-salcedo', 'barangay-san-lorenzo'] },
    { value: 'taguig', label: 'Taguig', parent: 'ncr', children: ['barangay-bgc', 'barangay-fort-bonifacio', 'barangay-ususan'] },
    { value: 'pasig', label: 'Pasig', parent: 'ncr', children: ['barangay-ortigas', 'barangay-rosario', 'barangay-kapitolyo'] },
    
    // Central Visayas Cities
    { value: 'cebu-city', label: 'Cebu City', parent: 'region-7', children: ['barangay-lahug', 'barangay-capitol-site', 'barangay-guadalupe', 'barangay-talamban'] },
    { value: 'mandaue', label: 'Mandaue', parent: 'region-7', children: ['barangay-centro', 'barangay-alang-alang', 'barangay-canduman'] },
    { value: 'lapu-lapu', label: 'Lapu-Lapu', parent: 'region-7', children: ['barangay-poblacion-ll', 'barangay-pusok', 'barangay-gun-ob'] },
    
    // CALABARZON Cities
    { value: 'calamba', label: 'Calamba', parent: 'region-4a', children: ['barangay-real', 'barangay-parian', 'barangay-halang'] },
    { value: 'antipolo', label: 'Antipolo', parent: 'region-4a', children: ['barangay-dela-paz', 'barangay-san-roque', 'barangay-mayamot'] },
    
    // Central Luzon Cities
    { value: 'angeles', label: 'Angeles', parent: 'region-3', children: ['barangay-balibago', 'barangay-santo-domingo', 'barangay-cutcut'] },
    { value: 'san-fernando-cl', label: 'San Fernando', parent: 'region-3', children: ['barangay-dolores', 'barangay-santa-lucia', 'barangay-sindalan'] },
    
    // Davao Region Cities
    { value: 'davao-city', label: 'Davao City', parent: 'region-11', children: ['barangay-poblacion-dc', 'barangay-matina', 'barangay-buhangin', 'barangay-catalunan'] }
  ],
  
  barangay: [
    // Quezon City barangays
    { value: 'barangay-commonwealth', label: 'Barangay Commonwealth', parent: 'quezon-city', children: ['store-sm-commonwealth', 'store-robinsons-commonwealth', 'store-puregold-commonwealth'] },
    { value: 'barangay-diliman', label: 'Barangay Diliman', parent: 'quezon-city', children: ['store-sm-north', 'store-trinoma', 'store-up-shopping-center'] },
    { value: 'barangay-fairview', label: 'Barangay Fairview', parent: 'quezon-city', children: ['store-sm-fairview', 'store-ayala-fairview', 'store-nova-fairview'] },
    { value: 'barangay-novaliches', label: 'Barangay Novaliches', parent: 'quezon-city', children: ['store-sm-novaliches', 'store-savemore-novaliches'] },
    
    // Manila barangays
    { value: 'barangay-ermita', label: 'Barangay Ermita', parent: 'manila', children: ['store-robinson-manila', 'store-sm-manila', 'store-lucky-chinatown'] },
    { value: 'barangay-malate', label: 'Barangay Malate', parent: 'manila', children: ['store-harrison-plaza', 'store-midtown-mall'] },
    { value: 'barangay-binondo', label: 'Barangay Binondo', parent: 'manila', children: ['store-168-mall', 'store-tutuban'] },
    
    // Makati barangays
    { value: 'barangay-poblacion', label: 'Barangay Poblacion', parent: 'makati', children: ['store-greenbelt', 'store-glorietta', 'store-landmark-makati'] },
    { value: 'barangay-bel-air', label: 'Barangay Bel-Air', parent: 'makati', children: ['store-century-mall', 'store-powerplant'] },
    { value: 'barangay-salcedo', label: 'Barangay Salcedo', parent: 'makati', children: ['store-salcedo-market', 'store-legaspi-active'] },
    
    // Cebu City barangays
    { value: 'barangay-lahug', label: 'Barangay Lahug', parent: 'cebu-city', children: ['store-sm-cebu', 'store-ayala-cebu', 'store-robinson-galleria'] },
    { value: 'barangay-capitol-site', label: 'Barangay Capitol Site', parent: 'cebu-city', children: ['store-robinson-cebu', 'store-jy-square'] },
    { value: 'barangay-guadalupe', label: 'Barangay Guadalupe', parent: 'cebu-city', children: ['store-fooda-guadalupe', 'store-metro-guadalupe'] },
    
    // Davao City barangays
    { value: 'barangay-poblacion-dc', label: 'Barangay Poblacion', parent: 'davao-city', children: ['store-sm-davao', 'store-abreeza', 'store-gmall-davao'] },
    { value: 'barangay-matina', label: 'Barangay Matina', parent: 'davao-city', children: ['store-matina-town', 'store-gmall-matina'] }
  ],
  
  store: [
    // Metro Manila stores
    { value: 'store-sm-commonwealth', label: 'SM Commonwealth', parent: 'barangay-commonwealth', children: ['brand-oishi', 'brand-alaska', 'brand-del-monte'] },
    { value: 'store-sm-north', label: 'SM North EDSA', parent: 'barangay-diliman', children: ['brand-oishi', 'brand-del-monte', 'brand-peerless'] },
    { value: 'store-trinoma', label: 'TriNoma', parent: 'barangay-diliman', children: ['brand-alaska', 'brand-jti', 'brand-oishi'] },
    { value: 'store-greenbelt', label: 'Greenbelt', parent: 'barangay-poblacion', children: ['brand-del-monte', 'brand-alaska', 'brand-peerless'] },
    { value: 'store-glorietta', label: 'Glorietta', parent: 'barangay-poblacion', children: ['brand-oishi', 'brand-jti', 'brand-del-monte'] },
    
    // Cebu stores
    { value: 'store-sm-cebu', label: 'SM City Cebu', parent: 'barangay-lahug', children: ['brand-alaska', 'brand-peerless', 'brand-oishi'] },
    { value: 'store-ayala-cebu', label: 'Ayala Center Cebu', parent: 'barangay-lahug', children: ['brand-del-monte', 'brand-jti', 'brand-alaska'] },
    
    // Davao stores
    { value: 'store-sm-davao', label: 'SM Davao', parent: 'barangay-poblacion-dc', children: ['brand-oishi', 'brand-alaska', 'brand-del-monte'] },
    { value: 'store-abreeza', label: 'Abreeza Mall', parent: 'barangay-poblacion-dc', children: ['brand-peerless', 'brand-jti', 'brand-oishi'] }
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
  const hierarchy = ['region', 'city', 'barangay', 'store', 'brand', 'category', 'sku'];
  const currentIndex = hierarchy.indexOf(currentType);
  return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : currentType;
};
