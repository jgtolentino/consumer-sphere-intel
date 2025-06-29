
export interface DataConfig {
  mode: 'mock' | 'real';
  mockDataPath?: string;
  apiBaseUrl?: string;
}

export const getDataConfig = (): DataConfig => {
  // Check localStorage first for runtime mode switching
  const runtimeMode = localStorage.getItem('dataMode') as 'mock' | 'real' | null;
  const envMode = (import.meta.env.VITE_DATA_MODE || 'mock') as 'mock' | 'real';
  
  // For public deployment, default to mock mode unless explicitly set
  // This prevents auth issues on public Vercel deployment
  const mode = runtimeMode || envMode;
  
  return {
    mode,
    mockDataPath: mode === 'mock' ? '/mock-data/scout-mockdata-full.yaml' : undefined,
    apiBaseUrl: mode === 'real' ? import.meta.env.VITE_API_BASE_URL : undefined
  };
};

export const isMockMode = () => getDataConfig().mode === 'mock';
