import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Database, TestTube, Wifi, WifiOff } from 'lucide-react';
import { useDataService } from '../providers/DataProvider';

interface DataSourceBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('live');
  const [recordCount, setRecordCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  
  const dataService = useDataService();

  useEffect(() => {
    const checkDataSource = async () => {
      try {
        // Determine data source by checking record count and response patterns
        const transactions = await dataService.getTransactions();
        const count = transactions.length;
        
        setRecordCount(count);
        setIsConnected(true);
        
        // Heuristic: Mock usually has exactly 5000, real has 18000+
        if (count >= 15000) {
          setDataSource('live');
        } else if (count >= 4000 && count <= 6000) {
          setDataSource('mock');
        } else {
          // Ambiguous count, check environment
          const envMode = import.meta.env.VITE_DATA_MODE?.toLowerCase();
          setDataSource(envMode === 'mock' ? 'mock' : 'live');
        }
        
        setLastChecked(new Date());
      } catch (error) {
        console.error('Data source check failed:', error);
        setIsConnected(false);
        // Default to live mode if connection fails
        setDataSource('live');
      }
    };

    checkDataSource();
    
    // Check every 30 seconds
    const interval = setInterval(checkDataSource, 30000);
    
    return () => clearInterval(interval);
  }, [dataService]);

  const getBadgeVariant = () => {
    if (!isConnected) return 'destructive' as const;
    return dataSource === 'live' ? 'default' as const : 'secondary' as const;
  };

  const getIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (dataSource === 'live') return <Database className="h-3 w-3" />;
    return <TestTube className="h-3 w-3" />;
  };

  const getDisplayText = () => {
    if (!isConnected) return 'Disconnected';
    
    if (showDetails) {
      return dataSource === 'live' 
        ? `Live: ${recordCount.toLocaleString()} records`
        : `Mock: ${recordCount.toLocaleString()} records`;
    }
    
    return dataSource === 'live' ? 'Live Data' : 'Mock Data';
  };

  const getDescription = () => {
    if (!isConnected) return 'Unable to connect to data service';
    
    return dataSource === 'live'
      ? 'Real-time data from Supabase PostgreSQL'
      : 'Development data for testing and demos';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge 
        variant={getBadgeVariant()}
        className="flex items-center space-x-1"
        title={getDescription()}
      >
        {getIcon()}
        <span className="text-xs font-medium">{getDisplayText()}</span>
      </Badge>
      
      {showDetails && (
        <div className="text-xs text-gray-500">
          <div>Updated: {lastChecked.toLocaleTimeString()}</div>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <><Wifi className="h-3 w-3 text-green-500" /><span>Connected</span></>
            ) : (
              <><WifiOff className="h-3 w-3 text-red-500" /><span>Disconnected</span></>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for navigation bars
export const DataSourceIndicator: React.FC = () => (
  <DataSourceBadge showDetails={false} className="ml-auto" />
);

// Detailed version for settings/admin panels
export const DataSourceStatus: React.FC = () => (
  <DataSourceBadge showDetails={true} className="w-full justify-between" />
);

export default DataSourceBadge;