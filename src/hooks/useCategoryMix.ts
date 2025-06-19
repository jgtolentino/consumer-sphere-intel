
import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';

export interface CategoryMixData {
  name: string;
  value: number;
  percentage: number;
}

export const useCategoryMix = () => {
  const dataService = useDataService();

  return useQuery({
    queryKey: ['categoryMix'],
    queryFn: async (): Promise<CategoryMixData[]> => {
      try {
        // Always fetch real category mix data from database
        const realData = await dataService.getCategoryMix();
        
        if (realData && realData.length > 0) {
          console.log('✅ Real category mix data loaded:', realData.length, 'categories');
          return realData;
        }
        
        throw new Error('No real data available');
      } catch (error) {
        console.error('Failed to fetch category mix data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
