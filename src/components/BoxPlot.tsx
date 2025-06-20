
import React, { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Transform data for box plot visualization
  
  // TODO: Replace with proper data service call
  const [boxPlotData, setBoxPlotData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setBoxPlotData(data);
        setBoxPlotData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <h4 className="font-semibold text-scout-navy mb-2">Transaction Value Distribution</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Maximum:</span>
              <span className="font-medium text-scout-navy">₱{data.max.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Q3 (75th percentile):</span>
              <span className="font-medium text-scout-navy">₱{data.q3.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Median (50th percentile):</span>
              <span className="font-medium text-scout-teal">₱{data.median.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Q1 (25th percentile):</span>
              <span className="font-medium text-scout-navy">₱{data.q1.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum:</span>
              <span className="font-medium text-scout-navy">₱{data.min.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart
          data={boxPlotData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
            domain={[0, 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Lower whisker */}
          <Bar 
            dataKey="min" 
            fill="#36CFC9" 
            opacity={0.3}
            stroke="#36CFC9"
            strokeWidth={2}
          />
          
          {/* IQR Box */}
          <Bar 
            dataKey="box" 
            fill="#36CFC9" 
            opacity={0.6}
            stroke="#0A2540"
            strokeWidth={1}
            stackId="box"
          />
          
          {/* Median line visualization */}
          <Bar 
            dataKey="median" 
            fill="#0A2540" 
            opacity={0.8}
            stroke="#0A2540"
            strokeWidth={3}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Stats summary below chart */}
      <div className="grid grid-cols-5 gap-2 mt-4 text-center text-xs">
        <div className="p-2 bg-scout-light rounded">
          <div className="font-semibold text-scout-navy">Min</div>
          <div className="text-scout-dark">₱{data.min.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-scout-light rounded">
          <div className="font-semibold text-scout-navy">Q1</div>
          <div className="text-scout-dark">₱{data.q1.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-scout-teal bg-opacity-10 rounded">
          <div className="font-semibold text-scout-teal">Median</div>
          <div className="text-scout-navy font-medium">₱{data.median.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-scout-light rounded">
          <div className="font-semibold text-scout-navy">Q3</div>
          <div className="text-scout-dark">₱{data.q3.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-scout-light rounded">
          <div className="font-semibold text-scout-navy">Max</div>
          <div className="text-scout-dark">₱{data.max.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
