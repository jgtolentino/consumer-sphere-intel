
import React, { createContext, useContext, ReactNode } from 'react';
import { MockDataService } from '../services/MockDataService';
import { RealDataService } from '../services/RealDataService';
import { getDataConfig } from '../config/dataConfig';

export interface DataService {
  getTransactions: (filters?: any) => Promise<any[]>;
  getRegionalData: () => Promise<any[]>;
  getBrandData: () => Promise<any[]>;
  getConsumerData: () => Promise<any>;
  getProductData: () => Promise<any>;
  // New methods for enhanced analytics
  getSubstitutionData?: () => Promise<any>;
  getBehavioralData?: () => Promise<any>;
  getLocationHierarchy?: () => Promise<any>;
}

const DataContext = createContext<DataService | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const config = getDataConfig();
  
  const dataService: DataService = config.mode === 'mock' 
    ? new MockDataService() 
    : new RealDataService(config.apiBaseUrl!);

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
