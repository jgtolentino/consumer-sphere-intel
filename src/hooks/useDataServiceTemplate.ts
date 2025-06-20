
// Example of improved hook pattern (no mock fallbacks)
import { useState, useEffect } from 'react';
import { useDataService } from '../providers/DataProvider';

export const useTransactionsLive = (filters?: any) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const dataService = useDataService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const transactions = await dataService.getTransactions(filters);
        setData(transactions); // Always from live service
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null); // No mock fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, dataService]);

  return { data, loading, error, refetch: () => fetchData() };
};
