
import React from 'react';
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

const ProductMix: React.FC = () => {
  const navigate = useNavigate();
  const { setFilter } = useFilterStore();

  const handleCategoryClick = (category: string) => {
    setFilter('categories', [category]);
    navigate('/trends');
  };

  const kpiData = [
    { title: 'Total SKUs', value: '2,847', change: '+12%', trend: 'up' as const, icon: <Package className="h-5 w-5" /> },
    { title: 'Avg Basket Size', value: '₱1,245', change: '+8%', trend: 'up' as const, icon: <ShoppingBag className="h-5 w-5" /> },
    { title: 'Category Diversity', value: '85%', change: '+3%', trend: 'up' as const, icon: <BarChart3 className="h-5 w-5" /> },
    { title: 'Substitution Rate', value: '23%', change: '-2%', trend: 'down' as const, icon: <ArrowRightLeft className="h-5 w-5" /> }
  ];

  const categoryMixData = [
    { name: 'Electronics', value: 4200000, percentage: 35 },
    { name: 'Groceries', value: 3100000, percentage: 26 },
    { name: 'Health & Beauty', value: 2800000, percentage: 23 },
    { name: 'Clothing', value: 1200000, percentage: 10 },
    { name: 'Beverages', value: 700000, percentage: 6 }
  ];

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

          {/* Category Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-[#36CFC9]/30 transition-all duration-200"
                 onClick={() => handleCategoryClick('Electronics')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Electronics</h3>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₱4.2M</p>
              <p className="text-green-600 text-sm font-medium">+18% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-[#36CFC9]/30 transition-all duration-200"
                 onClick={() => handleCategoryClick('Groceries')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Groceries</h3>
                <ShoppingBag className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₱3.1M</p>
              <p className="text-green-600 text-sm font-medium">+12% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-[#36CFC9]/30 transition-all duration-200"
                 onClick={() => handleCategoryClick('Health & Beauty')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Health & Beauty</h3>
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₱2.8M</p>
              <p className="text-green-600 text-sm font-medium">+15% from last month</p>
            </div>
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
