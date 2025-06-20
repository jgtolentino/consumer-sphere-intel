/**
 * Data Source Configuration
 * Enforces live data as default, mock only when explicitly requested
 */

// Environment-based data source with live as default
export const DATA_SOURCE = (import.meta.env.VITE_DATA_MODE || 'real').toLowerCase();

// Data source validation
export const isLiveDataMode = () => DATA_SOURCE === 'real' || DATA_SOURCE === 'live';
export const isMockDataMode = () => DATA_SOURCE === 'mock' || DATA_SOURCE === 'test';

// Data source display names
export const getDataSourceName = () => {
  switch (DATA_SOURCE) {
    case 'real':
    case 'live':
      return 'Live Data: Supabase';
    case 'mock':
    case 'test':
      return 'Mock Data';
    default:
      return 'Unknown Data Source';
  }
};

// Data source configuration
export const DATA_CONFIG = {
  source: DATA_SOURCE,
  isLive: isLiveDataMode(),
  isMock: isMockDataMode(),
  displayName: getDataSourceName(),
  expectedRecordCount: isLiveDataMode() ? 18000 : 5000,
  description: isLiveDataMode() 
    ? 'Production data from Supabase PostgreSQL'
    : 'Development data for testing and demos'
};

// Logging for debugging
console.log('🔧 Data Source Configuration:', {
  mode: DATA_SOURCE,
  isLive: DATA_CONFIG.isLive,
  expectedRecords: DATA_CONFIG.expectedRecordCount,
  description: DATA_CONFIG.description
});

// Environment validation warnings
if (typeof window !== 'undefined') {
  if (DATA_SOURCE === 'mock' && window.location.hostname !== 'localhost') {
    console.warn('⚠️  Mock data mode detected in production environment');
  }
  
  if (DATA_SOURCE === 'real' && !import.meta.env.VITE_SUPABASE_URL) {
    console.error('❌ Live data mode requires VITE_SUPABASE_URL environment variable');
  }
}

export default DATA_CONFIG;