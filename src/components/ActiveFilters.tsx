import React from 'react';
import { X } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';

export const ActiveFilters: React.FC = () => {
  const { 
    dateRange, 
    barangays, 
    categories, 
    brands,
    setFilter, 
    reset 
  } = useFilterStore();

  const hasActiveFilters = dateRange.from || dateRange.to || 
    barangays.length || categories.length || brands.length;

  if (!hasActiveFilters) return null;

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'dateRange':
        setFilter('dateRange', { from: null, to: null });
        break;
      case 'barangays':
        setFilter('barangays', barangays.filter(item => item !== value));
        break;
      case 'categories':
        setFilter('categories', categories.filter(item => item !== value));
        break;
      case 'brands':
        setFilter('brands', brands.filter(item => item !== value));
        break;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          
          {(dateRange.from || dateRange.to) && (
            <div className="flex items-center bg-scout-teal/10 text-scout-navy px-3 py-1 rounded-full text-sm">
              <span>
                {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
              </span>
              <button
                onClick={() => removeFilter('dateRange')}
                className="ml-2 hover:bg-scout-teal/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {barangays.map(region => (
            <div key={region} className="flex items-center bg-scout-teal/10 text-scout-navy px-3 py-1 rounded-full text-sm">
              <span>Region: {region}</span>
              <button
                onClick={() => removeFilter('barangays', region)}
                className="ml-2 hover:bg-scout-teal/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {brands.map(brand => (
            <div key={brand} className="flex items-center bg-scout-dark/10 text-scout-navy px-3 py-1 rounded-full text-sm">
              <span>Brand: {brand}</span>
              <button
                onClick={() => removeFilter('brands', brand)}
                className="ml-2 hover:bg-scout-dark/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {categories.map(category => (
            <div key={category} className="flex items-center bg-scout-teal/20 text-scout-navy px-3 py-1 rounded-full text-sm">
              <span>Category: {category}</span>
              <button
                onClick={() => removeFilter('categories', category)}
                className="ml-2 hover:bg-scout-teal/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
