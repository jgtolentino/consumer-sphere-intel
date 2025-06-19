
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-scout-navy border-b border-gray-200 dark:border-scout-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-scout-teal" />
            <div>
              <h1 className="text-xl font-bold text-scout-navy dark:text-scout-teal">Scout Analytics</h1>
              <p className="text-xs text-scout-dark dark:text-gray-300">TBWA Client Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/trends"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/trends') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              Trends
            </Link>
            <Link
              to="/products"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/products') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              Products
            </Link>
            <Link
              to="/regional"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/regional') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              Regional
            </Link>
            <Link
              to="/brands"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/brands') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              Brands
            </Link>
            <Link
              to="/chat"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/chat') 
                  ? 'bg-scout-teal text-white' 
                  : 'text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal'
              }`}
            >
              RetailBot
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-scout-dark dark:text-gray-300 hover:text-scout-teal dark:hover:text-scout-teal"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
