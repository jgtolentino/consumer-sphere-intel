
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{
    date: string;
    volume: number;
    value: number;
  }>;
  height?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  height = 300 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No transaction data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Transaction Volume & Value Trends</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="volume" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Transaction Volume"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="value" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Transaction Value (₱)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
