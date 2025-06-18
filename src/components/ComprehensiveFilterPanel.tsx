
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';
import { useComprehensiveAnalytics } from '../hooks/useComprehensiveAnalytics';

export const ComprehensiveFilterPanel: React.FC = () => {
  const { 
    barangays, 
    brands, 
    categories, 
    setFilter, 
    getMasterLists 
  } = useFilterStore();
  
  const { data: analytics, isLoading } = useComprehensiveAnalytics();
  const masterLists = getMasterLists();

  const handleMultiSelect = (
    filterKey: 'barangays' | 'brands' | 'categories',
    value: string,
    currentValues: string[]
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilter(filterKey, newValues);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">Loading comprehensive filters...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Comprehensive Analytics Filters
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          All dimensions shown - zero counts included for complete coverage
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Regional Filter with Analytics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Regions (All {masterLists.allRegions.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {masterLists.allRegions.map(region => {
              const regionData = analytics?.regionalAnalytics.find(r => r.region === region);
              const isSelected = barangays.includes(region);
              
              return (
                <button
                  key={region}
                  onClick={() => handleMultiSelect('barangays', region, barangays)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-300 text-blue-900' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } ${regionData?.transactions === 0 ? 'opacity-60' : ''}`}
                >
                  <div className="font-medium text-sm">{region}</div>
                  <div className="text-xs text-gray-600">
                    {regionData?.transactions || 0} transactions
                    {regionData?.revenue ? ` • ₱${(regionData.revenue / 1000).toFixed(1)}K` : ' • ₱0'}
                  </div>
                </button>
              );
            })}
          </div>
          {barangays.length > 0 && (
            <div className="mt-2 text-sm text-blue-600">
              {barangays.length} of {masterLists.allRegions.length} regions selected
            </div>
          )}
        </div>

        {/* Brand Filter with Analytics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Brands (All {masterLists.allBrands.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {masterLists.allBrands.map(brand => {
              const brandData = analytics?.brandAnalytics.find(b => b.brand === brand);
              const isSelected = brands.includes(brand);
              
              return (
                <button
                  key={brand}
                  onClick={() => handleMultiSelect('brands', brand, brands)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-green-50 border-green-300 text-green-900' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } ${brandData?.transactions === 0 ? 'opacity-60' : ''}`}
                >
                  <div className="font-medium text-sm">{brand}</div>
                  <div className="text-xs text-gray-600">
                    {brandData?.transactions || 0} transactions
                    {brandData?.revenue ? ` • ₱${(brandData.revenue / 1000).toFixed(1)}K` : ' • ₱0'}
                  </div>
                </button>
              );
            })}
          </div>
          {brands.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              {brands.length} of {masterLists.allBrands.length} brands selected
            </div>
          )}
        </div>

        {/* Category Filter with Analytics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Categories (All {masterLists.allCategories.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {masterLists.allCategories.map(category => {
              const categoryData = analytics?.categoryAnalytics.find(c => c.category === category);
              const isSelected = categories.includes(category);
              
              return (
                <button
                  key={category}
                  onClick={() => handleMultiSelect('categories', category, categories)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-purple-50 border-purple-300 text-purple-900' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } ${categoryData?.transactions === 0 ? 'opacity-60' : ''}`}
                >
                  <div className="font-medium text-sm">{category}</div>
                  <div className="text-xs text-gray-600">
                    {categoryData?.transactions || 0} transactions
                  </div>
                </button>
              );
            })}
          </div>
          {categories.length > 0 && (
            <div className="mt-2 text-sm text-purple-600">
              {categories.length} of {masterLists.allCategories.length} categories selected
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {analytics && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Filter Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">{analytics.totalMetrics.totalTransactions}</div>
                <div className="text-gray-600">Transactions</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">₱{(analytics.totalMetrics.totalRevenue / 1000).toFixed(1)}K</div>
                <div className="text-gray-600">Revenue</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">₱{analytics.totalMetrics.avgTransactionValue.toFixed(0)}</div>
                <div className="text-gray-600">Avg Transaction</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
