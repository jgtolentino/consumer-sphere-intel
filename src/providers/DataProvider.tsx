
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { RealDataServiceV2 } from '../services/RealDataService.v2';
import { getDataConfig } from '../config/dataConfig';
import { useRealtimeSync, useAutoRefresh } from '../hooks/useRealtimeSync';
import { TransactionWithDetails, RegionalData, BrandPerformance, CategoryMix, ProductSubstitution, ConsumerInsight } from '../schema';

export interface DataService {
  getTransactions: (filters?: any) => Promise<TransactionWithDetails[]>;
  getRegionalData: () => Promise<RegionalData[]>;
  getBrandData: () => Promise<BrandPerformance[]>;
  getConsumerData: () => Promise<ConsumerInsight[]>;
  getProductData: () => Promise<any>;
  // Enhanced analytics methods
  getSubstitutionData?: () => Promise<any>;
  getBehavioralData?: () => Promise<any>;
  getLocationHierarchy?: () => Promise<any>;
  // Product Mix methods
  getCategoryMix: () => Promise<CategoryMix[]>;
  getProductSubstitution: () => Promise<ProductSubstitution[]>;
}

const DataContext = createContext<DataService | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [dataService, setDataService] = useState<DataService>(() => {
    const config = getDataConfig();
    // Always default to mock for public deployment to prevent auth issues
    return config.mode === 'mock' 
      ? new MockDataServiceV2() 
      : new RealDataServiceV2(config.apiBaseUrl!);
  });

  // 🚀 AUTO-ATTACH: Enable realtime sync for real data mode
  const config = getDataConfig();
  const isRealDataMode = config.mode === 'real';
  
  // Enable realtime sync when using real data
  useRealtimeSync();
  
  // Enable auto-refresh as fallback for mock data mode
  useAutoRefresh(!isRealDataMode, 30000);

  useEffect(() => {
    const handleDataModeChange = () => {
      const config = getDataConfig();
      const newService = config.mode === 'mock' 
        ? new MockDataServiceV2() 
        : new RealDataServiceV2(config.apiBaseUrl!);
      setDataService(newService);
      
      console.log(`🔄 Data mode changed to: ${config.mode}`);
      console.log(`${config.mode === 'real' ? '✅ Realtime sync enabled' : '⏰ Auto-refresh fallback enabled'}`);
    };

    // Listen for data mode changes
    window.addEventListener('dataModeChanged', handleDataModeChange);
    
    return () => {
      window.removeEventListener('dataModeChanged', handleDataModeChange);
    };
  }, []);

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
