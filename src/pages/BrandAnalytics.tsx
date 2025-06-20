
import React, { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Target } from 'lucide-react';
import { BrandPerformanceChart } from '../components/BrandPerformanceChart';

const BrandAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'marketShare' | 'growth'>('revenue');

  
  // TODO: Replace with proper data service call
  const [brandHealthData, setBrandHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setBrandHealthData(data);
        setBrandHealthData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6 bg-scout-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-scout-navy">Brand Analytics</h1>
          <p className="text-scout-dark mt-1">Brand performance and market share insights</p>
        </div>
        <div className="text-sm text-scout-dark scout-card px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      {/* Brand Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="scout-kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-scout-dark">Top Brand</p>
              <p className="text-2xl font-bold text-scout-navy">Alaska</p>
              <p className="text-sm text-scout-teal">28% market share</p>
            </div>
            <div className="p-2 bg-scout-teal bg-opacity-10 rounded-lg">
              <Star className="h-8 w-8 text-scout-teal" />
            </div>
          </div>
        </div>

        <div className="scout-kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-scout-dark">Fastest Growing</p>
              <p className="text-2xl font-bold text-scout-navy">Oishi</p>
              <p className="text-sm text-scout-teal">+24.5% YoY</p>
            </div>
            <div className="p-2 bg-scout-teal bg-opacity-10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-scout-teal" />
            </div>
          </div>
        </div>

        <div className="scout-kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-scout-dark">Most Consistent</p>
              <p className="text-2xl font-bold text-scout-navy">Del Monte</p>
              <p className="text-sm text-scout-teal">Low volatility</p>
            </div>
            <div className="p-2 bg-scout-teal bg-opacity-10 rounded-lg">
              <Award className="h-8 w-8 text-scout-teal" />
            </div>
          </div>
        </div>

        <div className="scout-kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-scout-dark">Total Brands</p>
              <p className="text-2xl font-bold text-scout-navy">5</p>
              <p className="text-sm text-scout-dark">Active brands</p>
            </div>
            <div className="p-2 bg-scout-teal bg-opacity-10 rounded-lg">
              <Target className="h-8 w-8 text-scout-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Performance Chart */}
      <div className="scout-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-scout-navy">Brand Performance Comparison</h3>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'revenue' 
                  ? 'bg-scout-teal bg-opacity-10 text-scout-teal border border-scout-teal border-opacity-30' 
                  : 'text-scout-dark hover:bg-scout-light'
              }`}
              onClick={() => setActiveTab('revenue')}
            >
              Revenue
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'marketShare' 
                  ? 'bg-scout-teal bg-opacity-10 text-scout-teal border border-scout-teal border-opacity-30' 
                  : 'text-scout-dark hover:bg-scout-light'
              }`}
              onClick={() => setActiveTab('marketShare')}
            >
              Market Share
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'growth' 
                  ? 'bg-scout-teal bg-opacity-10 text-scout-teal border border-scout-teal border-opacity-30' 
                  : 'text-scout-dark hover:bg-scout-light'
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
        <div className="scout-card p-6">
          <h3 className="text-lg font-semibold text-scout-navy mb-4">Market Share Trend</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-scout-teal rounded"></div>
                <span className="text-sm font-medium text-scout-navy">Alaska</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-scout-navy">28.0%</span>
                <span className="text-xs text-scout-teal ml-1">+1.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-scout-teal bg-opacity-80 rounded"></div>
                <span className="text-sm font-medium text-scout-navy">Oishi</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-scout-navy">22.5%</span>
                <span className="text-xs text-scout-teal ml-1">+2.8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-scout-teal bg-opacity-60 rounded"></div>
                <span className="text-sm font-medium text-scout-navy">Del Monte</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-scout-navy">19.2%</span>
                <span className="text-xs text-red-600 ml-1">-0.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Health Score */}
        <div className="scout-card p-6">
          <h3 className="text-lg font-semibold text-scout-navy mb-4">Brand Health Score</h3>
          <div className="space-y-4">
            {brandHealthData.map((brand, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-scout-navy">{brand.name}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-3 bg-scout-light rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-scout-teal transition-all duration-500 ease-out`}
                      style={{ 
                        width: `${brand.score}%`,
                        opacity: 1 - (index * 0.15)
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-scout-navy w-8 text-right">{brand.score}</span>
                  <div className={`w-2 h-2 rounded-full bg-scout-teal`} style={{ opacity: 1 - (index * 0.15) }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-scout-dark">
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
