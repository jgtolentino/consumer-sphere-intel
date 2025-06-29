
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Package, Globe, Star, Bot, Settings } from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/products', icon: Package },
  { name: 'Regional', href: '/regional', icon: Globe },
  { name: 'Brand Analytics', href: '/brands', icon: Star },
  { name: 'AI Chat', href: '/chat', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar - Fixed width, never overlaps content */}
      <aside className="w-64 h-full bg-white dark:bg-[#2F3A4F] border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-4 xl:p-6 h-full overflow-y-auto flex flex-col">
          <nav className="space-y-2 flex-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
                    isActive
                      ? 'bg-[#36CFC9]/10 text-[#0A2540] dark:text-[#36CFC9] border-l-4 border-[#36CFC9] shadow-none'
                      : 'text-[#2F3A4F] dark:text-gray-300 hover:bg-[#F5F6FA] dark:hover:bg-[#0A2540]/50 hover:text-[#0A2540] dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto p-3 bg-[#F5F6FA] dark:bg-[#0A2540] rounded-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-[#0A2540] dark:text-[#F5F6FA] mb-2 font-inter">Quick Stats</h3>
            <div className="space-y-1 text-xs text-[#2F3A4F] dark:text-gray-300">
              <div className="flex justify-between">
                <span>Stores:</span>
                <span className="font-medium text-[#36CFC9]">47</span>
              </div>
              <div className="flex justify-between">
                <span>SKUs:</span>
                <span className="font-medium text-[#36CFC9]">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Data:</span>
                <span className="font-medium text-[#36CFC9]">2.4M</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation - Hidden by default, would need mobile menu trigger */}
      <div className="lg:hidden">
        {/* Mobile navigation implementation would go here */}
      </div>
    </>
  );
};
