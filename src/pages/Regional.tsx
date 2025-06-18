
import React from 'react';
import { Globe, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

const Regional: React.FC = () => {
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

      {/* Regional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Region</p>
              <p className="text-2xl font-bold text-gray-900">Metro Manila</p>
              <p className="text-sm text-green-600">34% of total sales</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Regions</p>
              <p className="text-2xl font-bold text-gray-900">17</p>
              <p className="text-sm text-green-600">+2 this quarter</p>
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

      {/* Regional Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
          <p className="text-sm text-gray-600">Side-by-side comparison of regional metrics</p>
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
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Metro Manila</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱4.2M</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">53,247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+12.3%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">34.0%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cebu</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱2.8M</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">36,089</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+8.7%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">23.0%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Davao</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱1.9M</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24,561</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+18.2%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15.0%</td>
              </tr>
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
