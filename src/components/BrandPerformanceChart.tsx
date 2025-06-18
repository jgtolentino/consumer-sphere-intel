
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

const brandData = [
  { name: 'Alaska', marketShare: 28, growth: 15, revenue: 4200000 },
  { name: 'Oishi', marketShare: 22, growth: 24, revenue: 3100000 },
  { name: 'Del Monte', marketShare: 18, growth: 12, revenue: 2800000 },
  { name: 'Champion', marketShare: 12, growth: 8, revenue: 1200000 },
  { name: 'Winston', marketShare: 20, growth: 5, revenue: 700000 }
];

const chartConfig = {
  marketShare: {
    label: "Market Share %",
    color: "hsl(var(--chart-1))",
  },
  growth: {
    label: "Growth %",
    color: "hsl(var(--chart-2))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-3))",
  },
};

interface BrandPerformanceChartProps {
  activeTab?: 'revenue' | 'marketShare' | 'growth';
}

export const BrandPerformanceChart: React.FC<BrandPerformanceChartProps> = ({ activeTab = 'revenue' }) => {
  const renderChart = () => {
    switch (activeTab) {
      case 'revenue':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`₱${(value / 1000000).toFixed(1)}M`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'marketShare':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${value}%`, 'Market Share']}
                />
                <Bar dataKey="marketShare" fill="var(--color-marketShare)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'growth':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${value}%`, 'Growth']}
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="var(--color-growth)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-growth)", strokeWidth: 2, r: 6 }}
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
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {activeTab === 'revenue' && 'Revenue Performance'}
          {activeTab === 'marketShare' && 'Market Share Distribution'}
          {activeTab === 'growth' && 'Growth Rate Comparison'}
        </h4>
        {renderChart()}
      </div>

      {/* Growth vs Market Share Scatter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Growth vs Market Share Analysis</h4>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="marketShare" name="Market Share" unit="%" />
              <YAxis dataKey="growth" name="Growth" unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter dataKey="growth" fill="var(--color-growth)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Brand Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900">Market Leader</h5>
          <p className="text-2xl font-bold text-blue-600">Alaska</p>
          <p className="text-sm text-blue-700">28% market share</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h5 className="font-medium text-green-900">Fastest Growing</h5>
          <p className="text-2xl font-bold text-green-600">Oishi</p>
          <p className="text-sm text-green-700">+24% growth</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h5 className="font-medium text-purple-900">Highest Revenue</h5>
          <p className="text-2xl font-bold text-purple-600">Alaska</p>
          <p className="text-sm text-purple-700">₱4.2M total</p>
        </div>
      </div>
    </div>
  );
};
