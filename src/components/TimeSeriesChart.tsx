
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

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> =({ 
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
      <h3 className="text-lg font-semibold mb-4 text-scout-navy">Transaction Volume & Value Trends</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#0A2540'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="volume" 
            stroke="#36CFC9" 
            strokeWidth={3}
            name="Transaction Volume"
            dot={{ fill: '#36CFC9', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="value" 
            stroke="#0A2540" 
            strokeWidth={3}
            name="Transaction Value (₱)"
            dot={{ fill: '#0A2540', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
