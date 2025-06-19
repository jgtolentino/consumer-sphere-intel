
import { supabase } from '../integrations/supabase/client';
import { DataService } from '../providers/DataProvider';
import { SUPABASE_LIMITS } from '../config/supabase-limits';

export class RealDataService implements DataService {
  constructor(private apiBaseUrl?: string) {}

  async getTransactions(filters?: any): Promise<any[]> {
    let baseQuery = supabase
      .from('transactions')
      .select(`
        *,
        transaction_items(
          quantity,
          price,
          products(name, category, brands(name, category))
        )
      `);

    // Apply filters
    if (filters?.dateRange?.from) {
      baseQuery = baseQuery.gte('created_at', filters.dateRange.from.toISOString());
    }
    if (filters?.dateRange?.to) {
      baseQuery = baseQuery.lte('created_at', filters.dateRange.to.toISOString());
    }
    if (filters?.regions?.length > 0) {
      baseQuery = baseQuery.in('store_location', filters.regions);
    }

    // Use pagination to get more than 1000 records
    const allData: any[] = [];
    const pageSize = 1000; // Supabase default limit
    let page = 0;
    const maxRecords = SUPABASE_LIMITS.transactions;

    while (allData.length < maxRecords) {
      const query = baseQuery
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        break; // No more records
      }

      allData.push(...data);
      page++;

      // Stop if we've reached our limit or got less than a full page
      if (data.length < pageSize || allData.length >= maxRecords) {
        break;
      }
    }

    console.log(`Total FMCG transactions after filtering: ${allData.length}`);

    // Transform to match mock data structure
    return allData.slice(0, maxRecords).map(transaction => ({
      id: transaction.id,
      date: transaction.created_at,
      total: transaction.total_amount,
      region: transaction.store_location,
      consumer_profile: {
        gender: transaction.customer_gender,
        age_bracket: this.getAgeBracket(transaction.customer_age)
      },
      basket: transaction.transaction_items?.map((item: any) => ({
        sku: item.products?.name || 'Unknown',
        category: item.products?.brands?.category || 'Unknown',
        brand: item.products?.brands?.name || 'Unknown',
        units: item.quantity,
        price: item.price * item.quantity
      })) || []
    }));
  }

  async getRegionalData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('store_location, total_amount')
      .not('store_location', 'is', null);

    if (error) throw error;

    // Group by region and calculate totals
    const regionStats = data?.reduce((acc: any, transaction: any) => {
      const region = transaction.store_location;
      if (!acc[region]) {
        acc[region] = { region, transactions: 0, revenue: 0 };
      }
      acc[region].transactions += 1;
      acc[region].revenue += transaction.total_amount || 0;
      return acc;
    }, {});

    return Object.values(regionStats || {});
  }

  async getBrandData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('brand_analytics')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(SUPABASE_LIMITS.brands);

    if (error) throw error;

    return data?.map(brand => ({
      name: brand.brand_name,
      revenue: brand.total_revenue,
      transactions: brand.transaction_count,
      category: brand.category
    })) || [];
  }

  async getConsumerData(): Promise<any> {
    const { data, error } = await supabase
      .from('transactions')
      .select('customer_gender, customer_age')
      .not('customer_gender', 'is', null);

    if (error) throw error;

    const genderMix = this.processGenderMix(data || []);
    const ageMix = this.processAgeMix(data || []);

    return {
      genderMix,
      ageMix,
      total: data?.length || 0
    };
  }

  async getProductData(): Promise<any> {
    const { data, error } = await supabase
      .from('transaction_items')
      .select(`
        quantity,
        products(name, category, brands(name, category))
      `);

    if (error) throw error;

    const allItems = data?.map(item => ({
      category: item.products?.brands?.category || 'Unknown',
      sku: item.products?.name || 'Unknown',
      units: item.quantity,
      price: 0 // Price not available in this structure
    })) || [];

    return {
      categoryMix: this.processCategoryMix(allItems),
      topSkus: this.getTopSkus(allItems),
      total: allItems.length
    };
  }

  // Enhanced analytics methods
  async getSubstitutionData(): Promise<any> {
    const { data, error } = await supabase
      .from('substitutions')
      .select(`
        *,
        original_product:products!original_product_id(name),
        substitute_product:products!substitute_product_id(name)
      `);

    if (error) throw error;

    return {
      patterns: data?.map(sub => ({
        from: sub.original_product?.name || 'Unknown',
        to: sub.substitute_product?.name || 'Unknown',
        reason: sub.reason,
        count: 1
      })) || [],
      totalSubstitutions: data?.length || 0
    };
  }

  async getBehavioralData(): Promise<any> {
    const { data, error } = await supabase
      .from('request_behaviors')
      .select('*');

    if (error) throw error;

    const requestTypes = data?.reduce((acc: any, behavior: any) => {
      const type = behavior.request_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      requestTypes: Object.entries(requestTypes).map(([type, count]) => ({
        type,
        count,
        percentage: 0 // Calculate if needed
      })),
      storekeperInfluence: [],
      averageDuration: 0,
      aiRecommendations: { total: 0, percentage: 0 }
    };
  }

  async getLocationHierarchy(): Promise<any> {
    const { data, error } = await supabase
      .from('stores')
      .select('region, city, barangay');

    if (error) throw error;

    const hierarchy: Record<string, any> = {};
    
    data?.forEach(store => {
      if (!hierarchy[store.region]) {
        hierarchy[store.region] = { cities: {} };
      }
      if (!hierarchy[store.region].cities[store.city]) {
        hierarchy[store.region].cities[store.city] = { barangays: new Set() };
      }
      if (store.barangay) {
        hierarchy[store.region].cities[store.city].barangays.add(store.barangay);
      }
    });

    // Convert sets to arrays
    Object.keys(hierarchy).forEach(region => {
      Object.keys(hierarchy[region].cities).forEach(city => {
        hierarchy[region].cities[city].barangays = Array.from(hierarchy[region].cities[city].barangays);
      });
    });

    return hierarchy;
  }

  // Helper methods
  private getAgeBracket(age: number | null): string {
    if (!age) return 'Unknown';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  }

  private processGenderMix(data: any[]) {
    const genderCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.customer_gender) {
        genderCount[item.customer_gender] = (genderCount[item.customer_gender] || 0) + 1;
      }
    });
    
    const total = Object.values(genderCount).reduce((sum, count) => sum + count, 0);
    return Object.entries(genderCount).map(([gender, count]) => ({
      name: gender,
      value: count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private processAgeMix(data: any[]) {
    const ageCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.customer_age) {
        const bracket = this.getAgeBracket(item.customer_age);
        ageCount[bracket] = (ageCount[bracket] || 0) + 1;
      }
    });
    
    const total = Object.values(ageCount).reduce((sum, count) => sum + count, 0);
    return Object.entries(ageCount).map(([age, count]) => ({
      name: age,
      value: count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private processCategoryMix(items: any[]) {
    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + item.units;
    });
    
    const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
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

  // Product Mix methods
  async getCategoryMix(): Promise<any[]> {
    try {
      // Try to get real category mix data from transactions
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          transaction_items (
            products (
              category
            ),
            quantity,
            unit_price
          )
        `);

      if (error) throw error;

      // Process category mix from real data
      const categoryStats: Record<string, { value: number; count: number }> = {};
      
      data?.forEach((transaction: any) => {
        transaction.transaction_items?.forEach((item: any) => {
          const category = item.products?.category || 'Unknown';
          const value = (item.quantity || 0) * (item.unit_price || 0);
          
          if (!categoryStats[category]) {
            categoryStats[category] = { value: 0, count: 0 };
          }
          categoryStats[category].value += value;
          categoryStats[category].count += item.quantity || 0;
        });
      });

      const totalValue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.value, 0);
      
      return Object.entries(categoryStats)
        .map(([name, stats]) => ({
          name,
          value: stats.value,
          percentage: totalValue > 0 ? (stats.value / totalValue) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);
        
    } catch (error) {
      console.error('Failed to fetch category mix:', error);
      throw error;
    }
  }

  async getProductSubstitution(): Promise<any[]> {
    try {
      // Try to get real substitution patterns from customer behavior
      const { data, error } = await supabase
        .from('substitution_patterns')
        .select('*');

      if (error) throw error;

      return data || [];
      
    } catch (error) {
      console.error('Failed to fetch product substitution:', error);
      throw error;
    }
  }
}
