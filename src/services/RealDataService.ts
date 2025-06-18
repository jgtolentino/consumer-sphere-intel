
import { DataService } from '../providers/DataProvider';

export class RealDataService implements DataService {
  constructor(private apiBaseUrl: string) {}

  async getTransactions(filters?: any): Promise<any[]> {
    const params = new URLSearchParams();
    
    if (filters?.dateRange?.from) {
      params.append('from', filters.dateRange.from.toISOString());
    }
    if (filters?.dateRange?.to) {
      params.append('to', filters.dateRange.to.toISOString());
    }
    if (filters?.regions?.length > 0) {
      params.append('regions', filters.regions.join(','));
    }
    
    const response = await fetch(`${this.apiBaseUrl}/transactions?${params}`);
    return response.json();
  }

  async getRegionalData(): Promise<any[]> {
    const response = await fetch(`${this.apiBaseUrl}/regional`);
    return response.json();
  }

  async getBrandData(): Promise<any[]> {
    const response = await fetch(`${this.apiBaseUrl}/brands`);
    return response.json();
  }

  async getConsumerData(): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}/consumers`);
    return response.json();
  }

  async getProductData(): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}/products`);
    return response.json();
  }
}
