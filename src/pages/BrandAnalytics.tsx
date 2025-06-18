
import React, { useState } from 'react';
import { Star, Award, TrendingUp, Target } from 'lucide-react';
import { BrandPerformanceChart } from '../components/BrandPerformanceChart';

const BrandAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'marketShare' | 'growth'>('revenue');

  const brandHealthData = [
    { name: 'Alaska', score: 85, color: 'bg-green-500' },
    { name: 'Oishi', score: 78, color: 'bg-blue-500' },
    { name: 'Del Monte', score: 72, color: 'bg-yellow-500' },
    { name: 'Champion', score: 68, color: 'bg-orange-500' },
    { name: 'Winston', score: 65, color: 'bg-red-500' }
  ];

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
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'revenue' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('revenue')}
            >
              Revenue
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'marketShare' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('marketShare')}
            >
              Market Share
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'growth' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('growth')}
            >
              Growth
            </button>
          </div>
        </div>
        <BrandPerformanceChart activeTab={activeTab} />
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
            {brandHealthData.map((brand, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{brand.name}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${brand.color} transition-all duration-500 ease-out`}
                      style={{ width: `${brand.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{brand.score}</span>
                  <div className={`w-2 h-2 rounded-full ${brand.color}`}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor (0-40)</span>
              <span>Fair (41-60)</span>
              <span>Good (61-80)</span>
              <span>Excellent (81-100)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAnalytics;
