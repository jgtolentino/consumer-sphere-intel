
import { describe, it, expect, beforeAll } from 'vitest';
import { 
  mockTransactions, 
  regions, 
  tbwaClientBrands, 
  competitorBrands,
  brands,
  getRegionalData,
  getTopBrands,
  getSubstitutionPatterns,
  getRequestTypeAnalytics,
  getStorekeeperInfluence
} from '../data/mockData';
import { MockDataService } from '../services/MockDataService';
import { DataIntegrityValidator, validateKpiSums } from '../utils/dataIntegrityValidator';

describe('Comprehensive QA Audit - 5,000 Mock Records', () => {
  let validator: DataIntegrityValidator;
  let mockDataService: MockDataService;
  
  beforeAll(() => {
    validator = new DataIntegrityValidator();
    mockDataService = new MockDataService();
  });

  describe('1. Data Integrity Validation', () => {
    it('should have exactly 5,000 mock transactions', () => {
      expect(mockTransactions.length).toBe(5000);
    });

    it('should pass all data integrity checks', () => {
      const result = validator.validateTransactions(mockTransactions);
      
      console.log('Data Integrity Report:');
      console.log(`Total Transactions: ${result.stats.totalTransactions}`);
      console.log(`Client Transactions: ${result.stats.clientTransactions} (${result.stats.clientPercentage.toFixed(1)}%)`);
      console.log(`Competitor Transactions: ${result.stats.competitorTransactions}`);
      console.log(`Total Revenue: ₱${result.stats.totalRevenue.toLocaleString()}`);
      console.log(`Unique Regions: ${result.stats.uniqueRegions}`);
      console.log(`Unique Cities: ${result.stats.uniqueCities}`);
      console.log(`Unique Brands: ${result.stats.uniqueBrands}`);
      console.log(`Substitutions: ${result.stats.substitutionCount}`);
      console.log(`AI Recommendations: ${result.stats.aiRecommendationCount}`);
      
      if (result.errors.length > 0) {
        console.error('Validation Errors:', result.errors);
      }
      if (result.warnings.length > 0) {
        console.warn('Validation Warnings:', result.warnings);
      }
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have ~60% client brand transactions', () => {
      const result = validator.validateTransactions(mockTransactions);
      expect(result.stats.clientPercentage).toBeGreaterThan(55);
      expect(result.stats.clientPercentage).toBeLessThan(65);
    });

    it('should have all 17 regions represented', () => {
      const regionSet = new Set(mockTransactions.map(t => t.region));
      expect(regionSet.size).toBe(17);
      
      regions.forEach(region => {
        expect(regionSet.has(region.name)).toBe(true);
      });
    });

    it('should have valid relational integrity for all transactions', () => {
      mockTransactions.forEach(txn => {
        // Check region-city-barangay relationship
        const region = regions.find(r => r.name === txn.region);
        expect(region).toBeDefined();
        expect(region!.major_cities).toContain(txn.city);
        expect(region!.barangays).toContain(txn.barangay);
        
        // Check basket items
        txn.basket.forEach(item => {
          const brand = brands.find(b => b.name === item.brand);
          expect(brand).toBeDefined();
          expect(brand!.category).toBe(item.category);
        });
      });
    });
  });

  describe('2. Dashboard KPI Validation', () => {
    it('should calculate correct total metrics', async () => {
      const allTransactions = await mockDataService.getTransactions();
      
      const totalRevenue = allTransactions.reduce((sum: number, t: any) => {
        const transactionTotal = Number(t.total) || 0;
        return sum + transactionTotal;
      }, 0);
      const avgBasketSize = totalRevenue / allTransactions.length;
      const totalItems = allTransactions.reduce((sum: number, t: any) => 
        sum + (t.basket?.reduce((itemSum: number, item: any) => itemSum + (Number(item.units) || 0), 0) || 0), 0
      );
      
      expect(allTransactions.length).toBe(5000);
      expect(totalRevenue).toBeGreaterThan(0);
      expect(avgBasketSize).toBeGreaterThan(0);
      expect(totalItems).toBeGreaterThan(5000); // At least 1 item per transaction
    });

    it('should filter data correctly by region', async () => {
      const ncr = await mockDataService.getTransactions({ regions: ['NCR'] });
      const bicol = await mockDataService.getTransactions({ regions: ['Bicol Region'] });
      const combined = await mockDataService.getTransactions({ regions: ['NCR', 'Bicol Region'] });
      
      expect(ncr.length).toBeGreaterThan(0);
      expect(bicol.length).toBeGreaterThan(0);
      expect(combined.length).toBe(ncr.length + bicol.length);
      
      // Validate all filtered transactions are from correct regions
      ncr.forEach((t: any) => expect(String(t.region)).toBe('NCR'));
      bicol.forEach((t: any) => expect(String(t.region)).toBe('Bicol Region'));
    });

    it('should filter data correctly by brand', async () => {
      const alaska = await mockDataService.getTransactions({ 
        brands: ['Alaska Evaporated Milk', 'Alaska Condensed Milk'] 
      });
      
      expect(alaska.length).toBeGreaterThan(0);
      alaska.forEach((t: any) => {
        const hasAlaskaBrand = t.basket?.some((item: any) => 
          String(item.brand).includes('Alaska Evaporated Milk') || 
          String(item.brand).includes('Alaska Condensed Milk')
        );
        expect(hasAlaskaBrand).toBe(true);
      });
    });

    it('should filter data correctly by date range', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = await mockDataService.getTransactions({
        dateRange: { from: thirtyDaysAgo }
      });
      
      expect(recentTransactions.length).toBeGreaterThan(0);
      expect(recentTransactions.length).toBeLessThan(5000);
      
      recentTransactions.forEach((t: any) => {
        expect(new Date(String(t.date)).getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
      });
    });
  });

  describe('3. Data Summation Validation', () => {
    it('should have regional breakdowns sum to total', async () => {
      const allTransactions = await mockDataService.getTransactions();
      
      // Group by region
      const regionValidation = validateKpiSums(
        mockTransactions, 
        allTransactions, 
        'region' as keyof typeof mockTransactions[0]
      );
      
      expect(regionValidation.isValid).toBe(true);
      expect(regionValidation.details.parentCount).toBe(5000);
      expect(regionValidation.details.childrenSum).toBe(5000);
    });

    it('should have city breakdowns sum to regional totals', async () => {
      for (const region of regions.slice(0, 3)) { // Test first 3 regions
        const regionTransactions = await mockDataService.getTransactions({ 
          regions: [region.name] 
        });
        
        const cityValidation = validateKpiSums(
          mockTransactions,
          regionTransactions,
          'city' as keyof typeof mockTransactions[0]
        );
        
        expect(cityValidation.isValid).toBe(true);
        
        // Sum of all cities should equal region total
        const citySum = Object.values(cityValidation.details.groups)
          .reduce((sum, count) => sum + count, 0);
        expect(citySum).toBe(regionTransactions.length);
      }
    });

    it('should have brand breakdowns sum to total', async () => {
      const allTransactions = await mockDataService.getTransactions();
      
      // Create a map of brand counts
      const brandCounts = new Map<string, number>();
      allTransactions.forEach((txn: any) => {
        const brandsInBasket = new Set(txn.basket?.map((item: any) => String(item.brand)) || []);
        brandsInBasket.forEach(brand => {
          brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
        });
      });
      
      // Verify client vs competitor split
      let clientCount = 0;
      let competitorCount = 0;
      
      brandCounts.forEach((count, brand) => {
        if (tbwaClientBrands.some(b => b.name === brand)) {
          clientCount += count;
        } else if (competitorBrands.some(b => b.name === brand)) {
          competitorCount += count;
        }
      });
      
      // Note: Sum might be > 5000 because transactions can have multiple brands
      expect(clientCount + competitorCount).toBeGreaterThanOrEqual(5000);
    });

    it('should have payment method breakdowns sum to total', () => {
      const paymentCounts = new Map<string, number>();
      
      mockTransactions.forEach(txn => {
        const payment = txn.consumer_profile.payment;
        paymentCounts.set(payment, (paymentCounts.get(payment) || 0) + 1);
      });
      
      const totalPayments = Array.from(paymentCounts.values())
        .reduce((sum, count) => sum + count, 0);
      
      expect(totalPayments).toBe(5000);
      expect(paymentCounts.get('Cash')).toBeGreaterThan(0);
      expect(paymentCounts.get('GCash')).toBeGreaterThan(0);
      expect(paymentCounts.get('Utang/Lista')).toBeGreaterThan(0);
    });
  });

  describe('4. Drilldown Validation', () => {
    it('should support region → city → barangay drilldown', async () => {
      const locationHierarchy = await mockDataService.getLocationHierarchy();
      
      // Test NCR drilldown
      expect(locationHierarchy['NCR']).toBeDefined();
      expect(locationHierarchy['NCR'].cities['Manila']).toBeDefined();
      expect(locationHierarchy['NCR'].cities['Manila'].barangays).toContain('Barangay 1');
      
      // Validate counts at each level
      const ncrTransactions = mockTransactions.filter(t => t.region === 'NCR');
      const manilaTransactions = ncrTransactions.filter(t => t.city === 'Manila');
      const barangay1Transactions = manilaTransactions.filter(t => t.barangay === 'Barangay 1');
      
      expect(ncrTransactions.length).toBeGreaterThan(0);
      expect(manilaTransactions.length).toBeGreaterThan(0);
      expect(barangay1Transactions.length).toBeGreaterThan(0);
      
      // Ensure child counts don't exceed parent
      expect(manilaTransactions.length).toBeLessThanOrEqual(ncrTransactions.length);
      expect(barangay1Transactions.length).toBeLessThanOrEqual(manilaTransactions.length);
    });

    it('should maintain data consistency through filters and drilldowns', async () => {
      // Apply multiple filters
      const filtered = await mockDataService.getTransactions({
        regions: ['NCR', 'CALABARZON'],
        brands: ['Alaska Evaporated Milk', 'Oishi Prawn Crackers'],
        categories: ['Dairy', 'Snacks']
      });
      
      // Validate all filtered transactions meet criteria
      filtered.forEach((txn: any) => {
        const txnRegion = String(txn.region);
        expect(['NCR', 'CALABARZON']).toContain(txnRegion);
        
        const hasValidBrand = txn.basket?.some((item: any) => 
          ['Alaska Evaporated Milk', 'Oishi Prawn Crackers'].includes(String(item.brand))
        );
        expect(hasValidBrand).toBe(true);
        
        const hasValidCategory = txn.basket?.some((item: any) => 
          ['Dairy', 'Snacks'].includes(String(item.category))
        );
        expect(hasValidCategory).toBe(true);
      });
    });
  });

  describe('5. Consumer Insights Validation', () => {
    it('should calculate correct consumer demographics', async () => {
      const consumerData = await mockDataService.getConsumerData();
      
      expect(consumerData.total).toBe(5000);
      
      // Validate gender distribution
      const totalGender = consumerData.genderMix.reduce((sum, g) => sum + g.value, 0);
      expect(totalGender).toBe(5000);
      
      // Validate age distribution
      const totalAge = consumerData.ageMix.reduce((sum, a) => sum + a.value, 0);
      expect(totalAge).toBe(5000);
      
      // Validate percentages
      consumerData.genderMix.forEach(g => {
        expect(g.percentage).toBeCloseTo((g.value / 5000) * 100, 1);
      });
    });
  });

  describe('6. Product Mix Validation', () => {
    it('should calculate correct product statistics', async () => {
      const productData = await mockDataService.getProductData();
      
      // Validate category mix
      expect(productData.categoryMix.length).toBeGreaterThan(0);
      
      // Validate top SKUs
      expect(productData.topSkus.length).toBeLessThanOrEqual(10);
      productData.topSkus.forEach(sku => {
        expect(sku.sales).toBeGreaterThan(0);
        expect(sku.revenue).toBeGreaterThan(0);
      });
      
      // Ensure top SKUs are sorted by revenue
      for (let i = 1; i < productData.topSkus.length; i++) {
        expect(productData.topSkus[i-1].revenue).toBeGreaterThanOrEqual(productData.topSkus[i].revenue);
      }
    });
  });

  describe('7. Behavioral Analytics Validation', () => {
    it('should calculate substitution patterns correctly', async () => {
      const substitutionData = await mockDataService.getSubstitutionData();
      
      // Count substitutions manually
      const manualCount = mockTransactions.filter(t => t.substitution_from && t.substitution_to).length;
      expect(substitutionData.totalSubstitutions).toBe(manualCount);
      
      // Validate substitution patterns
      substitutionData.patterns.forEach(pattern => {
        expect(brands.some(b => b.name === pattern.from)).toBe(true);
        pattern.patterns.forEach(p => {
          expect(brands.some(b => b.name === p.to)).toBe(true);
          expect(p.count).toBeGreaterThan(0);
        });
      });
    });

    it('should calculate request type analytics correctly', () => {
      const requestTypes = getRequestTypeAnalytics();
      
      const totalRequests = requestTypes.reduce((sum, rt) => sum + rt.count, 0);
      expect(totalRequests).toBe(5000);
      
      requestTypes.forEach(rt => {
        expect(['branded', 'unbranded', 'unsure']).toContain(rt.type);
        expect(rt.percentage).toBeCloseTo((rt.count / 5000) * 100, 1);
      });
    });

    it('should calculate storekeeper influence correctly', () => {
      const influence = getStorekeeperInfluence();
      
      // Manual validation
      const manualSuggestions = mockTransactions.filter(t => t.storeowner_suggested).length;
      const manualAccepted = mockTransactions.filter(t => t.storeowner_suggested && t.accepted_suggestion).length;
      
      expect(influence.totalSuggestions).toBe(manualSuggestions);
      expect(influence.acceptedSuggestions).toBe(manualAccepted);
      
      if (influence.totalSuggestions > 0) {
        expect(influence.acceptanceRate).toBeCloseTo(
          (influence.acceptedSuggestions / influence.totalSuggestions) * 100, 
          1
        );
      }
    });
  });

  describe('8. Data Export Validation', () => {
    it('should prepare correct data for export', async () => {
      const exportData = await mockDataService.getTransactions({
        regions: ['NCR']
      });
      
      // Simulate export data structure
      const exportRows = exportData.map((txn: any) => ({
        id: String(txn.id),
        date: String(txn.date),
        time: String(txn.time),
        region: String(txn.region),
        city: String(txn.city),
        barangay: String(txn.barangay),
        total: Number(txn.total) || 0,
        itemCount: txn.basket?.reduce((sum: number, item: any) => sum + (Number(item.units) || 0), 0) || 0,
        brands: [...new Set(txn.basket?.map((item: any) => String(item.brand)) || [])].join(', '),
        payment: String(txn.consumer_profile?.payment || '')
      }));
      
      expect(exportRows.length).toBe(exportData.length);
      exportRows.forEach(row => {
        expect(row.region).toBe('NCR');
        expect(row.total).toBeGreaterThan(0);
        expect(row.itemCount).toBeGreaterThan(0);
      });
    });
  });

  describe('9. Performance Validation', () => {
    it('should handle rapid filter changes', async () => {
      const startTime = Date.now();
      
      // Simulate rapid filter changes
      for (let i = 0; i < 10; i++) {
        await mockDataService.getTransactions({
          regions: [regions[i % regions.length].name],
          brands: [brands[i % brands.length].name]
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 10 filter operations in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('10. Edge Case Validation', () => {
    it('should handle empty filter results gracefully', async () => {
      // Try to filter for non-existent combination
      const emptyResult = await mockDataService.getTransactions({
        regions: ['NCR'],
        brands: ['NonExistentBrand']
      });
      
      expect(emptyResult).toEqual([]);
    });

    it('should handle all filter combinations', async () => {
      // Test various filter combinations
      const combinations = [
        { regions: ['NCR'], categories: ['Dairy'] },
        { brands: ['Alaska Evaporated Milk'], dateRange: { from: new Date('2024-01-01') } },
        { regions: ['BARMM'], categories: ['Tobacco'], brands: ['Winston'] }
      ];
      
      for (const filters of combinations) {
        const result = await mockDataService.getTransactions(filters);
        expect(Array.isArray(result)).toBe(true);
        
        // Validate filtered results meet criteria
        result.forEach((txn: any) => {
          if (filters.regions) {
            expect(filters.regions).toContain(String(txn.region));
          }
          if (filters.categories) {
            const hasCategory = txn.basket?.some((item: any) => filters.categories!.includes(String(item.category)));
            expect(hasCategory).toBe(true);
          }
          if (filters.brands) {
            const hasBrand = txn.basket?.some((item: any) => filters.brands!.includes(String(item.brand)));
            expect(hasBrand).toBe(true);
          }
        });
      }
    });
  });
});
