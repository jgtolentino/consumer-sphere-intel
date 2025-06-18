import React from 'react';
import { KpiCard } from '../components/KpiCard';
import { AiRecommendationPanel } from '../components/AiRecommendationPanel';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { MapboxBubbleMap } from '../components/MapboxBubbleMap';
import { ShoppingCart, DollarSign, Package, MapPin } from 'lucide-react';

const Overview: React.FC = () => {
  console.log('Overview component rendering - START');
  
  const kpis = [
    {
      title: 'Total Transactions',
      value: '156,847',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <ShoppingCart className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Gross Peso Value',
      value: '₱12.4M',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Avg. Basket Size',
      value: '₱847',
      change: '-2.1%',
      trend: 'down' as const,
      icon: <Package className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Active Locations',
      value: '47',
      change: '+3 new',
      trend: 'up' as const,
      icon: <MapPin className="h-4 w-4 xl:h-5 xl:w-5" />
    }
  ];

  // Mock time series data for the chart
  const timeSeriesData = [
    { date: '2024-01-01', volume: 245, value: 18500 },
    { date: '2024-01-02', volume: 312, value: 23400 },
    { date: '2024-01-03', volume: 189, value: 14200 },
    { date: '2024-01-04', volume: 278, value: 20900 },
    { date: '2024-01-05', volume: 356, value: 26800 },
    { date: '2024-01-06', volume: 423, value: 31800 },
    { date: '2024-01-07', volume: 298, value: 22400 }
  ];

  console.log('KPIs data:', kpis);
  console.log('About to render Overview JSX');

  return (
    <div className="space-y-4 xl:space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 truncate">Overview</h1>
          <p className="text-sm xl:text-base text-gray-600 mt-1">Philippine retail market performance dashboard</p>
        </div>
        <div className="text-xs xl:text-sm text-gray-500 bg-white px-3 xl:px-4 py-2 rounded-lg border whitespace-nowrap">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {kpis.map((kpi, index) => {
          console.log('Rendering KPI card:', kpi.title);
          return (
            <KpiCard key={index} {...kpi} />
          );
        })}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
        <div className="xl:col-span-2 min-w-0">
          <TimeSeriesChart data={timeSeriesData} height={300} />
        </div>
        
        <div className="min-w-0">
          <AiRecommendationPanel />
        </div>
      </div>

      {/* Mapbox Bubble Map */}
      <MapboxBubbleMap />

      {/* Regional Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 xl:p-6">
        <h3 className="text-base xl:text-lg font-semibold mb-4 text-gray-900">Regional Performance Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
          <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 text-sm xl:text-base">Metro Manila</h4>
            <p className="text-xl xl:text-2xl font-bold text-blue-700 mt-2">₱4.2M</p>
            <p className="text-xs xl:text-sm text-blue-600">34% of total sales</p>
          </div>
          
          <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
            <h4 className="font-semibold text-teal-900 text-sm xl:text-base">Cebu</h4>
            <p className="text-xl xl:text-2xl font-bold text-teal-700 mt-2">₱2.8M</p>
            <p className="text-xs xl:text-sm text-teal-600">23% of total sales</p>
          </div>
          
          <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <h4 className="font-semibold text-green-900 text-sm xl:text-base">Davao</h4>
            <p className="text-xl xl:text-2xl font-bold text-green-700 mt-2">₱1.9M</p>
            <p className="text-xs xl:text-sm text-green-600">15% of total sales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
