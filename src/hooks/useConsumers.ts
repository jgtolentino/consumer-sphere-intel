
import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';
import { useFilterStore } from '../state/useFilterStore';

export const useConsumers = () => {
  const dataService = useDataService();
  const { barangays } = useFilterStore();

  return useQuery({
    queryKey: ['consumers', barangays],
    queryFn: async () => {
      return await dataService.getConsumerData();
    },
    staleTime: 5 * 60 * 1000,
  });
};
