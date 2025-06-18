
import { DataService } from '../providers/DataProvider';
import { mockTransactions, getRegionalData, getTopBrands } from '../data/mockData';

export class MockDataService implements DataService {
  async getTransactions(filters?: any): Promise<any[]> {
    // Apply filters to mock data if provided
    let filteredTransactions = [...mockTransactions];
    
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
    // Process mock product data from transactions
    const allItems = mockTransactions.flatMap(t => t.basket);
    
    return {
      categoryMix: this.processCategoryMix(allItems),
      topSkus: this.getTopSkus(allItems),
      total: allItems.length
    };
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
      categoryCount[item.category] = (categoryCount[item.category] || 0) + item.units;
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
}
