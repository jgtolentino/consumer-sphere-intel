import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, ShoppingBag, Star, BarChart3, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../state/useFilterStore';
import { KpiCard } from '../components/KpiCard';
import { TreemapChart } from '../components/TreemapChart';
import { SankeyChart } from '../components/SankeyChart';
import { SkuTable } from '../components/SkuTable';
import { BrandPerformanceChart } from '../components/BrandPerformanceChart';
import { ActiveFilters } from '../components/ActiveFilters';
import { DrillDownBreadcrumb } from '../components/DrillDownBreadcrumb';
import { useCategoryMix } from '../hooks/useCategoryMix';
import { useProductSubstitution } from '../hooks/useProductSubstitution';
import { safeToFixed } from '../utils/numberUtils';

const ProductMix: React.FC = () => {
  const navigate = useNavigate();
  const { setFilter } = useFilterStore();
  
  // Use hooks to fetch real data with FMCG fallbacks
  const { data: categoryMixData, isLoading: categoryLoading, error: categoryError } = useCategoryMix();
  const { data: substitutionData, isLoading: substitutionLoading } = useProductSubstitution();

  const handleCategoryClick = (category: string) => {
    setFilter('categories', [category]);
    navigate('/trends');
  };
  
  // TODO: Replace with proper data service call
  const [kpiData, setKpiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setKpiData(data);
        setKpiData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FMCG product data...</p>
        </div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-semibold">Error Loading Product Data</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load product mix data. Using FMCG baseline data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Mix & SKU Insights</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive TBWA Client Product Performance Analysis
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              Last updated: {new Date().toLocaleString('en-PH')}
            </div>
          </div>

          <DrillDownBreadcrumb />
          <ActiveFilters />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                icon={kpi.icon}
              />
            ))}
          </div>

          {/* Category Performance Cards - Top 3 FMCG Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryMixData?.slice(0, 3).map((category, index) => (
              <div key={category.name} 
                   className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-[#36CFC9]/30 transition-all duration-200"
                   onClick={() => handleCategoryClick(category.name)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {index === 0 && <Package className="h-5 w-5 text-blue-600" />}
                  {index === 1 && <ShoppingBag className="h-5 w-5 text-teal-600" />}
                  {index === 2 && <Star className="h-5 w-5 text-purple-600" />}
                </div>
                <p className="text-2xl font-bold text-gray-900">₱{safeToFixed((category.value || 0) / 1000000, 1)}M</p>
                <p className="text-green-600 text-sm font-medium">{safeToFixed(category.percentage || 0, 1)}% market share</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Mix Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Category Mix Distribution</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Sales distribution across product categories</p>
              <TreemapChart data={categoryMixData} />
            </div>

            {/* Product Substitution Flow */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <ArrowRightLeft className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Product Substitution Flow</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customer switching patterns between products</p>
              <SankeyChart />
            </div>
          </div>

          {/* SKU Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Performing SKUs</h3>
            <p className="text-sm text-gray-600 mb-4">Best-selling products with detailed metrics</p>
            <SkuTable />
          </div>

          {/* Brand Performance Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 mr-2 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Brand Performance Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Market share and growth comparison across brands</p>
            <BrandPerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMix;
