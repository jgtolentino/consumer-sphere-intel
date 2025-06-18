
import React from 'react';
import { Globe, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { GeoMap } from '../components/GeoMap';
import { ActiveFilters } from '../components/ActiveFilters';
import { useFilterStore } from '../state/useFilterStore';

interface RegionData {
  region: string;
  revenue: string;
  transactions: string;
  growth: string;
  marketShare: string;
}

const allRegionData: RegionData[] = [
  {
    region: 'Metro Manila',
    revenue: '₱4.2M',
    transactions: '53,247',
    growth: '+12.3%',
    marketShare: '34.0%'
  },
  {
    region: 'Cebu',
    revenue: '₱2.8M',
    transactions: '36,089',
    growth: '+8.7%',
    marketShare: '23.0%'
  },
  {
    region: 'Davao',
    revenue: '₱1.9M',
    transactions: '24,561',
    growth: '+18.2%',
    marketShare: '15.0%'
  },
  {
    region: 'Iloilo',
    revenue: '₱1.2M',
    transactions: '15,432',
    growth: '+6.5%',
    marketShare: '9.8%'
  },
  {
    region: 'Baguio',
    revenue: '₱950K',
    transactions: '12,876',
    growth: '+14.8%',
    marketShare: '7.7%'
  }
];

const Regional: React.FC = () => {
  const { barangays, setFilter } = useFilterStore();

  // Filter data based on selected regions
  const filteredRegionData = barangays.length > 0 
    ? allRegionData.filter(region => barangays.includes(region.region))
    : allRegionData;

  const handleRegionClick = (regionName: string) => {
    console.log('Table region clicked:', regionName);
    // Cross-filter: clicking a table row toggles region filter
    const currentRegions = barangays.includes(regionName) 
      ? barangays.filter(r => r !== regionName)
      : [...barangays, regionName];
    setFilter('barangays', currentRegions);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regional Analytics</h1>
          <p className="text-gray-600 mt-1">Geographic performance and market insights</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters />

      {/* Regional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Region</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRegionData.length > 0 ? filteredRegionData[0].region : 'Metro Manila'}
              </p>
              <p className="text-sm text-green-600">34% of total sales</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Regions</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRegionData.length > 0 ? filteredRegionData.length : 5}
              </p>
              <p className="text-sm text-green-600">
                {barangays.length > 0 ? 'Filtered view' : '+2 this quarter'}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Leader</p>
              <p className="text-2xl font-bold text-gray-900">Davao</p>
              <p className="text-sm text-green-600">+18.2% YoY</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Share</p>
              <p className="text-2xl font-bold text-gray-900">23.5%</p>
              <p className="text-sm text-green-600">+1.2% vs last quarter</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Geospatial Map */}
      <GeoMap />

      {/* Regional Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
          <p className="text-sm text-gray-600">
            {barangays.length > 0 
              ? `Showing ${filteredRegionData.length} filtered regions - click rows to toggle selection`
              : 'Click rows to filter by region - side-by-side comparison of regional metrics'
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

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Regional Data</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export to Excel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Regional;
