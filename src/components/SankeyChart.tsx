
import React from 'react';
import { useProductSubstitution } from '../hooks/useProductSubstitution';

export const SankeyChart: React.FC = () => {
  const { data: substitutionData, isLoading } = useProductSubstitution();

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const sankeyData = substitutionData || [];

  return (
    <div className="h-80 flex flex-col justify-center">
      <div className="space-y-4">
        {sankeyData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1 text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                {item.from}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-16 h-2 bg-gradient-to-r from-blue-300 to-green-300 rounded"></div>
              <span className="text-xs text-gray-500 font-medium">{item.flow}%</span>
            </div>
            <div className="flex-1">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                {item.to}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">Product substitution patterns based on customer purchase behavior</p>
      </div>
    </div>
  );
};
