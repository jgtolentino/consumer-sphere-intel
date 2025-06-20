/**
 * Universal Fallback Data Hooks
 * Bulletproof data loading with comprehensive error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataService } from '../providers/DataProvider';

// Universal fallback data interface
interface UniversalFallbackConfig<T> {
  fetchFn: () => Promise<T>;
  fallbackData?: T;
  retryCount?: number;
  retryDelay?: number;
  cacheTime?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

interface UniversalFallbackState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  isStale: boolean;
  lastFetch: Date | null;
}

interface UniversalFallbackActions {
  retry: () => Promise<void>;
  reset: () => void;
  invalidate: () => void;
}

type UniversalFallbackReturn<T> = UniversalFallbackState<T> & UniversalFallbackActions;

/**
 * Universal data loading hook with comprehensive fallback strategy
 */
export function useUniversalFallback<T>(
  config: UniversalFallbackConfig<T>
): UniversalFallbackReturn<T> {
  const {
    fetchFn,
    fallbackData = null,
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    cacheTime = 300000, // 5 minutes
    onError,
    onSuccess
  } = config;

  const [state, setState] = useState<UniversalFallbackState<T>>({
    data: fallbackData,
    loading: true,
    error: null,
    retryCount: 0,
    isStale: false,
    lastFetch: null
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: isRetry ? prev.error : null
      }));

      const data = await fetchFn();

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        retryCount: 0,
        isStale: false,
        lastFetch: new Date()
      }));

      onSuccess?.(data);

    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      
      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        // If we haven't exceeded max retries, schedule a retry
        if (newRetryCount <= maxRetries) {
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(true);
          }, retryDelay * Math.pow(2, newRetryCount - 1)); // Exponential backoff
          
          return {
            ...prev,
            retryCount: newRetryCount,
            error: errorObj,
            loading: false
          };
        }

        // Max retries exceeded - use fallback if no data exists
        const finalData = prev.data || fallbackData;
        
        onError?.(errorObj);

        return {
          ...prev,
          data: finalData,
          loading: false,
          error: errorObj,
          retryCount: newRetryCount,
          isStale: true
        };
      });
    }
  }, [fetchFn, fallbackData, maxRetries, retryDelay, onError, onSuccess]);

  const retry = useCallback(async () => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    await fetchData(false);
  }, [fetchData]);

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: fallbackData,
      loading: true,
      error: null,
      retryCount: 0,
      isStale: false,
      lastFetch: null
    });
  }, [fallbackData]);

  const invalidate = useCallback(() => {
    setState(prev => ({ ...prev, isStale: true }));
    fetchData(false);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData(false);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Cache invalidation
  useEffect(() => {
    if (state.lastFetch && cacheTime > 0) {
      const timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, isStale: true }));
      }, cacheTime);

      return () => clearTimeout(timeoutId);
    }
  }, [state.lastFetch, cacheTime]);

  return {
    ...state,
    retry,
    reset,
    invalidate
  };
}

/**
 * Specific data hooks with universal fallback strategy
 */

// Transactions with bulletproof fallback
export function useTransactionsWithFallback(filters?: any) {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: () => dataService.getTransactions(filters),
    fallbackData: [],
    retryCount: 3,
    onError: (error) => {
      console.error('Failed to fetch transactions:', error);
      // Could trigger analytics or error reporting here
    }
  });
}

// Brand data with fallback
export function useBrandDataWithFallback() {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: () => dataService.getBrandData(),
    fallbackData: [],
    retryCount: 2,
    cacheTime: 600000, // 10 minutes cache for relatively static data
    onError: (error) => {
      console.error('Failed to fetch brand data:', error);
    }
  });
}

// Regional data with fallback
export function useRegionalDataWithFallback() {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: () => dataService.getRegionalData(),
    fallbackData: [],
    retryCount: 2,
    cacheTime: 300000, // 5 minutes cache
    onError: (error) => {
      console.error('Failed to fetch regional data:', error);
    }
  });
}

// Consumer insights with fallback
export function useConsumerDataWithFallback() {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: () => dataService.getConsumerData(),
    fallbackData: [],
    retryCount: 2,
    onError: (error) => {
      console.error('Failed to fetch consumer data:', error);
    }
  });
}

// Product substitution with fallback
export function useProductSubstitutionWithFallback() {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: () => dataService.getProductSubstitution(),
    fallbackData: [],
    retryCount: 1, // Less critical data
    onError: (error) => {
      console.error('Failed to fetch substitution data:', error);
    }
  });
}

// Generic data hook factory
export function createUniversalDataHook<T>(
  dataFetcher: (dataService: any) => Promise<T>,
  fallbackData: T,
  options: Partial<UniversalFallbackConfig<T>> = {}
) {
  return function useGenericDataWithFallback() {
    const dataService = useDataService();
    
    return useUniversalFallback({
      fetchFn: () => dataFetcher(dataService),
      fallbackData,
      retryCount: 2,
      ...options
    });
  };
}

// Connection health check hook
export function useConnectionHealth() {
  const dataService = useDataService();
  
  return useUniversalFallback({
    fetchFn: async () => {
      // Simple health check - try to fetch minimal data
      const start = Date.now();
      await dataService.getTransactions().then(data => data.slice(0, 1));
      const end = Date.now();
      
      return {
        isHealthy: true,
        responseTime: end - start,
        timestamp: new Date()
      };
    },
    fallbackData: {
      isHealthy: false,
      responseTime: 0,
      timestamp: new Date()
    },
    retryCount: 1,
    retryDelay: 5000,
    cacheTime: 30000 // Check every 30 seconds
  });
}

export default useUniversalFallback;