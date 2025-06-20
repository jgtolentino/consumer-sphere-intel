
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

// Use Scout Analytics brand colors
const chartConfig = {
  marketShare: {
    label: "Market Share %",
    color: "#36CFC9", // Scout teal
  },
  growth: {
    label: "Growth %",
    color: "#0A2540", // Scout navy
  },
  revenue: {
    label: "Revenue",
    color: "#2F3A4F", // Scout dark
  },
};

interface BrandPerformanceChartProps {
  activeTab?: 'revenue' | 'marketShare' | 'growth';
}

export const BrandPerformanceChart: React.FC<BrandPerformanceChartProps> = ({ activeTab = 'revenue' }) => {
  // TODO: Replace with proper data service call
  const [brandData, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setBrandData(data);
        setBrandData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderChart = () => {
    switch (activeTab) {
      case 'revenue':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`₱${(value / 1000000).toFixed(1)}M`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2F3A4F" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'marketShare':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `${value}%`} 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${value}%`, 'Market Share']}
                />
                <Bar dataKey="marketShare" fill="#36CFC9" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'growth':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis 
                  tickFormatter={(value) => `${value}%`} 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${value}%`, 'Growth']}
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#0A2540" 
                  strokeWidth={3}
                  dot={{ fill: "#0A2540", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Chart */}
      <div>
        <h4 className="text-sm font-medium text-scout-dark mb-3">
          {activeTab === 'revenue' && 'Revenue Performance'}
          {activeTab === 'marketShare' && 'Market Share Distribution'}
          {activeTab === 'growth' && 'Growth Rate Comparison'}
        </h4>
        {renderChart()}
      </div>

      {/* Growth vs Market Share Scatter */}
      <div>
        <h4 className="text-sm font-medium text-scout-dark mb-3">Growth vs Market Share Analysis</h4>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="marketShare" 
                name="Market Share" 
                unit="%" 
                stroke="#64748b" 
                fontSize={12}
              />
              <YAxis 
                dataKey="growth" 
                name="Growth" 
                unit="%" 
                stroke="#64748b" 
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter dataKey="growth" fill="#0A2540" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Brand Summary Cards - Fixed colors to Scout branding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-scout-teal/10 p-4 rounded-lg border border-scout-teal/20">
          <h5 className="font-medium text-scout-navy">Market Leader</h5>
          <p className="text-2xl font-bold text-scout-navy">Alaska</p>
          <p className="text-sm text-scout-dark">28% market share</p>
        </div>
        <div className="bg-scout-teal/10 p-4 rounded-lg border border-scout-teal/20">
          <h5 className="font-medium text-scout-navy">Fastest Growing</h5>
          <p className="text-2xl font-bold text-scout-navy">Oishi</p>
          <p className="text-sm text-scout-dark">+24% growth</p>
        </div>
        <div className="bg-scout-teal/10 p-4 rounded-lg border border-scout-teal/20">
          <h5 className="font-medium text-scout-navy">Highest Revenue</h5>
          <p className="text-2xl font-bold text-scout-navy">Alaska</p>
          <p className="text-sm text-scout-dark">₱4.2M total</p>
        </div>
      </div>
    </div>
  );
};
