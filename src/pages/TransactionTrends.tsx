import React from 'react';
import { Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { BoxPlot } from '../components/BoxPlot';
import { useTransactions } from '../hooks/useTransactions';

const TransactionTrends: React.FC = () => {
  console.log('TransactionTrends rendering with full content');

  const { data: transactionData, isLoading } = useTransactions();

  const timeRanges = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 90 days'];
  
  // Use real data if available, otherwise fallback to mock data
  const timeSeriesData = transactionData?.timeSeries || [
    { date: '2024-01-01', volume: 245, value: 18500 },
    { date: '2024-01-02', volume: 312, value: 23400 },
    { date: '2024-01-03', volume: 189, value: 14200 },
    { date: '2024-01-04', volume: 278, value: 20900 },
    { date: '2024-01-05', volume: 356, value: 26800 },
    { date: '2024-01-06', volume: 423, value: 31800 },
    { date: '2024-01-07', volume: 298, value: 22400 }
  ];

  const valueDistribution = transactionData?.valueDistribution || {
    min: 50,
    q1: 420,
    median: 847,
    q3: 1650,
    max: 8500
  };

  // Mock distribution data for box plot stats
  const distributionStats = [
    { range: '₱0-500', count: 2840, percentage: '18%' },
    { range: '₱500-1000', count: 4280, percentage: '27%' },
    { range: '₱1000-2000', count: 5120, percentage: '32%' },
    { range: '₱2000-5000', count: 2890, percentage: '18%' },
    { range: '₱5000+', count: 780, percentage: '5%' }
  ];

  // Mock hourly pattern data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    intensity: Math.floor(Math.random() * 100) + 20
  }));

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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

      {/* Time Series Chart */}
      <TimeSeriesChart data={timeSeriesData} height={400} />

      {/* Charts Grid - Updated to include BoxPlot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Distribution Analysis</h3>
          <div className="space-y-3">
            {distributionStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded" style={{ opacity: 1 - (index * 0.2) }}></div>
                  <span className="font-medium">{stat.range}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{stat.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{stat.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Shopping Time Heatmap</h3>
          <div className="grid grid-cols-6 gap-1">
            {hourlyData.map((data, index) => (
              <div
                key={index}
                className="aspect-square rounded text-xs flex items-center justify-center text-white font-medium"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${data.intensity / 100})`,
                  minHeight: '32px'
                }}
                title={`${data.hour}: ${data.intensity}% activity`}
              >
                {index % 4 === 0 ? data.hour.split(':')[0] : ''}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>Low Activity</span>
            <span>High Activity</span>
          </div>
        </div>
      </div>

      {/* Box Plot for Transaction Value Distribution */}
      <BoxPlot data={valueDistribution} height={300} />

      {/* Regional Transaction Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Regional Transaction Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900">Metro Manila</h4>
            <p className="text-2xl font-bold text-blue-700 mt-2">47,892</p>
            <p className="text-sm text-blue-600">transactions/day</p>
            <p className="text-xs text-blue-500 mt-1">+15% vs last month</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
            <h4 className="font-semibold text-teal-900">Cebu</h4>
            <p className="text-2xl font-bold text-teal-700 mt-2">28,456</p>
            <p className="text-sm text-teal-600">transactions/day</p>
            <p className="text-xs text-teal-500 mt-1">+8% vs last month</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <h4 className="font-semibold text-green-900">Davao</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">19,234</p>
            <p className="text-sm text-green-600">transactions/day</p>
            <p className="text-xs text-green-500 mt-1">+12% vs last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTrends;
