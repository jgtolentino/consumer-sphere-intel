
import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';

export interface SubstitutionFlow {
  from: string;
  to: string;
  flow: number;
}

export const useProductSubstitution = () => {
  const dataService = useDataService();

  return useQuery({
    queryKey: ['productSubstitution'],
    queryFn: async (): Promise<SubstitutionFlow[]> => {
      try {
        // Always fetch real substitution data from database
        const realData = await dataService.getProductSubstitution();
        
        if (realData && realData.length > 0) {
          console.log('✅ Real product substitution data loaded:', realData.length, 'flows');
          return realData;
        }
        
        throw new Error('No real data available');
      } catch (error) {
        console.error('Failed to fetch product substitution data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
