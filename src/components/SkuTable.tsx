
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { ArrowUpDown, Download } from 'lucide-react';

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

  const skuData: SkuData[] = [
    { name: 'Samsung Galaxy A54', category: 'Electronics', sales: 2847, revenue: 1423500, growth: '+15%', margin: 18.5, stockLevel: 'High' },
    { name: 'Nestle Coffee Creamer', category: 'Groceries', sales: 5621, revenue: 168630, growth: '+8%', margin: 25.2, stockLevel: 'Medium' },
    { name: 'Unilever Shampoo 400ml', category: 'Health & Beauty', sales: 3214, revenue: 482100, growth: '+12%', margin: 22.8, stockLevel: 'High' },
    { name: 'Nike Running Shoes', category: 'Clothing', sales: 567, revenue: 2835000, growth: '+22%', margin: 35.6, stockLevel: 'Low' },
    { name: 'Coca-Cola 1.5L', category: 'Beverages', sales: 8934, revenue: 447000, growth: '+5%', margin: 28.1, stockLevel: 'High' },
    { name: 'iPhone 14 Pro', category: 'Electronics', sales: 1245, revenue: 3123750, growth: '+25%', margin: 20.5, stockLevel: 'Medium' },
    { name: 'Kopiko Coffee Mix', category: 'Groceries', sales: 4532, revenue: 135960, growth: '+6%', margin: 30.2, stockLevel: 'High' },
    { name: 'P&G Shampoo', category: 'Health & Beauty', sales: 2198, revenue: 329700, growth: '+9%', margin: 24.5, stockLevel: 'Medium' }
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
  }, [sortConfig]);

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
    a.download = 'sku-performance.csv';
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">SKU Performance Details</h3>
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
