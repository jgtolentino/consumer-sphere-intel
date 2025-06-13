
import { useQuery } from '@tanstack/react-query';
import { supabase, withLimit } from '../lib/supabase';
import { useFilterStore } from '../state/useFilterStore';

export const useProducts = () => {
  const { categories, brands } = useFilterStore();

  return useQuery({
    queryKey: ['products', categories, brands],
    queryFn: async () => {
      let query = withLimit('products', supabase
        .from('products')
        .select('*'));

      // Apply filters
      if (categories.length > 0) {
        query = query.in('category', categories);
      }
      if (brands.length > 0) {
        query = query.in('brand', brands);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const products = data || [];
      
      // Process category mix
      const categoryMix = processCategoryMix(products);
      
      // Get top SKUs (would need transaction data to calculate sales)
      const topSkus = products.slice(0, 10).map(p => ({
        name: p.name,
        category: p.category,
        sales: Math.floor(Math.random() * 1000), // Mock data
        revenue: Math.floor(Math.random() * 100000) // Mock data
      }));

      return {
        categoryMix,
        topSkus,
        substitutionFlow: [], // Would need advanced analytics
        total: products.length,
        raw: products
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

const processCategoryMix = (products: any[]) => {
  const categoryCount: Record<string, number> = {};
  
  products.forEach(product => {
    const category = product.category;
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  return Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
    percentage: (count / products.length) * 100
  }));
};
