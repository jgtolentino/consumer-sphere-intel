import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Users, ShoppingCart, Building2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import EmptyState from './ui/EmptyState';

interface QACheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pending' | 'pass' | 'warning' | 'fail';
  message: string;
  count?: number;
  details?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface QAStats {
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  criticalIssues: number;
  lastRun: Date;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export const LiveQAValidationPanel: React.FC = () => {
  const [checks, setChecks] = useState<QACheck[]>([]);
  const [stats, setStats] = useState<QAStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComprehensiveQA = async () => {
    setIsRunning(true);
    setError(null);
    
    const qaChecks: QACheck[] = [];

    try {
      // 1. Check for orphaned transaction_items
      console.log('🔍 Checking for orphaned transaction items...');
      const { data: orphanItems, error: orphanError } = await supabase
        .from('transaction_items')
        .select('id')
        .is('transaction_id', null);

      if (orphanError) throw orphanError;

      qaChecks.push({
        id: 'orphan_transaction_items',
        category: 'Data Integrity',
        name: 'Orphaned Transaction Items',
        description: 'Transaction items without valid transaction_id',
        status: orphanItems && orphanItems.length > 0 ? 'fail' : 'pass',
        message: orphanItems && orphanItems.length > 0 
          ? `${orphanItems.length} orphaned transaction items found`
          : 'No orphaned transaction items',
        count: orphanItems?.length || 0,
        severity: 'high'
      });

      // 2. Check for missing product references
      console.log('🔍 Checking for missing product references...');
      const { data: missingProducts, error: prodError } = await supabase
        .from('transaction_items')
        .select('id')
        .is('product_id', null);

      if (prodError) throw prodError;

      qaChecks.push({
        id: 'missing_products',
        category: 'Data Integrity', 
        name: 'Missing Product References',
        description: 'Transaction items without product_id',
        status: missingProducts && missingProducts.length > 0 ? 'warning' : 'pass',
        message: missingProducts && missingProducts.length > 0
          ? `${missingProducts.length} items missing product references`
          : 'All transaction items have product references',
        count: missingProducts?.length || 0,
        severity: 'medium'
      });

      // 3. Check transaction completeness
      console.log('🔍 Checking transaction data completeness...');
      const { data: incompleteTransactions, error: transError } = await supabase
        .from('transactions')
        .select('id')
        .or('total_amount.is.null,customer_id.is.null');

      if (transError) throw transError;

      qaChecks.push({
        id: 'incomplete_transactions',
        category: 'Data Quality',
        name: 'Incomplete Transactions',
        description: 'Transactions missing total_amount or customer_id',
        status: incompleteTransactions && incompleteTransactions.length > 0 ? 'warning' : 'pass',
        message: incompleteTransactions && incompleteTransactions.length > 0
          ? `${incompleteTransactions.length} incomplete transactions`
          : 'All transactions are complete',
        count: incompleteTransactions?.length || 0,
        severity: 'medium'
      });

      // 4. Check brand data consistency
      console.log('🔍 Checking brand data consistency...');
      const { data: brandsWithoutProducts, error: brandError } = await supabase
        .from('brands')
        .select('id, name')
        .not('id', 'in', `(SELECT DISTINCT brand_id FROM products WHERE brand_id IS NOT NULL)`);

      if (brandError) throw brandError;

      qaChecks.push({
        id: 'unused_brands',
        category: 'Data Quality',
        name: 'Unused Brands',
        description: 'Brands not referenced by any products',
        status: brandsWithoutProducts && brandsWithoutProducts.length > 0 ? 'warning' : 'pass',
        message: brandsWithoutProducts && brandsWithoutProducts.length > 0
          ? `${brandsWithoutProducts.length} brands without products`
          : 'All brands are properly referenced',
        count: brandsWithoutProducts?.length || 0,
        details: brandsWithoutProducts?.slice(0, 5).map(b => b.name),
        severity: 'low'
      });

      // 5. Check for negative values
      console.log('🔍 Checking for invalid numeric values...');
      const { data: negativeValues, error: negError } = await supabase
        .from('transaction_items')
        .select('id')
        .or('quantity.lt.0,unit_price.lt.0');

      if (negError) throw negError;

      qaChecks.push({
        id: 'negative_values',
        category: 'Data Integrity',
        name: 'Invalid Numeric Values',
        description: 'Negative quantities or prices',
        status: negativeValues && negativeValues.length > 0 ? 'fail' : 'pass',
        message: negativeValues && negativeValues.length > 0
          ? `${negativeValues.length} items with negative values`
          : 'All numeric values are valid',
        count: negativeValues?.length || 0,
        severity: 'critical'
      });

      // 6. Check database performance
      console.log('🔍 Checking database performance...');
      const startTime = Date.now();
      const { data: perfTest, error: perfError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1000);

      if (perfError) throw perfError;

      const queryTime = Date.now() - startTime;
      qaChecks.push({
        id: 'db_performance',
        category: 'Performance',
        name: 'Database Response Time',
        description: 'Query response time for 1000 records',
        status: queryTime > 2000 ? 'warning' : queryTime > 5000 ? 'fail' : 'pass',
        message: `Query executed in ${queryTime}ms`,
        count: queryTime,
        severity: queryTime > 5000 ? 'high' : queryTime > 2000 ? 'medium' : 'low'
      });

      // 7. Check record counts
      console.log('🔍 Checking record counts...');
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      const { count: itemCount } = await supabase
        .from('transaction_items') 
        .select('*', { count: 'exact', head: true });

      qaChecks.push({
        id: 'record_counts',
        category: 'Data Volume',
        name: 'Record Counts',
        description: 'Validate expected data volumes',
        status: (transactionCount || 0) >= 15000 ? 'pass' : (transactionCount || 0) >= 1000 ? 'warning' : 'fail',
        message: `${(transactionCount || 0).toLocaleString()} transactions, ${(itemCount || 0).toLocaleString()} items`,
        count: transactionCount || 0,
        details: [
          `Transactions: ${(transactionCount || 0).toLocaleString()}`,
          `Transaction Items: ${(itemCount || 0).toLocaleString()}`,
          `Avg Items per Transaction: ${itemCount && transactionCount ? (itemCount / transactionCount).toFixed(1) : 'N/A'}`
        ],
        severity: (transactionCount || 0) < 1000 ? 'critical' : 'low'
      });

      // 8. Check foreign key constraints
      console.log('🔍 Checking foreign key integrity...');
      const { data: fkViolations, error: fkError } = await supabase.rpc('check_fk_integrity');
      
      // If the function doesn't exist, create a basic check
      if (fkError?.code === '42883') {
        // Function doesn't exist, do a manual check
        const { data: invalidRefs, error: refError } = await supabase
          .from('transaction_items')
          .select('id')
          .not('transaction_id', 'in', `(SELECT id FROM transactions)`);
        
        qaChecks.push({
          id: 'fk_integrity',
          category: 'Data Integrity',
          name: 'Foreign Key Integrity',
          description: 'Check for broken foreign key references',
          status: invalidRefs && invalidRefs.length > 0 ? 'fail' : 'pass',
          message: invalidRefs && invalidRefs.length > 0
            ? `${invalidRefs.length} broken foreign key references`
            : 'All foreign keys are valid',
          count: invalidRefs?.length || 0,
          severity: 'critical'
        });
      } else if (fkError) {
        throw fkError;
      }

      // Calculate overall statistics
      const passed = qaChecks.filter(c => c.status === 'pass').length;
      const warnings = qaChecks.filter(c => c.status === 'warning').length;
      const failed = qaChecks.filter(c => c.status === 'fail').length;
      const critical = qaChecks.filter(c => c.severity === 'critical' && c.status === 'fail').length;

      const overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 
        critical > 0 ? 'unhealthy' : 
        failed > 0 || warnings > 2 ? 'degraded' : 
        'healthy';

      setChecks(qaChecks);
      setStats({
        totalChecks: qaChecks.length,
        passed,
        warnings,
        failed,
        criticalIssues: critical,
        lastRun: new Date(),
        overallHealth
      });

    } catch (error) {
      console.error('QA validation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runComprehensiveQA();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default' as const,
      warning: 'secondary' as const,
      fail: 'destructive' as const,
      pending: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Integrity':
        return <Database className="h-4 w-4" />;
      case 'Data Quality':
        return <Users className="h-4 w-4" />;
      case 'Performance':
        return <RefreshCw className="h-4 w-4" />;
      case 'Data Volume':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <EmptyState
        type="error"
        title="QA Validation Failed"
        message={error}
      >
        <Button onClick={runComprehensiveQA} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Validation
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {/* QA Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Live Data QA Validation
            </span>
            <Button 
              onClick={runComprehensiveQA} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run QA
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                  <div className="text-sm text-gray-500">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
                  <div className="text-sm text-gray-500">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{stats.criticalIssues}</div>
                  <div className="text-sm text-gray-500">Critical</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getHealthColor(stats.overallHealth)}`}>
                    {stats.overallHealth.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">Health</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                Last run: {stats.lastRun.toLocaleString()}
              </div>
            </div>
          ) : (
            <EmptyState type="loading" title="Running QA validation..." />
          )}
        </CardContent>
      </Card>

      {/* Detailed QA Results */}
      <Card>
        <CardHeader>
          <CardTitle>QA Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          {checks.length > 0 ? (
            <div className="space-y-3">
              {checks.map((check) => (
                <div key={check.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(check.category)}
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{check.name}</span>
                        {check.severity === 'critical' && (
                          <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{check.description}</div>
                      <div className="text-sm">{check.message}</div>
                      {check.details && (
                        <div className="mt-1 text-xs text-gray-500">
                          {check.details.map((detail, idx) => (
                            <div key={idx}>• {detail}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {check.count !== undefined && (
                      <span className="text-sm font-mono">{check.count.toLocaleString()}</span>
                    )}
                    {getStatusBadge(check.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              type="loading" 
              title="No QA results yet"
              message="Click 'Run QA' to start live data validation"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveQAValidationPanel;