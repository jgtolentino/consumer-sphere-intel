import React from 'react';
import { useDataMode } from '../hooks/useDataMode';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Database, TestTube, RefreshCw } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface DataModeToggleProps {
  variant?: 'button' | 'compact' | 'detailed';
  showLabel?: boolean;
  className?: string;
}

export const DataModeToggle: React.FC<DataModeToggleProps> = ({ 
  variant = 'button', 
  showLabel = true,
  className = ''
}) => {
  const { mode, toggleMode, isReal, isMock } = useDataMode();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge 
          variant={isReal ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={toggleMode}
        >
          {isReal ? (
            <>
              <Database className="h-3 w-3 mr-1" />
              Real Data
            </>
          ) : (
            <>
              <TestTube className="h-3 w-3 mr-1" />
              Mock Data
            </>
          )}
        </Badge>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isReal ? (
                <Database className="h-4 w-4 text-blue-600" />
              ) : (
                <TestTube className="h-4 w-4 text-orange-600" />
              )}
              <div>
                <div className="text-sm font-semibold">
                  {isReal ? 'Real Data Mode' : 'Mock Data Mode'}
                </div>
                <div className="text-xs text-gray-500">
                  {isReal 
                    ? 'Connected to live Supabase database' 
                    : 'Using 5,000 mock transactions for testing'
                  }
                </div>
              </div>
            </div>
            <Button
              onClick={toggleMode}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Switch
            </Button>
          </div>
          
          {/* QA Information */}
          {isMock && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
              <div className="text-xs text-orange-800">
                <strong>QA Mode:</strong> Using validated mock dataset for testing
              </div>
            </div>
          )}
          
          {isReal && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs text-blue-800">
                <strong>Live Mode:</strong> Connected to production data source
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={toggleMode}
      variant={isReal ? 'default' : 'secondary'}
      size="sm"
      className={`flex items-center space-x-2 ${className}`}
    >
      {isReal ? (
        <Database className="h-4 w-4" />
      ) : (
        <TestTube className="h-4 w-4" />
      )}
      
      {showLabel && (
        <span>
          {isReal ? 'Real Data' : 'Mock Data'}
        </span>
      )}
      
      <RefreshCw className="h-3 w-3" />
    </Button>
  );
};

// Status indicator component for header/footer
export const DataModeIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, isReal } = useDataMode();
  
  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      {isReal ? (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 font-medium">Live Data</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-orange-700 font-medium">Mock Data (QA)</span>
        </>
      )}
    </div>
  );
};