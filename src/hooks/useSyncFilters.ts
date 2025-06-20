

import React, { useEffect } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFilterStore } from '../state/useFilterStore';

export const useSyncFilters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useFilterStore();

  // Push store state to URL
  useEffect(() => {
    const queryString = store.getQueryString();
    const currentSearch = location.search.slice(1);
    
    if (queryString !== currentSearch) {
      navigate({ search: queryString }, { replace: true });
    }
  }, [store.dateRange, store.barangays, store.categories, store.brands, store.skus, navigate, location.search, store]);

  // Pull URL state to store (one-time on mount)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const from = params.get('from');
    const to = params.get('to');
    if (from || to) {
      store.setFilter('dateRange', {
        from: from ? new Date(from) : null,
        to: to ? new Date(to) : null
      });
    }
    
    const barangays = params.get('barangays');
    if (barangays) {
      store.setFilter('barangays', barangays.split(','));
    }
    
    const categories = params.get('categories');
    if (categories) {
      store.setFilter('categories', categories.split(','));
    }
    
    const brands = params.get('brands');
    if (brands) {
      store.setFilter('brands', brands.split(','));
    }
    
    const skus = params.get('skus');
    if (skus) {
      store.setFilter('skus', skus.split(','));
    }
  }, []);
};

