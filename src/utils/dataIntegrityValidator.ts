
import { RealDataService } from '../services/RealDataService';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRecords: number;
    validRecords: number;
    errorRate: number;
  };
  stats?: {
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

interface KpiSumValidationResult {
  isValid: boolean;
  details: {
    parentCount: number;
    childrenSum: number;
    groups: Record<string, number>;
  };
}

export class DataIntegrityValidator {
  private dataService: RealDataService;

  constructor() {
    this.dataService = new RealDataService();
  }

  async validateTransactionData(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const transactions = await this.dataService.getTransactions();
      const totalRecords = transactions.length;
      let validRecords = 0;

      // Calculate stats
      const stats = this.calculateStats(transactions);

      // Validate each transaction
      transactions.forEach((transaction, index) => {
        const transactionErrors = this.validateTransaction(transaction, index);
        if (transactionErrors.length === 0) {
          validRecords++;
        } else {
          errors.push(...transactionErrors);
        }
      });

      // Check for data completeness
      if (totalRecords === 0) {
        errors.push('No transaction data found');
      }

      const errorRate = totalRecords > 0 ? ((totalRecords - validRecords) / totalRecords) * 100 : 0;
      
      if (errorRate > 10) {
        warnings.push(`High error rate detected: ${errorRate.toFixed(2)}%`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        summary: {
          totalRecords,
          validRecords,
          errorRate
        },
        stats
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to fetch transaction data: ${error}`],
        warnings: [],
        summary: {
          totalRecords: 0,
          validRecords: 0,
          errorRate: 100
        }
      };
    }
  }

  validateTransactions(transactions: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;
    
    const stats = this.calculateStats(transactions);

    transactions.forEach((transaction, index) => {
      const transactionErrors = this.validateTransaction(transaction, index);
      if (transactionErrors.length === 0) {
        validRecords++;
      } else {
        errors.push(...transactionErrors);
      }
    });

    const errorRate = transactions.length > 0 ? ((transactions.length - validRecords) / transactions.length) * 100 : 0;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRecords: transactions.length,
        validRecords,
        errorRate
      },
      stats
    };
  }

  private calculateStats(transactions: any[]) {
    const clientBrands = ['Alaska Milk', 'Oishi', 'Jack n Jill']; // Sample client brands
    
    let clientTransactions = 0;
    let totalRevenue = 0;
    let substitutionCount = 0;
    let aiRecommendationCount = 0;
    
    const uniqueRegions = new Set();
    const uniqueCities = new Set();
    const uniqueBarangays = new Set();
    const uniqueBrands = new Set();
    const uniqueSkus = new Set();

    transactions.forEach(txn => {
      // Count client transactions
      const hasClientBrand = txn.basket?.some((item: any) => 
        clientBrands.some(brand => String(item.brand).includes(brand))
      );
      if (hasClientBrand) clientTransactions++;

      // Sum revenue
      totalRevenue += Number(txn.total) || 0;

      // Count substitutions and AI recommendations
      if (txn.substitution_from && txn.substitution_to) substitutionCount++;
      if (txn.ai_recommendation) aiRecommendationCount++;

      // Track unique values
      uniqueRegions.add(txn.region);
      uniqueCities.add(txn.city);
      uniqueBarangays.add(txn.barangay);
      
      txn.basket?.forEach((item: any) => {
        uniqueBrands.add(item.brand);
        uniqueSkus.add(item.sku);
      });
    });

    return {
      totalTransactions: transactions.length,
      clientTransactions,
      competitorTransactions: transactions.length - clientTransactions,
      clientPercentage: transactions.length > 0 ? (clientTransactions / transactions.length) * 100 : 0,
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

  private validateTransaction(transaction: any, index: number): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!transaction.id) {
      errors.push(`Transaction ${index}: Missing ID`);
    }

    if (!transaction.total && transaction.total !== 0) {
      errors.push(`Transaction ${index}: Missing total amount`);
    }

    if (!transaction.date && !transaction.created_at) {
      errors.push(`Transaction ${index}: Missing date`);
    }

    // Validate basket data
    if (transaction.basket && Array.isArray(transaction.basket)) {
      transaction.basket.forEach((item: any, itemIndex: number) => {
        if (!item.sku && !item.name) {
          errors.push(`Transaction ${index}, Item ${itemIndex}: Missing product identifier`);
        }
        if (!item.price && item.price !== 0) {
          errors.push(`Transaction ${index}, Item ${itemIndex}: Missing price`);
        }
        if (!item.units && item.units !== 0) {
          errors.push(`Transaction ${index}, Item ${itemIndex}: Missing quantity`);
        }
      });
    }

    return errors;
  }

  async validateBrandData(): Promise<ValidationResult> {
    try {
      const brands = await this.dataService.getBrandData();
      const errors: string[] = [];
      const warnings: string[] = [];
      
      brands.forEach((brand, index) => {
        if (!brand.name) {
          errors.push(`Brand ${index}: Missing name`);
        }
        if (!brand.category) {
          warnings.push(`Brand ${index}: Missing category`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        summary: {
          totalRecords: brands.length,
          validRecords: brands.length - errors.length,
          errorRate: brands.length > 0 ? (errors.length / brands.length) * 100 : 0
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to validate brand data: ${error}`],
        warnings: [],
        summary: { totalRecords: 0, validRecords: 0, errorRate: 100 }
      };
    }
  }
}

export function validateKpiSums(
  parentData: any[],
  childData: any[],
  groupByField: string
): KpiSumValidationResult {
  const groups: Record<string, number> = {};
  
  childData.forEach(item => {
    const key = String(item[groupByField]);
    groups[key] = (groups[key] || 0) + 1;
  });

  const childrenSum = Object.values(groups).reduce((sum, count) => sum + count, 0);

  return {
    isValid: childrenSum === childData.length,
    details: {
      parentCount: parentData.length,
      childrenSum,
      groups
    }
  };
}

export const dataIntegrityValidator = new DataIntegrityValidator();
