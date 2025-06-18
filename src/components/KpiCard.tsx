
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-[#36CFC9]" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-[#2F3A4F] dark:text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-[#36CFC9]';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-[#2F3A4F] dark:text-gray-400';
    }
  };

  return (
    <div className="scout-kpi-card hover:border-[#36CFC9]/30 transition-all duration-200 dark:bg-[#2F3A4F] dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#2F3A4F] dark:text-gray-300 uppercase tracking-wide font-inter">{title}</h3>
        {icon && <div className="text-[#36CFC9]">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-[#0A2540] dark:text-[#F5F6FA] font-inter">{value}</p>
          {change && (
            <div className={`flex items-center space-x-1 mt-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-semibold">{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
