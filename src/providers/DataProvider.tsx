
import React, { createContext, useContext, ReactNode } from 'react';
import { RealDataService } from '../services/RealDataService';
import { getDataConfig } from '../config/dataConfig';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export interface DataService {
  getTransactions: (filters?: any) => Promise<any[]>;
  getRegionalData: () => Promise<any[]>;
  getBrandData: () => Promise<any[]>;
  getConsumerData: () => Promise<any>;
  getProductData: () => Promise<any>;
  getSubstitutionData?: () => Promise<any>;
  getBehavioralData?: () => Promise<any>;
  getLocationHierarchy?: () => Promise<any>;
  getCategoryMix: () => Promise<any[]>;
  getProductSubstitution: () => Promise<any[]>;
}

const DataContext = createContext<DataService | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Always use real data service - production only
  const config = getDataConfig();
  const dataService = new RealDataService(config.apiBaseUrl!);

  // Enable realtime sync for production data
  useRealtimeSync();

  console.log('🚀 Production mode active - real data only');

  return (
    <DataContext.Provider value={dataService}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataService = (): DataService => {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useDataService must be used within a DataProvider');
  }
  return context;
};
