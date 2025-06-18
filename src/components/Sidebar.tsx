
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Package, Globe, Star, Bot } from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/products', icon: Package },
  { name: 'Regional', href: '/regional', icon: Globe },
  { name: 'Brand Analytics', href: '/brands', icon: Star },
  { name: 'AI Chat', href: '/chat', icon: Bot },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm z-10 hidden lg:block">
      <div className="p-4 xl:p-6 h-full overflow-y-auto">
        <nav className="space-y-1 xl:space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-2 xl:space-x-3 px-2 xl:px-4 py-2 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-6 xl:mt-8 p-3 xl:p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
          <h3 className="text-xs xl:text-sm font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-1 xl:space-y-2 text-xs xl:text-sm text-gray-600">
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
