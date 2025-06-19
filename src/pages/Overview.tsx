
import React from 'react';
import { KpiCard } from '../components/KpiCard';
import { AiRecommendationPanel } from '../components/AiRecommendationPanel';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { ChoroplethMap } from '../components/ChoroplethMap';
import { ShoppingCart, DollarSign, Package, MapPin } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useComprehensiveAnalytics } from '../hooks/useComprehensiveAnalytics';
import { getTopBrands } from '../data/mockData';
import { ActiveFilters } from '../components/ActiveFilters';
import { DrillDownBreadcrumb } from '../components/DrillDownBreadcrumb';

const Overview: React.FC = () => {
  console.log('Overview component rendering - START');
  
  // Use real transaction data from API and comprehensive analytics
  const { data: transactionData, isLoading, error } = useTransactions();
  const { data: analytics } = useComprehensiveAnalytics();

  // Calculate KPIs from real transaction data
  const totalTransactions = transactionData?.total || 0;
  const totalRevenue = transactionData?.totalValue || 0;
  const avgBasketSize = transactionData?.avgBasketSize || 0;
  const avgTransactionValue = transactionData?.avgTransactionValue || 0;
  const topBrands = getTopBrands();

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

  if (error) {
    console.error('Transaction data error:', error);
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load transaction data. Please check your connection and try again.
          </p>
          <p className="text-red-500 text-xs mt-2">Error: {error?.message}</p>
        </div>
      </div>
    );
  }
  
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

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TBWA Client Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Alaska • Oishi • Peerless • Del Monte • JTI Performance Overview
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              Last updated: {new Date().toLocaleString('en-PH')}
            </div>
          </div>

          <DrillDownBreadcrumb />
          <ActiveFilters />

          {/* KPI Cards with Scout styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              console.log('Rendering KPI card:', kpi.title);
              return (
                <KpiCard key={index} {...kpi} />
              );
            })}
          </div>

          {/* Charts and Insights */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 min-w-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h3>
                <TimeSeriesChart data={timeSeriesData} height={300} />
              </div>
            </div>
            
            <div className="min-w-0">
              <AiRecommendationPanel />
            </div>
          </div>

          {/* Choropleth Map with Scout card styling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
            <ChoroplethMap />
          </div>

          {/* TBWA Client Brand Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">TBWA Client Brand Performance</h3>
            <p className="text-sm text-gray-600 mb-6">
              All {analytics?.companyAnalytics?.length || 5} client brands - including complete coverage
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 text-base">Alaska Milk</h4>
                <p className="text-2xl font-bold text-blue-700 mt-2">₱2.1M</p>
                <p className="text-sm text-blue-600">Dairy & Creamer Leader</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <h4 className="font-semibold text-teal-900 text-base">Oishi</h4>
                <p className="text-2xl font-bold text-teal-700 mt-2">₱1.8M</p>
                <p className="text-sm text-teal-600">Snacks Market Leader</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 text-base">Peerless</h4>
                <p className="text-2xl font-bold text-green-700 mt-2">₱1.4M</p>
                <p className="text-sm text-green-600">Champion & Calla</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 text-base">Del Monte</h4>
                <p className="text-2xl font-bold text-orange-700 mt-2">₱1.2M</p>
                <p className="text-sm text-orange-600">Juice & Food Products</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 text-base">JTI</h4>
                <p className="text-2xl font-bold text-purple-700 mt-2">₱950K</p>
                <p className="text-sm text-purple-600">Winston & Camel</p>
              </div>
            </div>
          </div>

          {/* Regional Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Performing Regions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 text-base">National Capital Region</h4>
                <p className="text-2xl font-bold text-blue-700 mt-2">₱4.2M</p>
                <p className="text-sm text-blue-600">23% market share</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <h4 className="font-semibold text-teal-900 text-base">CALABARZON</h4>
                <p className="text-2xl font-bold text-teal-700 mt-2">₱3.1M</p>
                <p className="text-sm text-teal-600">16% market share</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 text-base">Central Luzon</h4>
                <p className="text-2xl font-bold text-green-700 mt-2">₱2.8M</p>
                <p className="text-sm text-green-600">12% market share</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
