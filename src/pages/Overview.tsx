
import React from 'react';
import { KpiCard } from '../components/KpiCard';
import { AiRecommendationPanel } from '../components/AiRecommendationPanel';
import { ShoppingCart, DollarSign, Package, MapPin } from 'lucide-react';

const Overview: React.FC = () => {
  const kpis = [
    {
      title: 'Total Transactions',
      value: '156,847',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      title: 'Gross Peso Value',
      value: '₱12.4M',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: 'Avg. Basket Size',
      value: '₱847',
      change: '-2.1%',
      trend: 'down' as const,
      icon: <Package className="h-5 w-5" />
    },
    {
      title: 'Active Locations',
      value: '47',
      change: '+3 new',
      trend: 'up' as const,
      icon: <MapPin className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600 mt-1">Philippine retail market performance dashboard</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Transaction Volume Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg">
            <p className="text-gray-500">Chart visualization will be rendered here</p>
          </div>
        </div>
        
        <AiRecommendationPanel />
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Regional Performance Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900">Metro Manila</h4>
            <p className="text-2xl font-bold text-blue-700 mt-2">₱4.2M</p>
            <p className="text-sm text-blue-600">34% of total sales</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
            <h4 className="font-semibold text-teal-900">Cebu</h4>
            <p className="text-2xl font-bold text-teal-700 mt-2">₱2.8M</p>
            <p className="text-sm text-teal-600">23% of total sales</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <h4 className="font-semibold text-green-900">Davao</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">₱1.9M</p>
            <p className="text-sm text-green-600">15% of total sales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
