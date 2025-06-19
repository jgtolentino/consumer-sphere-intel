
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { MockDataService } from '../services/MockDataService';
import { RealDataService } from '../services/RealDataService';
import { getDataConfig } from '../config/dataConfig';
import { useRealtimeSync, useAutoRefresh } from '../hooks/useRealtimeSync';

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
  const [dataService, setDataService] = useState<DataService>(() => {
    const config = getDataConfig();
    return config.mode === 'mock' 
      ? new MockDataService() 
      : new RealDataService(config.apiBaseUrl!);
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
        ? new MockDataService() 
        : new RealDataService(config.apiBaseUrl!);
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
