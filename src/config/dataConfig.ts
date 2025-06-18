
export interface DataConfig {
  mode: 'mock' | 'real';
  mockDataPath?: string;
  apiBaseUrl?: string;
}

export const getDataConfig = (): DataConfig => {
  const mode = (import.meta.env.VITE_DATA_MODE || 'mock') as 'mock' | 'real';
  
  return {
    mode,
    mockDataPath: mode === 'mock' ? '/mock-data/scout-mockdata-full.yaml' : undefined,
    apiBaseUrl: mode === 'real' ? import.meta.env.VITE_API_BASE_URL : undefined
  };
};

export const isMockMode = () => getDataConfig().mode === 'mock';
