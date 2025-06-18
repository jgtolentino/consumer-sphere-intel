
import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';
import { useFilterStore } from '../state/useFilterStore';

export const useProducts = () => {
  const dataService = useDataService();
  const { categories, brands } = useFilterStore();

  return useQuery({
    queryKey: ['products', categories, brands],
    queryFn: async () => {
      return await dataService.getProductData();
    },
    staleTime: 5 * 60 * 1000,
  });
};
