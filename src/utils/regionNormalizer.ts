
// src/utils/regionNormalizer.ts

// 1. Canonical region name map for PH (edit/add as needed)
import React from 'react';
export const REGION_NAME_MAP: Record<string, string> = {
  'ncr': 'National Capital Region',
  'nationalcapitalregion': 'National Capital Region',
  'calabarzon': 'CALABARZON',
  'southern tagalog': 'CALABARZON',
  'car': 'Cordillera Administrative Region',
  'cordilleraadministrativeregion': 'Cordillera Administrative Region',
  'regioni': 'Ilocos Region',
  'ilocosregion': 'Ilocos Region',
  'regionii': 'Cagayan Valley',
  'cagayanvalley': 'Cagayan Valley',
  'regioniii': 'Central Luzon',
  'centralluzon': 'Central Luzon',
  'regioniva': 'CALABARZON',
  'regionivb': 'MIMAROPA',
  'mimaropa': 'MIMAROPA',
  'regionv': 'Bicol Region',
  'bicolregion': 'Bicol Region',
  'regionvi': 'Western Visayas',
  'westernvisayas': 'Western Visayas',
  'regionvii': 'Central Visayas',
  'centralvisayas': 'Central Visayas',
  'regionviii': 'Eastern Visayas',
  'easternvisayas': 'Eastern Visayas',
  'regionix': 'Zamboanga Peninsula',
  'zamboangapeninsula': 'Zamboanga Peninsula',
  'regionx': 'Northern Mindanao',
  'northernmindanao': 'Northern Mindanao',
  'regionxi': 'Davao Region',
  'davaoregion': 'Davao Region',
  'regionxii': 'SOCCSKSARGEN',
  'soccsksargen': 'SOCCSKSARGEN',
  'regionxiii': 'Caraga',
  'caraga': 'Caraga',
  'armm': 'BARMM',
  'barmm': 'BARMM',
  'autonomousregioninmuslimmindanao': 'BARMM',
  'bangsamoroautonomousregioninmuslimmindanao': 'BARMM',
  // Additional common variations
  'metro manila': 'National Capital Region',
  'metromanila': 'National Capital Region',
  'manila': 'National Capital Region',
  'negros island region': 'Negros Island Region',
  'negrosisslandregion': 'Negros Island Region',
  'nir': 'Negros Island Region',
  // Abbreviations for other regions
  'ilocos': 'Ilocos Region',
  'cagayan': 'Cagayan Valley',
  'bicol': 'Bicol Region',
  'westernvis': 'Western Visayas',
  'centralvis': 'Central Visayas',
  'easternvis': 'Eastern Visayas',
  'zamboanga': 'Zamboanga Peninsula',
  'northernmind': 'Northern Mindanao',
  'davao': 'Davao Region',
  // Handle case variations
  'southerntagalog': 'CALABARZON'
};

// 2. Utility: normalize to slug for matching
export function normalizeRegionName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

// 3. Main: robust canonical matcher
export function getCanonicalRegionName(name: string): string {
  const slug = normalizeRegionName(name);
  return REGION_NAME_MAP[slug] || name;
}

// 4. Debug utility to check all region mappings
export function debugRegionMappings(geoRegions: string[], dataRegions: string[]): void {
  console.log('🗺️ REGION MAPPING DEBUG');
  console.log('======================');
  
  console.log('\n📍 GeoJSON Regions:');
  geoRegions.forEach(region => {
    const canonical = getCanonicalRegionName(region);
    console.log(`  ${region} → ${canonical}`);
  });
  
  console.log('\n📊 Data Regions:');
  dataRegions.forEach(region => {
    const canonical = getCanonicalRegionName(region);
    console.log(`  ${region} → ${canonical}`);
  });
  
  console.log('\n🔍 Match Analysis:');
  const canonicalGeo = geoRegions.map(getCanonicalRegionName);
  const canonicalData = dataRegions.map(getCanonicalRegionName);
  
  const matched = canonicalGeo.filter(geo => canonicalData.includes(geo));
  const unmatched = canonicalGeo.filter(geo => !canonicalData.includes(geo));
  
  console.log(`✅ Matched: ${matched.length}/${canonicalGeo.length}`);
  console.log(`❌ Unmatched: ${unmatched.length}`);
  
  if (unmatched.length > 0) {
    console.log('🚨 Unmatched regions:', unmatched);
  }
}
