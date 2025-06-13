
import React from 'react';
import { Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';

const TransactionTrends: React.FC = () => {
  const timeRanges = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 90 days'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Trends</h1>
          <p className="text-gray-600 mt-1">Analyze transaction patterns and volume trends</p>
        </div>
      </div>
      
      {/* Time Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {timeRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Hour</p>
              <p className="text-xl font-bold text-gray-900">2:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Transaction Time</p>
              <p className="text-xl font-bold text-gray-900">3.2 min</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Growth</p>
              <p className="text-xl font-bold text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Trend</p>
              <p className="text-xl font-bold text-gray-900">+8.7%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Volume & Value Trends</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Time series chart showing transaction volume and value over time</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Value Distribution</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">Box plot showing transaction value distribution and outliers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Patterns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Hourly Transaction Patterns</h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <div className="text-center">
            <Clock className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <p className="text-gray-500">Heatmap showing transaction intensity by hour and day of week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTrends;
