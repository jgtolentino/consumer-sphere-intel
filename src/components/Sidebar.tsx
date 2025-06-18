
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
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-[#2F3A4F] border-r border-gray-200 dark:border-gray-700 shadow-sm z-10 hidden lg:block">
      <div className="p-4 xl:p-6 h-full overflow-y-auto">
        <nav className="space-y-1 xl:space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-3 xl:py-3 rounded-lg transition-all duration-200 text-sm xl:text-base font-medium ${
                  isActive
                    ? 'bg-[#36CFC9]/10 text-[#0A2540] dark:text-[#36CFC9] border-l-4 border-[#36CFC9] shadow-none'
                    : 'text-[#2F3A4F] dark:text-gray-300 hover:bg-[#F5F6FA] dark:hover:bg-[#0A2540]/50 hover:text-[#0A2540] dark:hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-6 xl:mt-8 p-3 xl:p-4 bg-[#F5F6FA] dark:bg-[#0A2540] rounded-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xs xl:text-sm font-semibold text-[#0A2540] dark:text-[#F5F6FA] mb-2 font-inter">Quick Stats</h3>
          <div className="space-y-1 xl:space-y-2 text-xs xl:text-sm text-[#2F3A4F] dark:text-gray-300">
            <div className="flex justify-between">
              <span>Active Stores:</span>
              <span className="font-medium text-[#36CFC9]">47</span>
            </div>
            <div className="flex justify-between">
              <span>SKUs Tracked:</span>
              <span className="font-medium text-[#36CFC9]">1,247</span>
            </div>
            <div className="flex justify-between">
              <span>Data Points:</span>
              <span className="font-medium text-[#36CFC9]">2.4M</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
