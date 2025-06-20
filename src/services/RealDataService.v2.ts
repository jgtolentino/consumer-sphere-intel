/**
import React from 'react';
 * RealDataService V2 - Schema Compliant  
 * Uses canonical schema types - must mirror MockDataService exactly
 */

import { supabase } from '../integrations/supabase/client';
import { DataService } from '../providers/DataProvider';
import { SUPABASE_LIMITS } from '../config/supabase-limits';
import {
  TransactionWithDetails,
  RegionalData,
  BrandPerformance,
  CategoryMix,
  ProductSubstitution,
  ConsumerInsight,
  DashboardFilters
} from '../schema';

export class RealDataServiceV2 implements DataService {
  constructor(private apiBaseUrl?: string) {}

  async getTransactions(filters?: DashboardFilters): Promise<TransactionWithDetails[]> {
    let baseQuery = supabase
      .from('transactions')
      .select(`
        id,
        total_amount,
        created_at,
        customer_age,
        customer_gender,
        store_location,
        store_id,
        payment_method,
        transaction_items!transaction_items_transaction_id_fkey(
          id,
          transaction_id,
          product_id,
          quantity,
          unit_price,
          created_at,
          products!transaction_items_product_id_fkey(
            id,
            name,
            category,
            brand_id,
            created_at,
            brands!products_brand_id_fkey(
              id,
              name,
              category,
              is_tbwa,
              created_at
            )
          )
        )
      `);

    // Apply filters exactly like MockDataService
    if (filters?.dateRange?.from) {
      baseQuery = baseQuery.gte('created_at', filters.dateRange.from.toISOString());
    }
    if (filters?.dateRange?.to) {
      baseQuery = baseQuery.lte('created_at', filters.dateRange.to.toISOString());
    }
    if (filters?.regions?.length) {
      // Filter by store_location containing any of the regions
      const regionFilter = filters.regions.map(region => `store_location.ilike.${region}%`).join(',');
      // Use 'or' filter for multiple regions
      baseQuery = baseQuery.or(regionFilter);
    }

    // Use pagination to handle large datasets
    const allData: any[] = [];
    const pageSize = 1000;
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
        break;
      }

      allData.push(...data);
      page++;

      if (data.length < pageSize || allData.length >= maxRecords) {
        break;
      }
    }

    // Transform to match canonical schema exactly
    const transformedData: TransactionWithDetails[] = allData.slice(0, maxRecords).map(transaction => {
      // Parse store location into components (format: "Region, City, Barangay, ...")
      const locationParts = (transaction.store_location || '').split(', ');
      const region = locationParts[0] || 'Unknown';
      const city = locationParts[1] || 'Unknown';
      const barangay = locationParts[2] || 'Unknown';
      
      // Determine age bracket from customer_age
      const getAgeBracket = (age: number | null): string => {
        if (!age) return 'Unknown';
        if (age < 25) return '18-24';
        if (age < 35) return '25-34';
        if (age < 45) return '35-44';
        if (age < 55) return '45-54';
        return '55+';
      };

      return {
        id: transaction.id,
        customer_id: `customer_${transaction.id}`, // Generate virtual customer ID
        store_id: transaction.store_id || `store_${region}_${city}`,
        total_amount: transaction.total_amount,
        created_at: transaction.created_at,
        transaction_items: (transaction.transaction_items || []).map((item: any) => ({
          id: item.id,
          transaction_id: item.transaction_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          products: {
            id: item.products?.id || 0,
            name: item.products?.name || 'Unknown Product',
            category: item.products?.category || 'Unknown',
            brand_id: item.products?.brand_id || 0,
            created_at: item.products?.created_at || item.created_at,
            brands: {
              id: item.products?.brands?.id || 0,
              name: item.products?.brands?.name || 'Unknown Brand',
              category: item.products?.brands?.category || 'Unknown',
              is_tbwa: item.products?.brands?.is_tbwa || false,
              created_at: item.products?.brands?.created_at || item.created_at
            }
          }
        })),
        customers: {
          id: `customer_${transaction.id}`,
          age_bracket: getAgeBracket(transaction.customer_age),
          gender: transaction.customer_gender || 'Unknown',
          inferred_income: 'Unknown', // Not available in current schema
          payment_method: transaction.payment_method || 'Unknown',
          created_at: transaction.created_at
        },
        stores: {
          id: transaction.store_id || `store_${region}_${city}`,
          name: `Store ${city}`, // Generate store name
          location: transaction.store_location || 'Unknown',
          region: region,
          city: city,
          barangay: barangay,
          created_at: transaction.created_at
        }
      };
    });

    // Apply brand filters after data transformation
    let filteredData = transformedData;
    if (filters?.brands?.length) {
      filteredData = filteredData.filter(t => 
        t.transaction_items.some(item => 
          filters.brands!.includes(item.products.brands.name)
        )
      );
    }

    console.log(`Total FMCG transactions after filtering: ${filteredData.length}`);
    return filteredData;
  }

  async getRegionalData(): Promise<RegionalData[]> {
    const transactions = await this.getTransactions();
    const regionalMap = new Map<string, { count: number; revenue: number }>();
    
    transactions.forEach(t => {
      const region = t.stores.region;
      const current = regionalMap.get(region) || { count: 0, revenue: 0 };
      regionalMap.set(region, {
        count: current.count + 1,
        revenue: current.revenue + t.total_amount
      });
    });
    
    return Array.from(regionalMap.entries()).map(([region, data]) => ({
      region,
      transaction_count: data.count,
      total_revenue: data.revenue,
      avg_transaction_value: data.revenue / data.count
    }));
  }

  async getBrandData(): Promise<BrandPerformance[]> {
    const transactions = await this.getTransactions();
    const brandMap = new Map<string, { count: number; revenue: number; brand: any }>();
    
    transactions.forEach(t => {
      t.transaction_items.forEach(item => {
        const brandName = item.products.brands.name;
        const current = brandMap.get(brandName) || { count: 0, revenue: 0, brand: item.products.brands };
        brandMap.set(brandName, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.quantity * item.unit_price),
          brand: current.brand
        });
      });
    });
    
    const totalRevenue = Array.from(brandMap.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return Array.from(brandMap.entries()).map(([brandName, data]) => ({
      brand_name: brandName,
      category: data.brand.category || 'Unknown',
      is_tbwa: data.brand.is_tbwa || false,
      transaction_count: data.count,
      total_revenue: data.revenue,
      market_share: (data.revenue / totalRevenue) * 100
    }));
  }

  async getConsumerData(): Promise<ConsumerInsight[]> {
    const transactions = await this.getTransactions();
    const consumerMap = new Map<string, { count: number; revenue: number; customer: any }>();
    
    transactions.forEach(t => {
      const key = `${t.customers.age_bracket}-${t.customers.gender}-${t.customers.inferred_income}-${t.customers.payment_method}`;
      const current = consumerMap.get(key) || { count: 0, revenue: 0, customer: t.customers };
      consumerMap.set(key, {
        count: current.count + 1,
        revenue: current.revenue + t.total_amount,
        customer: current.customer
      });
    });
    
    return Array.from(consumerMap.values()).map(data => ({
      age_bracket: data.customer.age_bracket,
      gender: data.customer.gender,
      inferred_income: data.customer.inferred_income,
      payment_method: data.customer.payment_method,
      transaction_count: data.count,
      avg_transaction_value: data.revenue / data.count
    }));
  }

  async getProductData(): Promise<any> {
    const transactions = await this.getTransactions();
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    
    transactions.forEach(t => {
      t.transaction_items.forEach(item => {
        const category = item.products.category;
        const current = categoryMap.get(category) || { count: 0, revenue: 0 };
        categoryMap.set(category, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.quantity * item.unit_price)
        });
      });
    });
    
    const totalRevenue = Array.from(categoryMap.values()).reduce((sum, data) => sum + data.revenue, 0);
    
    return {
      categories: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        transaction_count: data.count,
        total_revenue: data.revenue,
        percentage_of_total: (data.revenue / totalRevenue) * 100
      }))
    };
  }

  async getCategoryMix(): Promise<CategoryMix[]> {
    const productData = await this.getProductData();
    return productData.categories;
  }

  async getProductSubstitution(): Promise<ProductSubstitution[]> {
    try {
      const { data, error } = await supabase
        .from('substitutions')
        .select(`
          *,
          original_products:original_product_id(name, brands!products_brand_id_fkey(name)),
          substitute_products:substitute_product_id(name, brands!products_brand_id_fkey(name))
        `);

      if (error) throw error;

      return data?.map(sub => ({
        from_product: sub.original_products?.name || 'Unknown',
        to_product: sub.substitute_products?.name || 'Unknown',
        substitution_count: 1, // Count would need aggregation in real implementation
        from_brand: sub.original_products?.brands?.name || 'Unknown',
        to_brand: sub.substitute_products?.brands?.name || 'Unknown',
        category: sub.original_products?.category || 'Unknown'
      })) || [];
      
    } catch (error) {
      console.error('Failed to fetch product substitution:', error);
      return [];
    }
  }

  // Additional methods for compatibility with existing interface
  async getSubstitutionData(): Promise<any> {
    const substitutions = await this.getProductSubstitution();
    return {
      patterns: substitutions,
      totalSubstitutions: substitutions.length
    };
  }

  async getBehavioralData(): Promise<any> {
    const { data, error } = await supabase
      .from('customer_requests')
      .select('*');

    if (error) {
      console.error('Error fetching behavioral data:', error);
      return {
        requestTypes: [],
        storekeperInfluence: [],
        averageDuration: 0,
        aiRecommendations: { total: 0, percentage: 0 }
      };
    }

    const requestTypes = data?.reduce((acc: any, request: any) => {
      const type = request.request_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    const total = Object.values(requestTypes).reduce((sum: number, count: any) => sum + count, 0);

    return {
      requestTypes: Object.entries(requestTypes).map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? ((count as number) / total) * 100 : 0
      })),
      storekeperInfluence: [],
      averageDuration: 0,
      aiRecommendations: { 
        total: data?.filter(r => r.accepted_suggestion).length || 0, 
        percentage: total > 0 ? ((data?.filter(r => r.accepted_suggestion).length || 0) / total) * 100 : 0
      }
    };
  }

  async getLocationHierarchy(): Promise<any> {
    const { data, error } = await supabase
      .from('stores')
      .select('region, city, barangay');

    if (error) {
      console.error('Error fetching location hierarchy:', error);
      return {};
    }

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

    // Convert Sets to Arrays
    Object.keys(hierarchy).forEach(region => {
      Object.keys(hierarchy[region].cities).forEach(city => {
        hierarchy[region].cities[city].barangays = Array.from(hierarchy[region].cities[city].barangays);
      });
    });

    return hierarchy;
  }
}