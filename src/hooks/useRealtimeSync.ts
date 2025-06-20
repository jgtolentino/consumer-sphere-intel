
import React, { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

/**
 * Supabase Realtime Auto-Attach Hook
 * Automatically syncs local state when database changes occur
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  const refreshData = useCallback(() => {
    // Invalidate all transaction-related queries
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['brands'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    
    console.log('🔄 Realtime sync: Refreshing local state due to database changes');
  }, [queryClient]);

  useEffect(() => {
    console.log('🚀 Initializing Supabase Realtime Auto-Attach...');
    
    const channel = supabase
      .channel('consumer-sphere-intel-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions' 
        },
        (payload) => {
          console.log('📊 Transactions table changed:', payload);
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'transaction_items' 
        },
        (payload) => {
          console.log('🛒 Transaction items table changed:', payload);
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        },
        (payload) => {
          console.log('📦 Products table changed:', payload);
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'brands' 
        },
        (payload) => {
          console.log('🏷️ Brands table changed:', payload);
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers' 
        },
        (payload) => {
          console.log('👥 Customers table changed:', payload);
          refreshData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime auto-attach enabled: All tables monitored');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Realtime subscription timed out');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Disconnecting Supabase Realtime Auto-Attach...');
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  return {
    refreshData,
    isRealtimeEnabled: true
  };
}

/**
 * Auto-refresh fallback for environments without realtime
 */
export function useAutoRefresh(enabled: boolean = false, intervalMs: number = 30000) {
  const queryClient = useQueryClient();

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    console.log('🔄 Auto-refresh: Polling data updates');
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    console.log(`⏱️ Auto-refresh enabled: ${intervalMs}ms interval`);
    const timer = setInterval(refreshData, intervalMs);
    
    return () => {
      console.log('⏹️ Auto-refresh disabled');
      clearInterval(timer);
    };
  }, [refreshData, intervalMs, enabled]);

  return { refreshData };
}
