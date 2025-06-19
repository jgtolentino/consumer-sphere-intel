
import React from 'react';
import { MapPin, TrendingUp } from 'lucide-react';

interface RegionHeatmapData {
  region: string;
  value: number;
  percentage: number;
  growth: number;
  coordinates: { x: number; y: number };
}

const heatmapData: RegionHeatmapData[] = [
  {
    region: 'Metro Manila',
    value: 4200000,
    percentage: 34,
    growth: 12.3,
    coordinates: { x: 60, y: 45 }
  },
  {
    region: 'Cebu',
    value: 2800000,
    percentage: 23,
    growth: 8.7,
    coordinates: { x: 55, y: 65 }
  },
  {
    region: 'Davao',
    value: 1900000,
    percentage: 15,
    growth: 18.2,
    coordinates: { x: 65, y: 85 }
  },
  {
    region: 'Iloilo',
    value: 1200000,
    percentage: 10,
    growth: 6.5,
    coordinates: { x: 45, y: 70 }
  },
  {
    region: 'Baguio',
    value: 950000,
    percentage: 8,
    growth: 14.8,
    coordinates: { x: 58, y: 35 }
  }
];

export const GeoHeatmap: React.FC = () => {
  const getHeatmapColor = (percentage: number) => {
    if (percentage >= 30) return 'bg-scout-navy';
    if (percentage >= 20) return 'bg-scout-teal';
    if (percentage >= 15) return 'bg-scout-dark';
    if (percentage >= 10) return 'bg-scout-teal/70';
    return 'bg-scout-teal/40';
  };

  const getHeatmapSize = (percentage: number) => {
    if (percentage >= 30) return 'w-8 h-8';
    if (percentage >= 20) return 'w-7 h-7';
    if (percentage >= 15) return 'w-6 h-6';
    if (percentage >= 10) return 'w-5 h-5';
    return 'w-4 h-4';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 xl:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base xl:text-lg font-semibold text-gray-900">Regional Performance Heatmap</h3>
          <p className="text-xs xl:text-sm text-gray-600">Geographic distribution of sales performance</p>
        </div>
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Philippines Map Visualization */}
        <div className="relative">
          <div className="relative w-full h-64 bg-gradient-to-b from-scout-light to-scout-teal/10 rounded-lg border border-gray-200 overflow-hidden">
            {/* Simplified Philippines outline */}
            <div className="absolute inset-0 bg-gray-100 opacity-20 rounded-lg"></div>
            
            {/* Heatmap points */}
            {heatmapData.map((region) => (
              <div
                key={region.region}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${region.coordinates.x}%`,
                  top: `${region.coordinates.y}%`
                }}
              >
                <div
                  className={`${getHeatmapColor(region.percentage)} ${getHeatmapSize(region.percentage)} rounded-full opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-110`}
                ></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold">{region.region}</div>
                    <div>₱{(region.value / 1000000).toFixed(1)}M ({region.percentage}%)</div>
                    <div className="text-green-300">+{region.growth}% growth</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4">
            <div className="text-xs text-gray-600 mb-2">Market Share</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-scout-navy rounded-full"></div>
                <span>30%+</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-scout-teal rounded-full"></div>
                <span>20-29%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-scout-dark rounded-full"></div>
                <span>15-19%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-scout-teal/70 rounded-full"></div>
                <span>10-14%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-scout-teal/40 rounded-full"></div>
                <span>&lt;10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Rankings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Regions</h4>
          <div className="space-y-3">
            {heatmapData
              .sort((a, b) => b.percentage - a.percentage)
              .map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{region.region}</div>
                      <div className="text-xs text-gray-600">₱{(region.value / 1000000).toFixed(1)}M revenue</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{region.percentage}%</div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +{region.growth}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
