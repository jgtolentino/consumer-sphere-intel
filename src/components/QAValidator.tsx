import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DataIntegrityValidator, validateKpiSums } from '../utils/dataIntegrityValidator';
import { useDataService } from '../providers/DataProvider';

interface QAStats {
  totalTransactions: number;
  filteredTransactions: number;
  clientPercentage: number;
  summationValid: boolean;
  lastValidation: Date;
}

interface QAValidatorProps {
  currentFilters?: any;
  filteredData?: any[];
  dashboardData?: {
    kpis: any[];
    charts: any[];
    tables: any[];
  };
  onValidationComplete?: (isValid: boolean, errors: string[]) => void;
}

export const QAValidator: React.FC<QAValidatorProps> = ({
  currentFilters,
  filteredData,
  dashboardData,
  onValidationComplete
}) => {
  const [qaStats, setQaStats] = useState<QAStats | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  
  const validator = new DataIntegrityValidator();
  const dataService = useDataService();

  const runValidation = async () => {
    setIsValidating(true);
    const errors: string[] = [];
    
    try {
      // Load all transactions from data service if not already loaded
      if (!allTransactions.length) {
        const transactions = await dataService.getTransactions();
        setAllTransactions(transactions);
      }
      
      const baseTransactions = allTransactions.length ? allTransactions : await dataService.getTransactions();
      
      // 1. Validate base data integrity
      const baseValidation = validator.validateTransactions(baseTransactions);
      if (!baseValidation.isValid) {
        errors.push(...baseValidation.errors.slice(0, 3));
      }
      
      // 2. Validate filtered data if provided
      let currentData = filteredData || baseTransactions;
      if (currentFilters) {
        currentData = await dataService.getTransactions(currentFilters);
      }
      
      // 3. Validate summation across different groupings
      const regionValidation = validateKpiSums(baseTransactions, currentData, 'region');
      if (!regionValidation.isValid) {
        errors.push(`Regional summation mismatch: ${regionValidation.details.mismatch} transactions`);
      }
      
      // 4. Validate KPI consistency if dashboard data provided
      if (dashboardData) {
        const totalRevenue = currentData.reduce((sum, t) => sum + t.total, 0);
        const avgBasket = totalRevenue / currentData.length;
        
        // Check if KPIs match calculated values
        const kpiErrors = validateKPIs(dashboardData.kpis, {
          transactionCount: currentData.length,
          totalRevenue,
          avgBasket
        });
        errors.push(...kpiErrors);
      }
      
      // 5. Validate payment methods sum to total
      const paymentValidation = validateKpiSums(
        baseTransactions, 
        currentData, 
        (txn) => txn.customers?.payment_method || txn.consumer_profile?.payment || 'unknown'
      );
      if (!paymentValidation.isValid) {
        errors.push('Payment method summation error');
      }
      
      // 6. Calculate client percentage (TBWA brands)
      const clientTxns = currentData.filter(t => {
        if (t.transaction_items) {
          // Real data structure
          return t.transaction_items.some(item => 
            item.products?.brands?.is_tbwa || false
          );
        } else if (t.basket) {
          // Mock data structure
          return t.basket.some(item => 
            baseTransactions.some(mt => 
              mt.basket?.some(bi => bi.brand === item.brand && bi.category === item.category)
            )
          );
        }
        return false;
      });
      
      const stats: QAStats = {
        totalTransactions: baseTransactions.length,
        filteredTransactions: currentData.length,
        clientPercentage: currentData.length > 0 ? (clientTxns.length / currentData.length) * 100 : 0,
        summationValid: regionValidation.isValid && paymentValidation.isValid,
        lastValidation: new Date()
      };
      
      setQaStats(stats);
      setValidationErrors(errors);
      
      if (onValidationComplete) {
        onValidationComplete(errors.length === 0, errors);
      }
      
    } catch (error) {
      console.error('QA Validation error:', error);
      errors.push('Validation process failed');
      setValidationErrors(errors);
    } finally {
      setIsValidating(false);
    }
  };

  const validateKPIs = (kpis: any[], expected: any) => {
    const errors: string[] = [];
    
    kpis.forEach(kpi => {
      switch (kpi.type) {
        case 'transaction_count':
          if (Math.abs(kpi.value - expected.transactionCount) > 0) {
            errors.push(`Transaction count KPI mismatch: ${kpi.value} vs ${expected.transactionCount}`);
          }
          break;
        case 'total_revenue':
          if (Math.abs(kpi.value - expected.totalRevenue) > 1) {
            errors.push(`Revenue KPI mismatch: ${kpi.value} vs ${expected.totalRevenue}`);
          }
          break;
        case 'avg_basket':
          if (Math.abs(kpi.value - expected.avgBasket) > 1) {
            errors.push(`Average basket KPI mismatch: ${kpi.value} vs ${expected.avgBasket}`);
          }
          break;
      }
    });
    
    return errors;
  };

  useEffect(() => {
    runValidation();
  }, [currentFilters, filteredData, dashboardData]);

  if (!qaStats) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Running QA validation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
    }
    if (validationErrors.length === 0) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = () => {
    if (validationErrors.length === 0) return 'green';
    return 'red';
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>QA Validation</span>
          </span>
          <Badge variant={getStatusColor() as any}>
            {validationErrors.length === 0 ? 'PASS' : 'FAIL'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Total:</span>
            <span className="ml-1 font-semibold">{qaStats.totalTransactions.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Filtered:</span>
            <span className="ml-1 font-semibold">{qaStats.filteredTransactions.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Client %:</span>
            <span className="ml-1 font-semibold">{qaStats.clientPercentage.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Sum Valid:</span>
            <span className="ml-1 font-semibold">
              {qaStats.summationValid ? '✅' : '❌'}
            </span>
          </div>
        </div>
        
        {validationErrors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <span className="text-xs font-semibold text-red-800">
                {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1">
              {validationErrors.slice(0, 2).map((error, index) => (
                <div key={index} className="text-xs text-red-700">
                  • {error}
                </div>
              ))}
              {validationErrors.length > 2 && (
                <div className="text-xs text-red-600 italic">
                  +{validationErrors.length - 2} more errors
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-400 pt-1">
          Last check: {qaStats.lastValidation.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Debug component for development
export const QADebugPanel: React.FC<{ data: any[] }> = ({ data }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    if (data && data.length > 0) {
      const regionCounts = new Map<string, number>();
      const brandCounts = new Map<string, number>();
      const categoryCounts = new Map<string, number>();
      
      data.forEach(txn => {
        regionCounts.set(txn.region, (regionCounts.get(txn.region) || 0) + 1);
        
        txn.basket.forEach(item => {
          brandCounts.set(item.brand, (brandCounts.get(item.brand) || 0) + 1);
          categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
        });
      });
      
      setDebugInfo({
        total: data.length,
        regions: Object.fromEntries(regionCounts),
        topBrands: Array.from(brandCounts.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        categories: Object.fromEntries(categoryCounts)
      });
    }
  }, [data]);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <Card className="w-full mt-4 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm">🐛 Debug Info (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};