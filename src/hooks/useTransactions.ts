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

      let transactions = [];
      let dataSource = 'real';
      
      try {
        transactions = await dataService.getTransactions(filters);
        console.log('✅ Real transactions from API:', transactions.length, transactions.slice(0, 2));
      } catch (error) {
        console.error('❌ Failed to load real data:', error);
        transactions = [];
        dataSource = 'failed';
      }
      
      console.log(`📊 Using ${dataSource} data: ${transactions.length} transactions`);
      
      // Process data for dashboard KPIs - fix field mapping
      const totalValue = transactions.reduce((sum, t) => {
        // Try multiple possible field names for total amount
        const amount = t.total_amount || t.total || t.amount || t.gross_peso_value || 0;
        return sum + amount;
      }, 0);
      
      const totalItems = transactions.reduce((sum, t) => {
        // Handle transaction_items for real data vs basket for mock data
        if (t.transaction_items && Array.isArray(t.transaction_items)) {
          return sum + t.transaction_items.reduce((itemSum: number, item: any) => 
            itemSum + (item.quantity || item.units || 0), 0);
        } else if (t.basket && Array.isArray(t.basket)) {
          return sum + t.basket.reduce((itemSum: number, item: any) => 
            itemSum + (item.units || item.quantity || 0), 0);
        }
        return sum;
      }, 0);

      // Use actual values - no artificial minimums
      const transactionCount = transactions.length;
      const avgBasketSize = transactionCount > 0 ? totalItems / transactionCount : 0;
      const avgTransactionValue = transactionCount > 0 ? totalValue / transactionCount : 0;

      return {
        total: transactionCount,
        totalValue: totalValue,
        avgBasketSize: avgBasketSize,
        avgTransactionValue: avgTransactionValue,
        topCategory: getTopCategory(transactions),
        timeSeries: processTimeSeriesData(transactions),
        valueDistribution: processValueDistribution(transactions),
        raw: transactions,
        dataSource // Include source information
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
    const date = new Date(transaction.created_at || transaction.date).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { volume: 0, value: 0 };
    }
    grouped[date].volume += 1;
    // Try multiple field names for amount
    const amount = transaction.total_amount || transaction.total || transaction.amount || transaction.gross_peso_value || 0;
    grouped[date].value += amount;
  });

  return Object.entries(grouped).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => a.date.localeCompare(b.date));
};

const processValueDistribution = (data: any[]) => {
  const values = data.map(d => {
    // Try multiple field names for amount
    return d.total_amount || d.total || d.amount || d.gross_peso_value || 0;
  }).sort((a, b) => a - b);
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
