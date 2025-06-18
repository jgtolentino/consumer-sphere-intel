
import React from 'react';
import { Globe, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { GeoMap } from '../components/GeoMap';
import { ActiveFilters } from '../components/ActiveFilters';
import { DrillDownBreadcrumb } from '../components/DrillDownBreadcrumb';
import { DrillDownPanel } from '../components/DrillDownPanel';
import { ComprehensiveFilterPanel } from '../components/ComprehensiveFilterPanel';
import { useComprehensiveAnalytics } from '../hooks/useComprehensiveAnalytics';
import { useDrillDownStore } from '../state/useDrillDownStore';

const Regional: React.FC = () => {
  const { data: analytics, isLoading } = useComprehensiveAnalytics();
  const { getCurrentContext } = useDrillDownStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = analytics?.totalMetrics.totalRevenue || 0;
  const totalTransactions = analytics?.totalMetrics.totalTransactions || 0;
  const avgTransactionValue = analytics?.totalMetrics.avgTransactionValue || 0;

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regional Analytics</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive TBWA Client Brands Performance - {getCurrentContext()}
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              Last updated: {new Date().toLocaleString('en-PH')}
            </div>
          </div>

          <DrillDownBreadcrumb />
          <ActiveFilters />

          {/* Comprehensive KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Context</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getCurrentContext()}
                  </p>
                  <p className="text-sm text-blue-600">
                    Complete dimension coverage
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{(totalRevenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-green-600">
                    All regions included
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-teal-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
                  <p className="text-sm text-green-600">Zero-filled analytics</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">₱{avgTransactionValue.toFixed(0)}</p>
                  <p className="text-sm text-green-600">Complete coverage</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <ComprehensiveFilterPanel />
          <DrillDownPanel />
          <GeoMap />

          {/* Comprehensive Regional Performance Table */}
          {analytics?.regionalAnalytics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Complete Regional Performance</h3>
                <p className="text-sm text-gray-600">
                  All {analytics.regionalAnalytics.length} regions shown - including zero counts
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.regionalAnalytics.map((region) => (
                      <tr 
                        key={region.region}
                        className={`hover:bg-gray-50 ${region.transactions === 0 ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {region.region}
                          {region.transactions === 0 && <span className="ml-2 text-gray-400">(No data)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {region.transactions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{(region.revenue / 1000).toFixed(1)}K
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {region.marketShare.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{region.avgTransactionValue.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Company Performance Analysis */}
          {analytics?.companyAnalytics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Company Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.companyAnalytics.map(company => (
                  <div 
                    key={company.company}
                    className={`p-4 rounded-lg border ${
                      company.isClient 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    } ${company.transactions === 0 ? 'opacity-60' : ''}`}
                  >
                    <h4 className={`font-semibold text-sm ${
                      company.isClient ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {company.company}
                      {company.isClient && <span className="ml-1 text-xs">(CLIENT)</span>}
                    </h4>
                    <p className={`text-xl font-bold mt-2 ${
                      company.isClient ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      ₱{(company.revenue / 1000).toFixed(1)}K
                    </p>
                    <p className={`text-xs ${
                      company.isClient ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {company.transactions} transactions • {company.marketShare.toFixed(1)}% share
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Regional;
