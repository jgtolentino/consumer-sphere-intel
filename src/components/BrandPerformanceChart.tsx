
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

const brandData = [
  { name: 'Samsung', marketShare: 28, growth: 15, revenue: 4200000 },
  { name: 'Nestle', marketShare: 22, growth: 8, revenue: 3100000 },
  { name: 'Unilever', marketShare: 18, growth: 12, revenue: 2800000 },
  { name: 'Nike', marketShare: 12, growth: 22, revenue: 1200000 },
  { name: 'Coca-Cola', marketShare: 20, growth: 5, revenue: 700000 }
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

export const BrandPerformanceChart: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Market Share Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Market Share by Brand</h4>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="marketShare" fill="var(--color-marketShare)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
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
          <p className="text-2xl font-bold text-blue-600">Samsung</p>
          <p className="text-sm text-blue-700">28% market share</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h5 className="font-medium text-green-900">Fastest Growing</h5>
          <p className="text-2xl font-bold text-green-600">Nike</p>
          <p className="text-sm text-green-700">+22% growth</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h5 className="font-medium text-purple-900">Highest Revenue</h5>
          <p className="text-2xl font-bold text-purple-600">Samsung</p>
          <p className="text-sm text-purple-700">₱4.2M total</p>
        </div>
      </div>
    </div>
  );
};
