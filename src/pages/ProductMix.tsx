
import React from 'react';
import { Package, TrendingUp, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../state/useFilterStore';

const ProductMix: React.FC = () => {
  const navigate = useNavigate();
  const { setFilter } = useFilterStore();

  const handleCategoryClick = (category: string) => {
    setFilter('categories', [category]);
    navigate('/transaction-trends');
  };

  const topSkus = [
    { name: 'Samsung Galaxy A54', category: 'Electronics', sales: 2847, revenue: 1423500, growth: '+15%' },
    { name: 'Nestle Coffee Creamer', category: 'Groceries', sales: 5621, revenue: 168630, growth: '+8%' },
    { name: 'Unilever Shampoo 400ml', category: 'Health & Beauty', sales: 3214, revenue: 482100, growth: '+12%' },
    { name: 'Nike Running Shoes', category: 'Clothing', sales: 567, revenue: 2835000, growth: '+22%' },
    { name: 'Coca-Cola 1.5L', category: 'Beverages', sales: 8934, revenue: 447000, growth: '+5%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Mix & SKU Insights</h1>
          <p className="text-gray-600 mt-1">Analyze product performance and category trends</p>
        </div>
      </div>

      {/* Category Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => handleCategoryClick('Electronics')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Electronics</h3>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₱4.2M</p>
          <p className="text-green-600 text-sm font-medium">+18% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => handleCategoryClick('Groceries')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Groceries</h3>
            <ShoppingBag className="h-5 w-5 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₱3.1M</p>
          <p className="text-green-600 text-sm font-medium">+12% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => handleCategoryClick('Health & Beauty')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Health & Beauty</h3>
            <Star className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₱2.8M</p>
          <p className="text-green-600 text-sm font-medium">+15% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Category Mix Distribution</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg">
            <div className="text-center">
              <Package className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Interactive bar chart showing sales by category</p>
              <p className="text-sm text-gray-400 mt-2">Click bars to filter transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Substitution Flow</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">Sankey diagram showing product switching patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top SKUs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing SKUs</h3>
          <p className="text-gray-600 text-sm mt-1">Best-selling products across all categories</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSkus.map((sku, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sku.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {sku.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₱{sku.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 text-sm font-medium">{sku.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brand Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Brand Performance Analysis</h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <div className="text-center">
            <Star className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <p className="text-gray-500">Brand comparison matrix showing market share and growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMix;
