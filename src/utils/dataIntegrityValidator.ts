import React from 'react';
import { 
  Transaction, 
  Region, 
  Brand, 
  regions, 
  tbwaClientBrands, 
  competitorBrands,
  brands
} from '../data/mockData';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalTransactions: number;
    clientTransactions: number;
    competitorTransactions: number;
    clientPercentage: number;
    totalRevenue: number;
    uniqueRegions: number;
    uniqueCities: number;
    uniqueBarangays: number;
    uniqueBrands: number;
    uniqueSkus: number;
    substitutionCount: number;
    aiRecommendationCount: number;
  };
}

export class DataIntegrityValidator {
  private regions: Map<string, Region>;
  private brands: Map<string, Brand>;
  private clientBrands: Set<string>;
  private competitorBrands: Set<string>;
  
  constructor() {
    this.regions = new Map(regions.map(r => [r.name, r]));
    this.brands = new Map(brands.map(b => [b.name, b]));
    this.clientBrands = new Set(tbwaClientBrands.map(b => b.name));
    this.competitorBrands = new Set(competitorBrands.map(b => b.name));
  }

  validateTransactions(transactions: Transaction[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats = this.calculateStats(transactions);
    
    // Validate each transaction
    transactions.forEach((txn, index) => {
      this.validateTransaction(txn, index, errors, warnings);
    });
    
    // Validate overall data integrity
    this.validateOverallIntegrity(transactions, stats, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats
    };
  }

  private validateTransaction(txn: Transaction, index: number, errors: string[], warnings: string[]) {
    const txnId = `Transaction ${txn.id} (index ${index})`;
    
    // Validate region/city/barangay relationship
    const region = this.regions.get(txn.region);
    if (!region) {
      errors.push(`${txnId}: Invalid region "${txn.region}"`);
    } else {
      if (!region.major_cities.includes(txn.city)) {
        errors.push(`${txnId}: City "${txn.city}" not found in region "${txn.region}"`);
      }
      if (!region.barangays.includes(txn.barangay)) {
        errors.push(`${txnId}: Barangay "${txn.barangay}" not found in region "${txn.region}"`);
      }
    }
    
    // Validate basket items
    if (!txn.basket || txn.basket.length === 0) {
      errors.push(`${txnId}: Empty basket`);
    } else {
      let basketTotal = 0;
      const basketBrands = new Set<string>();
      
      txn.basket.forEach((item, itemIndex) => {
        const itemId = `${txnId} - Item ${itemIndex}`;
        
        // Validate brand exists
        const brand = this.brands.get(item.brand);
        if (!brand) {
          errors.push(`${itemId}: Unknown brand "${item.brand}"`);
        } else {
          basketBrands.add(item.brand);
          
          // Validate category matches
          if (brand.category !== item.category) {
            errors.push(`${itemId}: Category mismatch - expected "${brand.category}", got "${item.category}"`);
          }
          
          // Validate SKU exists for brand
          const skuPrefix = item.sku.replace(brand.name + ' ', '');
          if (!brand.skus.includes(skuPrefix)) {
            warnings.push(`${itemId}: SKU "${skuPrefix}" not found in brand "${brand.name}" SKUs`);
          }
        }
        
        // Validate item quantities and prices
        if (item.units < 1) {
          errors.push(`${itemId}: Invalid units ${item.units}`);
        }
        if (item.price < 0) {
          errors.push(`${itemId}: Invalid price ${item.price}`);
        }
        
        basketTotal += item.price;
      });
      
      // Validate basket total
      if (Math.abs(basketTotal - txn.total) > 0.01) {
        errors.push(`${txnId}: Total mismatch - calculated ${basketTotal}, recorded ${txn.total}`);
      }
      
      // Validate basket brand consistency (should be either all client or all competitor)
      const hasClientBrands = Array.from(basketBrands).some(b => this.clientBrands.has(b));
      const hasCompetitorBrands = Array.from(basketBrands).some(b => this.competitorBrands.has(b));
      
      if (hasClientBrands && hasCompetitorBrands) {
        warnings.push(`${txnId}: Mixed client and competitor brands in same basket`);
      }
    }
    
    // Validate substitution logic
    if (txn.substitution_from || txn.substitution_to) {
      if (!txn.substitution_from || !txn.substitution_to) {
        errors.push(`${txnId}: Incomplete substitution data`);
      } else {
        if (!this.brands.has(txn.substitution_from)) {
          errors.push(`${txnId}: Unknown substitution_from brand "${txn.substitution_from}"`);
        }
        if (!this.brands.has(txn.substitution_to)) {
          errors.push(`${txnId}: Unknown substitution_to brand "${txn.substitution_to}"`);
        }
      }
    }
    
    // Validate consumer profile
    const validGenders = ['Male', 'Female'];
    const validAgeBrackets = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const validIncomeClasses = ['A', 'B', 'C1', 'C2', 'D', 'E'];
    const validPaymentMethods = ['Cash', 'GCash', 'Utang/Lista'];
    
    if (!validGenders.includes(txn.consumer_profile.gender)) {
      errors.push(`${txnId}: Invalid gender "${txn.consumer_profile.gender}"`);
    }
    if (!validAgeBrackets.includes(txn.consumer_profile.age_bracket)) {
      errors.push(`${txnId}: Invalid age bracket "${txn.consumer_profile.age_bracket}"`);
    }
    if (!validIncomeClasses.includes(txn.consumer_profile.inferred_income)) {
      errors.push(`${txnId}: Invalid income class "${txn.consumer_profile.inferred_income}"`);
    }
    if (!validPaymentMethods.includes(txn.consumer_profile.payment)) {
      errors.push(`${txnId}: Invalid payment method "${txn.consumer_profile.payment}"`);
    }
    
    // Validate behavioral fields
    const validRequestedAs = ['branded', 'unbranded', 'unsure'];
    const validRequestTypes = ['verbal', 'pointing', 'indirect'];
    
    if (!validRequestedAs.includes(txn.requested_as)) {
      errors.push(`${txnId}: Invalid requested_as value "${txn.requested_as}"`);
    }
    if (!validRequestTypes.includes(txn.request_type)) {
      errors.push(`${txnId}: Invalid request_type value "${txn.request_type}"`);
    }
    
    // Validate logical consistency
    if (!txn.storeowner_suggested && txn.accepted_suggestion) {
      errors.push(`${txnId}: accepted_suggestion is true but storeowner_suggested is false`);
    }
    
    // Validate date and time
    const transactionDate = new Date(txn.date);
    if (isNaN(transactionDate.getTime())) {
      errors.push(`${txnId}: Invalid date "${txn.date}"`);
    }
    
    const timeParts = txn.time.split(':');
    if (timeParts.length !== 2 || 
        parseInt(timeParts[0]) < 0 || parseInt(timeParts[0]) > 23 ||
        parseInt(timeParts[1]) < 0 || parseInt(timeParts[1]) > 59) {
      errors.push(`${txnId}: Invalid time "${txn.time}"`);
    }
    
    // Validate duration
    if (txn.duration_seconds < 30 || txn.duration_seconds > 600) {
      warnings.push(`${txnId}: Unusual duration ${txn.duration_seconds} seconds`);
    }
  }

  private validateOverallIntegrity(
    transactions: Transaction[], 
    stats: ValidationResult['stats'], 
    errors: string[], 
    warnings: string[]
  ) {
    // Validate client/competitor split (should be approximately 60/40)
    const clientPercentage = stats.clientPercentage;
    if (clientPercentage < 55 || clientPercentage > 65) {
      warnings.push(`Client transaction percentage is ${clientPercentage.toFixed(1)}%, expected ~60%`);
    }
    
    // Validate all regions are represented
    const missingRegions = regions.filter(r => 
      !transactions.some(t => t.region === r.name)
    );
    if (missingRegions.length > 0) {
      warnings.push(`Missing transactions for regions: ${missingRegions.map(r => r.name).join(', ')}`);
    }
    
    // Validate reasonable distribution
    const regionCounts = new Map<string, number>();
    transactions.forEach(t => {
      regionCounts.set(t.region, (regionCounts.get(t.region) || 0) + 1);
    });
    
    regions.forEach(region => {
      const count = regionCounts.get(region.name) || 0;
      const expectedCount = region.weight * transactions.length;
      const variance = Math.abs(count - expectedCount) / expectedCount;
      
      if (variance > 0.5) {
        warnings.push(
          `Region "${region.name}" has ${count} transactions, ` +
          `expected ~${Math.round(expectedCount)} based on weight ${region.weight}`
        );
      }
    });
  }

  private calculateStats(transactions: Transaction[]): ValidationResult['stats'] {
    let clientTransactions = 0;
    let competitorTransactions = 0;
    let totalRevenue = 0;
    const uniqueRegions = new Set<string>();
    const uniqueCities = new Set<string>();
    const uniqueBarangays = new Set<string>();
    const uniqueBrands = new Set<string>();
    const uniqueSkus = new Set<string>();
    let substitutionCount = 0;
    let aiRecommendationCount = 0;
    
    transactions.forEach(txn => {
      // Determine if client or competitor transaction
      const hasClientBrand = txn.basket.some(item => this.clientBrands.has(item.brand));
      if (hasClientBrand) {
        clientTransactions++;
      } else {
        competitorTransactions++;
      }
      
      totalRevenue += txn.total;
      uniqueRegions.add(txn.region);
      uniqueCities.add(txn.city);
      uniqueBarangays.add(txn.barangay);
      
      txn.basket.forEach(item => {
        uniqueBrands.add(item.brand);
        uniqueSkus.add(item.sku);
      });
      
      if (txn.substitution_from && txn.substitution_to) {
        substitutionCount++;
      }
      
      if (txn.ai_recommendation_id) {
        aiRecommendationCount++;
      }
    });
    
    return {
      totalTransactions: transactions.length,
      clientTransactions,
      competitorTransactions,
      clientPercentage: (clientTransactions / transactions.length) * 100,
      totalRevenue,
      uniqueRegions: uniqueRegions.size,
      uniqueCities: uniqueCities.size,
      uniqueBarangays: uniqueBarangays.size,
      uniqueBrands: uniqueBrands.size,
      uniqueSkus: uniqueSkus.size,
      substitutionCount,
      aiRecommendationCount
    };
  }
}

// Helper function to validate data summation across views
export function validateKpiSums(
  mockData: Transaction[], 
  filtered: Transaction[], 
  groupBy: keyof Transaction | ((txn: Transaction) => string)
): { isValid: boolean; details: any } {
  const parent = filtered.length;
  const grouped: Record<string, number> = {};
  
  filtered.forEach(txn => {
    const key = typeof groupBy === 'function' ? groupBy(txn) : String(txn[groupBy]);
    grouped[key] = (grouped[key] || 0) + 1;
  });
  
  const sum = Object.values(grouped).reduce((a, b) => a + b, 0);
  const isValid = parent === sum;
  
  return {
    isValid,
    details: {
      parentCount: parent,
      childrenSum: sum,
      groups: grouped,
      mismatch: parent - sum
    }
  };
}