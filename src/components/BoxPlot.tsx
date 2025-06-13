
import React from 'react';

interface BoxPlotProps {
  data: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  height?: number;
}

export const BoxPlot: React.FC<BoxPlotProps> = ({ data, height = 300 }) => {
  if (!data || data.max === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No value distribution data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Transaction Value Distribution</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Maximum:</span>
          <span className="font-medium">₱{data.max.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Q3 (75th percentile):</span>
          <span className="font-medium">₱{data.q3.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Median:</span>
          <span className="font-medium">₱{data.median.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Q1 (25th percentile):</span>
          <span className="font-medium">₱{data.q1.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Minimum:</span>
          <span className="font-medium">₱{data.min.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
