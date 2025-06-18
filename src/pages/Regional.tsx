
import React from 'react';
import { Globe, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { GeoMap } from '../components/GeoMap';
import { ActiveFilters } from '../components/ActiveFilters';
import { DrillDownBreadcrumb } from '../components/DrillDownBreadcrumb';
import { DrillDownPanel } from '../components/DrillDownPanel';
import { useFilterStore } from '../state/useFilterStore';
import { useDrillDownStore } from '../state/useDrillDownStore';
import { getRegionalData } from '../data/mockData';

const Regional: React.FC = () => {
  const { barangays, setFilter } = useFilterStore();
  const { drillPath, getCurrentContext } = useDrillDownStore();

  // Use realistic regional data from mock data
  const allRegionData = getRegionalData();
  
  const filteredRegionData = barangays.length > 0 
    ? allRegionData.filter(region => barangays.includes(region.region))
    : allRegionData.slice(0, 8); // Show top 8 regions

  const handleRegionClick = (regionName: string) => {
    console.log('Table region clicked:', regionName);
    const currentRegions = barangays.includes(regionName) 
      ? barangays.filter(r => r !== regionName)
      : [...barangays, regionName];
    setFilter('barangays', currentRegions);
  };

  // Calculate totals from filtered data
  const totalRevenue = filteredRegionData.reduce((sum, region) => 
    sum + parseFloat(region.revenue.replace(/[₱M]/g, '')), 0
  );
  
  const totalTransactions = filteredRegionData.reduce((sum, region) => 
    sum + parseInt(region.transactions.replace(/,/g, '')), 0
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regional Analytics</h1>
              <p className="text-gray-600 mt-1">
                TBWA Client Brands Performance - {getCurrentContext()}
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              Last updated: {new Date().toLocaleString('en-PH')}
            </div>
          </div>

          <DrillDownBreadcrumb />
          <ActiveFilters />

          {/* Regional KPIs - Updated with realistic data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Context</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getCurrentContext()}
                  </p>
                  <p className="text-sm text-blue-600">
                    Level: {drillPath.length > 0 ? drillPath[drillPath.length - 1].type : 'Region'}
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
                    ₱{totalRevenue.toFixed(1)}M
                  </p>
                  <p className="text-sm text-green-600">
                    {filteredRegionData.length} regions
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
                  <p className="text-sm text-green-600">+12.3% average growth</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performer</p>
                  <p className="text-2xl font-bold text-gray-900">NCR</p>
                  <p className="text-sm text-green-600">23% market share</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <DrillDownPanel />
          <GeoMap />

          {/* Regional Performance Table - Updated with TBWA brand focus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">TBWA Client Brand Performance by Region</h3>
              <p className="text-sm text-gray-600">
                {barangays.length > 0 
                  ? `Showing ${filteredRegionData.length} filtered regions - Alaska, Oishi, Peerless, Del Monte, JTI`
                  : `Showing top ${filteredRegionData.length} regions - click rows to filter`
                }
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegionData.map((region) => {
                    const isSelected = barangays.includes(region.region);
                    return (
                      <tr 
                        key={region.region}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleRegionClick(region.region)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {region.region}
                          {isSelected && <span className="ml-2 text-blue-600">✓</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.revenue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.transactions}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{region.growth}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.marketShare}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Brand Performance by Region */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">TBWA Client Brand Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-sm">Alaska Milk</h4>
                <p className="text-xl font-bold text-blue-700 mt-2">₱2.1M</p>
                <p className="text-xs text-blue-600">Dairy & Creamer</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                <h4 className="font-semibold text-teal-900 text-sm">Oishi</h4>
                <p className="text-xl font-bold text-teal-700 mt-2">₱1.8M</p>
                <p className="text-xs text-teal-600">Snacks & Beverages</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <h4 className="font-semibold text-green-900 text-sm">Peerless</h4>
                <p className="text-xl font-bold text-green-700 mt-2">₱1.4M</p>
                <p className="text-xs text-green-600">Laundry & Personal Care</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <h4 className="font-semibold text-orange-900 text-sm">Del Monte</h4>
                <p className="text-xl font-bold text-orange-700 mt-2">₱1.2M</p>
                <p className="text-xs text-orange-600">Juice & Food</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <h4 className="font-semibold text-purple-900 text-sm">JTI</h4>
                <p className="text-xl font-bold text-purple-700 mt-2">₱950K</p>
                <p className="text-xs text-purple-600">Tobacco</p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Regional Data</h3>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export TBWA Brand Performance
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Export Regional Drill-Down
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Regional;
