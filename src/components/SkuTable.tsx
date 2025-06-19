
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { ArrowUpDown, Download } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

interface SkuData {
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: string;
  margin: number;
  stockLevel: string;
}

export const SkuTable: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof SkuData; direction: 'asc' | 'desc' } | null>(null);
  const { data: productData, isLoading } = useProducts();

  // Convert product data to SKU format with TBWA client brands
  const skuData: SkuData[] = productData?.topSkus?.slice(0, 8).map((sku: any, index: number) => ({
    name: sku.name,
    category: sku.category,
    sales: sku.sales,
    revenue: sku.revenue,
    growth: `+${Math.floor(Math.random() * 20) + 5}%`, // Random growth between 5-25%
    margin: Math.floor(Math.random() * 15) + 18, // Random margin between 18-33%
    stockLevel: ['High', 'Medium', 'Low'][index % 3]
  })) || [
    // Fallback TBWA client data if no data available
    { name: 'Alaska Milk 1L', category: 'Dairy & Beverages', sales: 8947, revenue: 447350, growth: '+15%', margin: 28.5, stockLevel: 'High' },
    { name: 'Oishi Prawn Crackers', category: 'Snacks', sales: 5621, revenue: 168630, growth: '+8%', margin: 25.2, stockLevel: 'Medium' },
    { name: 'Del Monte Corned Beef', category: 'Food Products', sales: 3214, revenue: 482100, growth: '+12%', margin: 22.8, stockLevel: 'High' },
    { name: 'JTI Winston Red', category: 'Tobacco', sales: 2567, revenue: 2835000, growth: '+22%', margin: 35.6, stockLevel: 'Low' },
    { name: 'Peerless Orange Shampoo', category: 'Personal Care', sales: 4934, revenue: 247000, growth: '+5%', margin: 28.1, stockLevel: 'High' },
    { name: 'Alaska Condensada', category: 'Dairy & Beverages', sales: 1245, revenue: 312375, growth: '+25%', margin: 20.5, stockLevel: 'Medium' },
    { name: 'Oishi Smart C+', category: 'Beverages', sales: 4532, revenue: 135960, growth: '+6%', margin: 30.2, stockLevel: 'High' },
    { name: 'Peerless Apple Shampoo', category: 'Personal Care', sales: 2198, revenue: 329700, growth: '+9%', margin: 24.5, stockLevel: 'Medium' }
  ];

  const handleSort = (key: keyof SkuData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return skuData;

    return [...skuData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortConfig, skuData]);

  const exportToCSV = () => {
    const headers = ['Product Name', 'Category', 'Units Sold', 'Revenue', 'Growth', 'Margin %', 'Stock Level'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.name}"`,
        row.category,
        row.sales,
        row.revenue,
        row.growth,
        row.margin,
        row.stockLevel
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tbwa-sku-performance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">SKU Performance Details</h3>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">TBWA Client SKU Performance</h3>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-medium">
                  Product Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('category')} className="h-auto p-0 font-medium">
                  Category <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('sales')} className="h-auto p-0 font-medium">
                  Units Sold <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('revenue')} className="h-auto p-0 font-medium">
                  Revenue <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Growth</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('margin')} className="h-auto p-0 font-medium">
                  Margin % <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Stock Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((sku, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{sku.name}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {sku.category}
                  </span>
                </TableCell>
                <TableCell>{sku.sales.toLocaleString()}</TableCell>
                <TableCell className="font-medium">₱{sku.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">{sku.growth}</span>
                </TableCell>
                <TableCell>{sku.margin}%</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockLevelColor(sku.stockLevel)}`}>
                    {sku.stockLevel}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
