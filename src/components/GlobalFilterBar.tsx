
import React from 'react';
import { Calendar, X, Filter, RotateCcw } from 'lucide-react';
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

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilter('dateRange', { 
                  ...dateRange, 
                  from: e.target.value ? new Date(e.target.value) : null 
                })}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilter('dateRange', { 
                  ...dateRange, 
                  to: e.target.value ? new Date(e.target.value) : null 
                })}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              multiple
              value={barangays}
              onChange={(e) => setFilter('barangays', Array.from(e.target.selectedOptions, option => option.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white"
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
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white"
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
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white"
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
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white"
            >
              <option value="" disabled>Store</option>
              {storeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            <select
              value={channels[0] || ''}
              onChange={(e) => setFilter('channels', e.target.value ? [e.target.value] : [])}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32 bg-white"
            >
              <option value="">Channel</option>
              {channelOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg flex-shrink-0"
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
