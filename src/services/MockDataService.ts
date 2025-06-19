
import { DataService } from '../providers/DataProvider';
import { 
  mockTransactions, 
  getRegionalData, 
  getTopBrands, 
  getSubstitutionPatterns,
  getRequestTypeAnalytics,
  getStorekeeperInfluence
} from '../data/mockData';

// FMCG categories filter - Updated to include tobacco products
const FMCG_CATEGORIES = [
  'Dairy & Milk Products',
  'Snacks & Confectionery', 
  'Beverages',
  'Personal Care',
  'Household Cleaning',
  'Food & Grocery',
  'Health & Wellness',
  'Baby Care',
  'Tobacco Products',
  'Frozen Foods',
  'Canned Goods',
  'Condiments & Sauces',
  'Bakery Products',
  'Fresh Produce'
];

export class MockDataService implements DataService {
  private filterFMCGTransactions(transactions: any[]) {
    return transactions.map(transaction => ({
      ...transaction,
      basket: transaction.basket.filter((item: any) => 
        FMCG_CATEGORIES.includes(item.category)
      )
    })).filter(transaction => transaction.basket.length > 0);
  }

  async getTransactions(filters?: any): Promise<any[]> {
    // Apply filters to mock data if provided
    let filteredTransactions = [...mockTransactions];
    
    // Filter to FMCG categories only (including tobacco)
    filteredTransactions = this.filterFMCGTransactions(filteredTransactions);
    
    console.log(`Total FMCG transactions after filtering: ${filteredTransactions.length}`);
    
    if (filters?.dateRange?.from) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= filters.dateRange.from
      );
    }
    
    if (filters?.regions?.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => 
        filters.regions.includes(t.region)
      );
    }
    
    if (filters?.categories?.length > 0) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.basket.some((item: any) => filters.categories.includes(item.category))
      );
    }
    
    if (filters?.brands?.length > 0) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.basket.some((item: any) => filters.brands.includes(item.brand))
      );
    }
    
    return filteredTransactions;
  }

  async getRegionalData(): Promise<any[]> {
    return getRegionalData();
  }

  async getBrandData(): Promise<any[]> {
    return getTopBrands();
  }

  async getConsumerData(): Promise<any> {
    // Process mock consumer data
    const consumers = mockTransactions.map(t => t.consumer_profile);
    
    return {
      genderMix: this.processGenderMix(consumers),
      ageMix: this.processAgeMix(consumers),
      total: consumers.length
    };
  }

  async getProductData(): Promise<any> {
    // Process mock product data from transactions with FMCG filter
    const fmcgTransactions = this.filterFMCGTransactions(mockTransactions);
    const allItems = fmcgTransactions.flatMap(t => t.basket);
    
    return {
      categoryMix: this.processCategoryMix(allItems),
      topSkus: this.getTopSkus(allItems),
      total: allItems.length
    };
  }

  // New methods for behavioral analytics
  async getSubstitutionData(): Promise<any> {
    return {
      patterns: getSubstitutionPatterns(),
      totalSubstitutions: mockTransactions.filter(t => t.substitution_from).length
    };
  }

  async getBehavioralData(): Promise<any> {
    return {
      requestTypes: getRequestTypeAnalytics(),
      storekeperInfluence: getStorekeeperInfluence(),
      averageDuration: this.getAverageDuration(),
      aiRecommendations: this.getAiRecommendationStats()
    };
  }

  async getLocationHierarchy(): Promise<any> {
    // Build location hierarchy for drilldown
    const hierarchy: Record<string, any> = {};
    
    mockTransactions.forEach(t => {
      if (!hierarchy[t.region]) {
        hierarchy[t.region] = { cities: {} };
      }
      if (!hierarchy[t.region].cities[t.city]) {
        hierarchy[t.region].cities[t.city] = { barangays: new Set() };
      }
      hierarchy[t.region].cities[t.city].barangays.add(t.barangay);
    });

    // Convert sets to arrays
    Object.keys(hierarchy).forEach(region => {
      Object.keys(hierarchy[region].cities).forEach(city => {
        hierarchy[region].cities[city].barangays = Array.from(hierarchy[region].cities[city].barangays);
      });
    });

    return hierarchy;
  }

  private processGenderMix(consumers: any[]) {
    const genderCount: Record<string, number> = {};
    consumers.forEach(c => {
      genderCount[c.gender] = (genderCount[c.gender] || 0) + 1;
    });
    
    return Object.entries(genderCount).map(([gender, count]) => ({
      name: gender,
      value: count,
      percentage: (count / consumers.length) * 100
    }));
  }

  private processAgeMix(consumers: any[]) {
    const ageCount: Record<string, number> = {};
    consumers.forEach(c => {
      ageCount[c.age_bracket] = (ageCount[c.age_bracket] || 0) + 1;
    });
    
    return Object.entries(ageCount).map(([age, count]) => ({
      name: age,
      value: count,
      percentage: (count / consumers.length) * 100
    }));
  }

  private processCategoryMix(items: any[]) {
    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      if (FMCG_CATEGORIES.includes(item.category)) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + item.units;
      }
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: (count / items.length) * 100
    }));
  }

  private getTopSkus(items: any[]) {
    const skuStats: Record<string, { units: number; revenue: number }> = {};
    
    items.forEach(item => {
      if (!skuStats[item.sku]) {
        skuStats[item.sku] = { units: 0, revenue: 0 };
      }
      skuStats[item.sku].units += item.units;
      skuStats[item.sku].revenue += item.price;
    });
    
    return Object.entries(skuStats)
      .map(([sku, stats]) => ({
        name: sku,
        category: items.find(i => i.sku === sku)?.category || 'Unknown',
        sales: stats.units,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private getAverageDuration() {
    const totalDuration = mockTransactions.reduce((sum, t) => sum + t.duration_seconds, 0);
    return Math.round(totalDuration / mockTransactions.length);
  }

  private getAiRecommendationStats() {
    const withRecommendations = mockTransactions.filter(t => t.ai_recommendation_id).length;
    return {
      total: withRecommendations,
      percentage: (withRecommendations / mockTransactions.length) * 100
    };
  }
}
