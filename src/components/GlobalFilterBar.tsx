
import React from 'react';
import { Calendar, X, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';

export const GlobalFilterBar: React.FC = () => {
  const { 
    dateRange, 
    barangays, 
    categories, 
    brands,
    stores,
    channels,
    setFilter, 
    reset 
  } = useFilterStore();

  const hasActiveFilters = dateRange.from || dateRange.to || 
    barangays.length || categories.length || brands.length || stores.length || channels.length;

  const activeFilterCount = [
    dateRange.from || dateRange.to ? 1 : 0,
    barangays.length,
    categories.length,
    brands.length,
    stores.length,
    channels.length
  ].reduce((sum, count) => sum + count, 0);

  // YAML specification filter options
  const regionOptions = ['NCR', 'Region 3', 'Region 4A', 'Visayas', 'Mindanao'];
  const brandOptions = ['Alaska', 'Oishi', 'Del Monte', 'Peerless', 'JTI'];
  const categoryOptions = ['Electronics', 'Groceries', 'Clothing', 'Health & Beauty', 'Home & Garden'];
  const storeOptions = ['Store A', 'Store B', 'Store C', 'Store D', 'Store E'];
  const channelOptions = ['Traditional', 'Modern Trade'];

  const scrollFilters = (direction: 'left' | 'right') => {
    const container = document.getElementById('filter-scroll-container');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#2F3A4F] border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            
            {/* Scrollable filter container */}
            <div className="relative flex-1 min-w-0">
              <button 
                onClick={() => scrollFilters('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#2F3A4F] border border-gray-300 dark:border-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Scroll filters left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div 
                id="filter-scroll-container"
                className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFilter('dateRange', { 
                      ...dateRange, 
                      from: e.target.value ? new Date(e.target.value) : null 
                    })}
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFilter('dateRange', { 
                      ...dateRange, 
                      to: e.target.value ? new Date(e.target.value) : null 
                    })}
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <select
                  multiple
                  value={barangays}
                  onChange={(e) => setFilter('barangays', Array.from(e.target.selectedOptions, option => option.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="" disabled>Region</option>
                  {regionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
                <select
                  multiple
                  value={brands}
                  onChange={(e) => setFilter('brands', Array.from(e.target.selectedOptions, option => option.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="" disabled>Brand</option>
                  {brandOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
                <select
                  multiple
                  value={categories}
                  onChange={(e) => setFilter('categories', Array.from(e.target.selectedOptions, option => option.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="" disabled>Category</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
                <select
                  multiple
                  value={stores}
                  onChange={(e) => setFilter('stores', Array.from(e.target.selectedOptions, option => option.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="" disabled>Store</option>
                  {storeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
                <select
                  value={channels[0] || ''}
                  onChange={(e) => setFilter('channels', e.target.value ? [e.target.value] : [])}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white dark:bg-[#2F3A4F] text-gray-900 dark:text-gray-100 flex-shrink-0"
                >
                  <option value="">Channel</option>
                  {channelOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={() => scrollFilters('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#2F3A4F] border border-gray-300 dark:border-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Scroll filters right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-lg flex-shrink-0 ml-4"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
