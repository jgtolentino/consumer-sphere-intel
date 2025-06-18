import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';
import { useFilterStore } from '../state/useFilterStore';

export const useTransactions = () => {
  const dataService = useDataService();
  const { dateRange, barangays, categories, brands } = useFilterStore();

  return useQuery({
    queryKey: ['transactions', dateRange, barangays, categories, brands],
    queryFn: async () => {
      const filters = {
        dateRange,
        regions: barangays,
        categories,
        brands
      };

      const transactions = await dataService.getTransactions(filters);
      
      // Process data for dashboard KPIs
      const totalValue = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const totalItems = transactions.reduce((sum, t) => 
        sum + (t.basket?.reduce((itemSum: number, item: any) => itemSum + item.units, 0) || 0), 0
      );

      return {
        total: transactions.length,
        totalValue,
        avgBasketSize: totalItems / (transactions.length || 1),
        avgTransactionValue: totalValue / (transactions.length || 1),
        topCategory: getTopCategory(transactions),
        timeSeries: processTimeSeriesData(transactions),
        valueDistribution: processValueDistribution(transactions),
        raw: transactions
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

const getTopCategory = (transactions: any[]) => {
  const categoryCount: Record<string, number> = {};
  
  transactions.forEach(t => {
    t.transaction_items?.forEach((item: any) => {
      const category = item.products?.category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
      }
    });
  });

  return Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
};

const processTimeSeriesData = (data: any[]) => {
  const grouped: Record<string, { volume: number; value: number }> = {};
  
  data.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { volume: 0, value: 0 };
    }
    grouped[date].volume += 1;
    grouped[date].value += transaction.total_amount || 0;
  });

  return Object.entries(grouped).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => a.date.localeCompare(b.date));
};

const processValueDistribution = (data: any[]) => {
  const values = data.map(d => d.total || 0).sort((a, b) => a - b);
  const len = values.length;
  
  if (len === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  
  return {
    min: values[0],
    q1: values[Math.floor(len * 0.25)],
    median: values[Math.floor(len * 0.5)],
    q3: values[Math.floor(len * 0.75)],
    max: values[len - 1]
  };
};
