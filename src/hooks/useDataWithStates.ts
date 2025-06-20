import { useState, useEffect } from 'react';
import { useDataService } from '../providers/DataProvider';

interface UseDataWithStatesResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataWithStates<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseDataWithStatesResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Convenience hooks for common data operations
export function useTransactionsWithStates(filters?: any) {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getTransactions(filters),
    [filters]
  );
}

export function useBrandDataWithStates() {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getBrandData(),
    []
  );
}

export function useRegionalDataWithStates() {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getRegionalData(),
    []
  );
}