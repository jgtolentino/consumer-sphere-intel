
import React from 'react';
import { ChevronDown, MapPin, Building, Store } from 'lucide-react';
import { useDrillDownStore, DrillLevel } from '../state/useDrillDownStore';

export const DrillDownPanel: React.FC = () => {
  const { drillPath, currentLevel, availableOptions, drillDown } = useDrillDownStore();

  const getAvailableOptionsForCurrentLevel = () => {
    if (drillPath.length === 0) {
      return availableOptions.region || [];
    }

    const lastLevel = drillPath[drillPath.length - 1];
    const currentData = availableOptions[currentLevel as keyof typeof availableOptions] || [];
    
    return currentData.filter((item: any) => item.parent === lastLevel.value);
  };

  const handleDrillDown = (option: any) => {
    const newLevel: DrillLevel = {
      type: currentLevel as any,
      value: option.value,
      label: option.label
    };
    drillDown(newLevel);
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'region':
      case 'province': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'city':
      case 'barangay': return <Building className="h-4 w-4 text-green-500" />;
      case 'store': return <Store className="h-4 w-4 text-purple-500" />;
      default: return <ChevronDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const options = getAvailableOptionsForCurrentLevel();

  if (options.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <p className="text-gray-500">No further drill-down options available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          {getIcon(currentLevel)}
          <span className="ml-2">Drill Down to {currentLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Click on any option below to explore deeper
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {options.map((option: any) => (
            <button
              key={option.value}
              onClick={() => handleDrillDown(option)}
              className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left"
            >
              {getIcon(currentLevel)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">{option.label}</p>
                {option.children && (
                  <p className="text-xs text-gray-500">
                    {option.children.length} sub-locations
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
