
import { useQuery } from '@tanstack/react-query';
import { useDataService } from '../providers/DataProvider';
import { useFilterStore } from '../state/useFilterStore';

export const useComprehensiveAnalytics = () => {
  const dataService = useDataService();
  const { dateRange, barangays, categories, brands, getMasterLists } = useFilterStore();

  return useQuery({
    queryKey: ['comprehensive-analytics', dateRange, barangays, categories, brands],
    queryFn: async () => {
      const filters = {
        dateRange,
        regions: barangays,
        categories,
        brands
      };

      const transactions = await dataService.getTransactions(filters);
      const masterLists = getMasterLists();

      // Generate comprehensive analytics with zero-filling
      const regionalAnalytics = generateRegionalAnalytics(transactions, masterLists.allRegions);
      const brandAnalytics = generateBrandAnalytics(transactions, masterLists.allBrands);
      const categoryAnalytics = generateCategoryAnalytics(transactions, masterLists.allCategories);
      const companyAnalytics = generateCompanyAnalytics(transactions, masterLists.allCompanies);

      return {
        transactions,
        regionalAnalytics,
        brandAnalytics,
        categoryAnalytics,
        companyAnalytics,
        totalMetrics: {
          totalTransactions: transactions.length,
          totalRevenue: transactions.reduce((sum, t) => sum + (t.total || 0), 0),
          avgTransactionValue: transactions.length > 0 ? 
            transactions.reduce((sum, t) => sum + (t.total || 0), 0) / transactions.length : 0
        }
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Helper functions to ensure complete dimension coverage
const generateRegionalAnalytics = (transactions: any[], allRegions: string[]) => {
  const regionStats = allRegions.map(region => {
    const regionTransactions = transactions.filter(t => t.region === region);
    const revenue = regionTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    
    return {
      region,
      transactions: regionTransactions.length,
      revenue,
      marketShare: transactions.length > 0 ? (regionTransactions.length / transactions.length) * 100 : 0,
      avgTransactionValue: regionTransactions.length > 0 ? revenue / regionTransactions.length : 0
    };
  });

  return regionStats.sort((a, b) => b.revenue - a.revenue);
};

const generateBrandAnalytics = (transactions: any[], allBrands: string[]) => {
  const brandStats = allBrands.map(brand => {
    const brandTransactions = transactions.filter(t => 
      t.basket?.some((item: any) => item.brand === brand)
    );
    const revenue = brandTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const units = brandTransactions.reduce((sum, t) => 
      sum + (t.basket?.filter((item: any) => item.brand === brand)
        .reduce((itemSum: number, item: any) => itemSum + (item.units || 0), 0) || 0), 0
    );

    return {
      brand,
      transactions: brandTransactions.length,
      revenue,
      units,
      marketShare: transactions.length > 0 ? (brandTransactions.length / transactions.length) * 100 : 0
    };
  });

  return brandStats.sort((a, b) => b.revenue - a.revenue);
};

const generateCategoryAnalytics = (transactions: any[], allCategories: string[]) => {
  const categoryStats = allCategories.map(category => {
    const categoryTransactions = transactions.filter(t => 
      t.basket?.some((item: any) => item.category === category)
    );
    const revenue = categoryTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

    return {
      category,
      transactions: categoryTransactions.length,
      revenue,
      marketShare: transactions.length > 0 ? (categoryTransactions.length / transactions.length) * 100 : 0
    };
  });

  return categoryStats.sort((a, b) => b.revenue - a.revenue);
};

const generateCompanyAnalytics = (transactions: any[], allCompanies: string[]) => {
  const companyStats = allCompanies.map(company => {
    const companyTransactions = transactions.filter(t => 
      t.basket?.some((item: any) => {
        const allBrands = [...tbwaClientBrands, ...competitorBrands];
        const brandObj = allBrands.find(b => b.name === item.brand);
        return brandObj?.company === company;
      })
    );
    const revenue = companyTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

    return {
      company,
      transactions: companyTransactions.length,
      revenue,
      marketShare: transactions.length > 0 ? (companyTransactions.length / transactions.length) * 100 : 0,
      isClient: [...tbwaClientBrands].some(b => b.company === company)
    };
  });

  return companyStats.sort((a, b) => b.revenue - a.revenue);
};
