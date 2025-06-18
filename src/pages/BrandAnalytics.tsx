
import React from 'react';
import { Star, Award, TrendingUp, Target } from 'lucide-react';

const BrandAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Analytics</h1>
          <p className="text-gray-600 mt-1">Brand performance and market share insights</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      {/* Brand Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Brand</p>
              <p className="text-2xl font-bold text-gray-900">Alaska</p>
              <p className="text-sm text-green-600">28% market share</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fastest Growing</p>
              <p className="text-2xl font-bold text-gray-900">Oishi</p>
              <p className="text-sm text-green-600">+24.5% YoY</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Consistent</p>
              <p className="text-2xl font-bold text-gray-900">Del Monte</p>
              <p className="text-sm text-blue-600">Low volatility</p>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-600">Active brands</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Brand Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Brand Performance Comparison</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">Revenue</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Market Share</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Growth</button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Brand comparison chart will be displayed here</p>
        </div>
      </div>

      {/* Brand Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Market Share */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share Trend</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium">Alaska</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">28.0%</span>
                <span className="text-xs text-green-600 ml-1">+1.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium">Oishi</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">22.5%</span>
                <span className="text-xs text-green-600 ml-1">+2.8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium">Del Monte</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">19.2%</span>
                <span className="text-xs text-red-600 ml-1">-0.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Health Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Health Score</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alaska</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-bold">85</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Oishi</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-bold">78</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Del Monte</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/5 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-bold">72</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAnalytics;
