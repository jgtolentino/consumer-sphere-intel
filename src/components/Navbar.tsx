
import React from 'react';
import { BarChart3, Bell, Search, Settings, User, Menu, Sun, Moon } from 'lucide-react';
import { MobileNavigation } from './MobileNavigation';
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-[#2F3A4F] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger - only visible on mobile */}
            <div className="lg:hidden">
              <MobileNavigation 
                trigger={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                }
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="scout-gradient p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A2540] dark:text-[#F5F6FA] font-inter">Scout Analytics</h1>
                <p className="text-xs text-[#2F3A4F] dark:text-gray-400 hidden sm:block font-medium">Philippine Retail Intelligence</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search analytics..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#36CFC9] focus:border-transparent w-48 lg:w-64 bg-white dark:bg-[#2F3A4F] text-[#0A2540] dark:text-[#F5F6FA]"
              />
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <button className="relative p-2 text-gray-400 hover:text-[#36CFC9] transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-[#36CFC9] transition-colors hidden sm:block">
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 scout-gradient rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#0A2540] dark:text-[#F5F6FA] hidden sm:block">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
