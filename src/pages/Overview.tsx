
import React from 'react';
import { KpiCard } from '../components/KpiCard';
import { AiRecommendationPanel } from '../components/AiRecommendationPanel';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { ChoroplethMap } from '../components/ChoroplethMap';
import { ShoppingCart, DollarSign, Package, MapPin } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useComprehensiveAnalytics } from '../hooks/useComprehensiveAnalytics';

const Overview: React.FC = () => {
  console.log('Overview component rendering - START');
  
  const { data: transactionData, isLoading } = useTransactions();
  const { data: analytics } = useComprehensiveAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Use real transaction data or fallback to mock data
  const totalTransactions = transactionData?.total || 0;
  const totalRevenue = transactionData?.totalValue || 0;
  const avgBasketSize = transactionData?.avgBasketSize || 0;
  const avgTransactionValue = transactionData?.avgTransactionValue || 0;
  
  const kpis = [
    {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: <ShoppingCart className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Gross Peso Value',
      value: `₱${(totalRevenue / 1000000).toFixed(1)}M`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Avg. Transaction Value',
      value: `₱${Math.round(avgTransactionValue)}`,
      change: '-2.1%',
      trend: 'down' as const,
      icon: <Package className="h-4 w-4 xl:h-5 xl:w-5" />
    },
    {
      title: 'Active Regions',
      value: '63',
      change: '+3 new',
      trend: 'up' as const,
      icon: <MapPin className="h-4 w-4 xl:h-5 xl:w-5" />
    }
  ];

  // Use real time series data or generate fallback
  const timeSeriesData = transactionData?.timeSeries || [
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
    <div className="min-h-screen bg-[#F5F6FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">TBWA Client Dashboard</h1>
            <p className="text-sm xl:text-base text-gray-600 mt-1">Alaska • Oishi • Peerless • Del Monte • JTI Performance Overview</p>
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

        {/* Choropleth Map */}
        <div className="w-full">
          <ChoroplethMap />
        </div>

        {/* TBWA Client Brand Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 xl:p-6">
          <h3 className="text-base xl:text-lg font-semibold mb-4 text-gray-900">TBWA Client Brand Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6">
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm xl:text-base">Alaska Milk</h4>
              <p className="text-xl xl:text-2xl font-bold text-blue-700 mt-2">₱2.1M</p>
              <p className="text-xs xl:text-sm text-blue-600">Dairy & Creamer Leader</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
              <h4 className="font-semibold text-teal-900 text-sm xl:text-base">Oishi</h4>
              <p className="text-xl xl:text-2xl font-bold text-teal-700 mt-2">₱1.8M</p>
              <p className="text-xs xl:text-sm text-teal-600">Snacks Market Leader</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-green-900 text-sm xl:text-base">Peerless</h4>
              <p className="text-xl xl:text-2xl font-bold text-green-700 mt-2">₱1.4M</p>
              <p className="text-xs xl:text-sm text-green-600">Champion & Calla</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <h4 className="font-semibold text-orange-900 text-sm xl:text-base">Del Monte</h4>
              <p className="text-xl xl:text-2xl font-bold text-orange-700 mt-2">₱1.2M</p>
              <p className="text-xs xl:text-sm text-orange-600">Juice & Food Products</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h4 className="font-semibold text-purple-900 text-sm xl:text-base">JTI</h4>
              <p className="text-xl xl:text-2xl font-bold text-purple-700 mt-2">₱950K</p>
              <p className="text-xs xl:text-sm text-purple-600">Winston & Camel</p>
            </div>
          </div>
        </div>

        {/* Regional Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 xl:p-6">
          <h3 className="text-base xl:text-lg font-semibold mb-4 text-gray-900">Top Performing Regions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm xl:text-base">National Capital Region</h4>
              <p className="text-xl xl:text-2xl font-bold text-blue-700 mt-2">₱4.2M</p>
              <p className="text-xs xl:text-sm text-blue-600">23% market share</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
              <h4 className="font-semibold text-teal-900 text-sm xl:text-base">CALABARZON</h4>
              <p className="text-xl xl:text-2xl font-bold text-teal-700 mt-2">₱3.1M</p>
              <p className="text-xs xl:text-sm text-teal-600">16% market share</p>
            </div>
            
            <div className="text-center p-3 xl:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-green-900 text-sm xl:text-base">Central Luzon</h4>
              <p className="text-xl xl:text-2xl font-bold text-green-700 mt-2">₱2.8M</p>
              <p className="text-xs xl:text-sm text-green-600">12% market share</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
