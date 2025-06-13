
import { useQuery } from '@tanstack/react-query';
import { supabase, withLimit } from '../lib/supabase';
import { useFilterStore } from '../state/useFilterStore';

export const useConsumers = () => {
  const { barangays } = useFilterStore();

  return useQuery({
    queryKey: ['consumers', barangays],
    queryFn: async () => {
      let query = withLimit('customers', supabase
        .from('customers')
        .select('*'));

      // Apply filters
      if (barangays.length > 0) {
        query = query.in('barangay', barangays);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const customers = data || [];
      
      return {
        genderMix: processGenderMix(customers),
        ageMix: processAgeMix(customers),
        purchaseFunnel: [], // Would need transaction flow data
        geoData: processGeoData(customers),
        total: customers.length,
        raw: customers
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

const processGenderMix = (customers: any[]) => {
  const genderCount: Record<string, number> = {};
  
  customers.forEach(customer => {
    const gender = customer.gender || 'Unknown';
    genderCount[gender] = (genderCount[gender] || 0) + 1;
  });

  return Object.entries(genderCount).map(([gender, count]) => ({
    name: gender,
    value: count,
    percentage: (count / customers.length) * 100
  }));
};

const processAgeMix = (customers: any[]) => {
  const ageCount: Record<string, number> = {};
  
  customers.forEach(customer => {
    const ageGroup = customer.age_group || 'Unknown';
    ageCount[ageGroup] = (ageCount[ageGroup] || 0) + 1;
  });

  return Object.entries(ageCount).map(([ageGroup, count]) => ({
    name: ageGroup,
    value: count,
    percentage: (count / customers.length) * 100
  }));
};

const processGeoData = (customers: any[]) => {
  const barangayCount: Record<string, number> = {};
  
  customers.forEach(customer => {
    const barangay = customer.barangay;
    barangayCount[barangay] = (barangayCount[barangay] || 0) + 1;
  });

  return Object.entries(barangayCount).map(([barangay, count]) => ({
    location: barangay,
    value: count
  }));
};
