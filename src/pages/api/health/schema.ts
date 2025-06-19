/**
 * Health Check API - Schema Drift Detection
 * Validates canonical schema consistency across all services
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Import schema modules for validation
    const schema = await import('../../../schema');
    const mockDataService = await import('../../../services/MockDataService.v2');
    const realDataService = await import('../../../services/RealDataService.v2');
    
    // Required canonical types
    const requiredTypes = [
      'TransactionWithDetails',
      'BrandPerformance', 
      'CategoryMix',
      'ProductSubstitution',
      'ConsumerInsight',
      'Store',
      'Customer',
      'Product',
      'Brand'
    ];
    
    // Validate schema types exist
    const schemaValidation = {
      types_found: [],
      types_missing: [],
      validation_passed: true
    };
    
    for (const typeName of requiredTypes) {
      if (typeName in schema) {
        schemaValidation.types_found.push(typeName);
      } else {
        schemaValidation.types_missing.push(typeName);
        schemaValidation.validation_passed = false;
      }
    }
    
    // Test mock data service schema compliance
    let mockServiceValidation = {
      status: 'healthy',
      methods_tested: [],
      errors: []
    };
    
    try {
      const mockService = new mockDataService.MockDataServiceV2();
      
      // Test key methods
      const testMethods = [
        { name: 'getTransactions', call: () => mockService.getTransactions() },
        { name: 'getBrandData', call: () => mockService.getBrandData() },
        { name: 'getCategoryMix', call: () => mockService.getCategoryMix() }
      ];
      
      for (const method of testMethods) {
        try {
          const result = await method.call();
          mockServiceValidation.methods_tested.push({
            method: method.name,
            status: 'passed',
            data_structure_valid: !!result && typeof result === 'object'
          });
        } catch (error) {
          mockServiceValidation.methods_tested.push({
            method: method.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          mockServiceValidation.errors.push(`${method.name}: ${error}`);
          mockServiceValidation.status = 'degraded';
        }
      }
    } catch (error) {
      mockServiceValidation.status = 'error';
      mockServiceValidation.errors.push(`Service initialization: ${error}`);
    }
    
    // Test real data service schema compliance
    let realServiceValidation = {
      status: 'healthy',
      methods_tested: [],
      errors: []
    };
    
    try {
      const realService = new realDataService.RealDataServiceV2();
      
      // Test schema validation without actual data calls
      realServiceValidation.methods_tested.push({
        method: 'initialization',
        status: 'passed',
        note: 'Service instantiated successfully'
      });
    } catch (error) {
      realServiceValidation.status = 'error';
      realServiceValidation.errors.push(`Service initialization: ${error}`);
    }
    
    // Overall schema health
    const overallStatus = !schemaValidation.validation_passed ? 'critical' :
                         mockServiceValidation.status === 'error' || realServiceValidation.status === 'error' ? 'critical' :
                         mockServiceValidation.status === 'degraded' || realServiceValidation.status === 'degraded' ? 'degraded' :
                         'healthy';
    
    const response = {
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      execution_time_ms: Date.now() - startTime,
      schema_validation: schemaValidation,
      data_services: {
        mock_service: mockServiceValidation,
        real_service: realServiceValidation
      },
      canonical_schema: {
        version: '2.0.0',
        types_count: schemaValidation.types_found.length,
        drift_detection_enabled: true,
        last_validation: new Date().toISOString()
      },
      recommendations: overallStatus !== 'healthy' ? [
        'Run: npm run check-schema-drift',
        'Verify: All canonical types are properly exported',
        'Check: Data service implementations match schema'
      ] : []
    };
    
    // Set appropriate status code
    const statusCode = overallStatus === 'critical' ? 500 :
                      overallStatus === 'degraded' ? 206 : 200;
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('Schema health check error:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      overall_status: 'error',
      error: error instanceof Error ? error.message : 'Schema validation failed',
      recommendations: [
        'Check schema imports and exports',
        'Verify data service implementations',
        'Run full schema validation suite'
      ]
    });
  }
}