
import React from 'react';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface GeoMapProps {
  data?: Array<{
    region: string;
    value: number;
    change: number;
  }>;
}

export const GeoMap: React.FC<GeoMapProps> = ({ data = [] }) => {
  // Generate sample Philippine regions data if none provided
  const mapData = data.length > 0 ? data : [
    { region: 'Metro Manila', value: 125000, change: 15.2 },
    { region: 'Calabarzon', value: 89000, change: 8.7 },
    { region: 'Central Luzon', value: 67000, change: -2.1 },
    { region: 'Western Visayas', value: 54000, change: 12.4 },
    { region: 'Central Visayas', value: 48000, change: 6.8 },
    { region: 'Northern Mindanao', value: 35000, change: -4.2 }
  ];

  const maxValue = Math.max(...mapData.map(d => d.value));

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-scout-navy dark:text-scout-teal">Regional Distribution</h3>
        <div className="text-sm text-gray-500">Live Data</div>
      </div>

      {/* Interactive Regional List */}
      <div className="space-y-3">
        {mapData.map((region, index) => {
          const intensity = (region.value / maxValue) * 100;
          const isPositive = region.change >= 0;
          
          return (
            <div
              key={region.region}
              className="relative p-4 bg-white dark:bg-scout-dark rounded-lg border border-gray-200 dark:border-scout-navy hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Background intensity bar */}
              <div 
                className="absolute inset-0 bg-scout-teal/10 rounded-lg"
                style={{ width: `${intensity}%` }}
              />
              
              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-scout-teal" />
                  <div>
                    <h4 className="font-medium text-scout-navy dark:text-white">{region.region}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">₱{region.value.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{region.change}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>Revenue Performance</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-scout-teal/20 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-scout-teal/60 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-scout-teal rounded"></div>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};
