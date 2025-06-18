
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, TrendingUp, Package, Users, Home, Bot, Sparkles, Heart } from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Transaction Trends', href: '/transaction-trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/product-mix', icon: Package },
  { name: 'Consumer Insights', href: '/consumer-insights', icon: Users },
  { name: 'RetailBot', href: '/retailbot', icon: Bot },
  { name: 'AI Assist', href: '/ai-assist', icon: Sparkles },
  { name: 'Vibe Check', href: '/vibe-check', icon: Heart },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Active Stores:</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex justify-between">
              <span>SKUs Tracked:</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between">
              <span>Data Points:</span>
              <span className="font-medium">2.4M</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
