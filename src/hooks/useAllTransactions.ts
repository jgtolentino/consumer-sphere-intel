
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, withLimit } from '../lib/supabase';
import { useFilterStore } from '../state/useFilterStore';

export const useAllTransactions = () => {
  const { dateRange, barangays, categories, brands } = useFilterStore();

  return useQuery({
    queryKey: ['all-transactions', dateRange, barangays, categories, brands],
    queryFn: async () => {
      // 1. Get exact count first (head-only request)
      let countQuery = supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });

      // Apply filters to count query
      if (dateRange.from) {
        countQuery = countQuery.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        countQuery = countQuery.lte('created_at', dateRange.to.toISOString());
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      if (!count || count === 0) {
        return [];
      }

      // 2. Fetch in batches of 1000
      const batchSize = 1000;
      const allData: any[] = [];

      for (let offset = 0; offset < count; offset += batchSize) {
        let batchQuery = supabase
          .from('transactions')
          .select(`
            *,
            customers(name, barangay, age_group, gender),
            transaction_items(
              quantity,
              unit_price,
              total_price,
              products(name, category, brand, sku)
            )
          `)
          .range(offset, offset + batchSize - 1);

        // Apply same filters to batch query
        if (dateRange.from) {
          batchQuery = batchQuery.gte('created_at', dateRange.from.toISOString());
        }
        if (dateRange.to) {
          batchQuery = batchQuery.lte('created_at', dateRange.to.toISOString());
        }

        const { data: batchData, error } = await batchQuery;
        if (error) throw error;
        
        if (batchData) {
          allData.push(...batchData);
        }
      }

      return allData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true
  });
};
