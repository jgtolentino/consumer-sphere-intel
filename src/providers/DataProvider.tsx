
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { RealDataServiceV2 } from '../services/RealDataService.v2';
import { getDataConfig } from '../config/dataConfig';
import { useRealtimeSync, useAutoRefresh } from '../hooks/useRealtimeSync';
import { TransactionWithDetails, RegionalData, BrandPerformance, CategoryMix, ProductSubstitution, ConsumerInsight } from '../schema';
import { workflowOrchestrator } from '../orchestration/WorkflowOrchestrator';
import { agentRegistry } from '../orchestration/AgentRegistry';
import { killSwitch } from '../config/killSwitch';

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
    // Default to real data unless kill switch is enabled or explicitly set to mock
    const useRealData = !killSwitch.enabled && (config.mode === 'real' || !config.mode || config.mode === 'live');
    
    if (useRealData) {
      console.log('🚀 Initializing LIVE data service (Supabase) - Default mode');
      return new RealDataServiceV2(config.apiBaseUrl!);
    } else {
      console.log('🧪 Initializing MOCK data service (fallback/development)');
      return new MockDataServiceV2();
    }
  });

  // 🚀 AUTO-ATTACH: Enable realtime sync for real data mode
  const config = getDataConfig();
  const isRealDataMode = !killSwitch.enabled && config.mode === 'real';
  
  // Enable realtime sync when using real data
  useRealtimeSync();
  
  // Enable auto-refresh as fallback for mock data mode
  useAutoRefresh(!isRealDataMode, 30000);

  useEffect(() => {
    // Initialize agent registry on mount
    console.log('🤖 Initializing AI agent workflow system...');
    
    const handleDataModeChange = () => {
      const config = getDataConfig();
      // Default to real data unless explicitly set to mock or kill switch enabled
      const useRealData = !killSwitch.enabled && (config.mode === 'real' || !config.mode || config.mode === 'live');
      
      const newService = useRealData 
        ? new RealDataServiceV2(config.apiBaseUrl!) 
        : new MockDataServiceV2();
      
      setDataService(newService);
      
      console.log(`🔄 Data mode changed to: ${useRealData ? 'LIVE (default)' : 'MOCK (explicit)'}`);
      console.log(`${useRealData ? '✅ Realtime sync enabled' : '⏰ Mock data + agent fallback enabled'}`);
    };

    const handleKillSwitchChange = () => {
      console.log('🚨 Kill switch state changed - updating data service');
      handleDataModeChange();
    };

    // Listen for data mode and kill switch changes
    window.addEventListener('dataModeChanged', handleDataModeChange);
    window.addEventListener('killSwitchActivated', handleKillSwitchChange);
    window.addEventListener('killSwitchReset', handleKillSwitchChange);
    
    return () => {
      window.removeEventListener('dataModeChanged', handleDataModeChange);
      window.removeEventListener('killSwitchActivated', handleKillSwitchChange);
      window.removeEventListener('killSwitchReset', handleKillSwitchChange);
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
