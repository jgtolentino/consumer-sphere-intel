
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
        }
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

export const dataIntegrityValidator = new DataIntegrityValidator();
