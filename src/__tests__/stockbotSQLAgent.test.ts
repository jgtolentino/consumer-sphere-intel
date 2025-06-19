/**
 * Test suite for StockbotSQLAgent
 * Tests Azure OpenAI + SQL integration with mock data
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StockbotSQLAgent } from '../agents/StockbotSQLAgent';
import { AgentTask } from '../agents/AgentService';

// Mock Azure OpenAI and SQL responses
vi.mock('../services/SQLConnector', () => ({
  SQLConnector: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    executeQuery: vi.fn().mockImplementation((query: string) => {
      // Mock different query types
      if (query.includes('SELECT 1')) {
        return Promise.resolve({
          rows: [{ test_connection: 1 }],
          rowCount: 1,
          executionTimeMs: 50,
          query
        });
      }
      
      if (query.includes('brands') && query.includes('sum')) {
        return Promise.resolve({
          rows: [
            { brand_name: 'Coca-Cola', total_sales: 125000.50, transaction_count: 890 },
            { brand_name: 'Nestle', total_sales: 98000.25, transaction_count: 720 }
          ],
          rowCount: 2,
          executionTimeMs: 120,
          query
        });
      }
      
      if (query.includes('substitutions')) {
        return Promise.resolve({
          rows: [
            { from_product: 'Generic Cola', to_product: 'Coca-Cola', substitution_count: 45 }
          ],
          rowCount: 1,
          executionTimeMs: 85,
          query
        });
      }
      
      return Promise.resolve({
        rows: [],
        rowCount: 0,
        executionTimeMs: 30,
        query
      });
    }),
    validateQuery: vi.fn().mockReturnValue(true),
    getSchemaDefinition: vi.fn().mockReturnValue('-- Mock schema'),
    close: vi.fn().mockResolvedValue(undefined),
    healthCheck: vi.fn().mockResolvedValue(true)
  }))
}));

describe('StockbotSQLAgent', () => {
  let agent: StockbotSQLAgent;

  beforeEach(() => {
    // Mock global fetch for Azure OpenAI
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'OK'
          }
        }]
      })
    });

    // Initialize with mock configuration
    agent = new StockbotSQLAgent(
      {
        apiKey: 'mock-key',
        endpoint: 'https://mock.openai.azure.com',
        deploymentName: 'gpt-4o',
        apiVersion: '2024-02-01'
      },
      {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        username: 'test_user',
        password: 'test_pass',
        schema: 'public',
        connectionString: ''
      },
      true // Use mock data
    );
  });

  afterEach(async () => {
    await agent.shutdown();
  });

  describe('Agent Contract Compliance', () => {
    it('should have required properties', () => {
      expect(agent.id).toBe('stockbot-sql');
      expect(agent.version).toBe('3.0.0');
      expect(agent.capabilities).toBeDefined();
      expect(agent.capabilities.taskTypes).toContain('sql-query');
      expect(agent.capabilities.taskTypes).toContain('stock-analysis');
      expect(agent.capabilities.dependencies).toContain('azure-openai');
      expect(agent.capabilities.dependencies).toContain('sql-database');
    });

    it('should implement AgentService interface', () => {
      expect(typeof agent.runTask).toBe('function');
      expect(agent.runTask).toBeInstanceOf(Function);
    });
  });

  describe('SQL Query Tasks', () => {
    it('should handle direct SQL query execution', async () => {
      const task: AgentTask = {
        type: 'sql-query',
        payload: {
          sql_query: 'SELECT brand_name, SUM(total_sales) FROM brands GROUP BY brand_name',
          question: 'Show brand performance'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.question).toBe('Show brand performance');
      expect(result.data.sql_query).toBe(task.payload.sql_query);
      expect(result.data.results).toBeDefined();
      expect(result.data.metadata.execution_time_ms).toBeGreaterThan(0);
      expect(result.metadata.taskId).toMatch(/^stockbot_sql_/);
    });

    it('should handle natural language SQL generation', async () => {
      // Mock Azure OpenAI response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              tool_calls: [{
                function: {
                  name: 'generate_sql_query',
                  arguments: JSON.stringify({
                    sql_query: 'SELECT brand_name, SUM(total_sales) FROM brands GROUP BY brand_name',
                    explanation: 'Groups brands by name and sums their total sales',
                    confidence_score: 0.95
                  })
                }
              }]
            }
          }]
        })
      });

      const task: AgentTask = {
        type: 'sql-query',
        payload: {
          question: 'What are the top performing brands by sales?'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.question).toBe('What are the top performing brands by sales?');
      expect(result.data.sql_query).toContain('SELECT');
      expect(result.data.results).toBeDefined();
      expect(result.data.insights).toBeDefined();
    });

    it('should reject invalid SQL queries', async () => {
      const task: AgentTask = {
        type: 'sql-query',
        payload: {
          sql_query: 'DROP TABLE brands; --'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      // Mock validation failure directly on agent's sqlConnector
      vi.spyOn(agent['sqlConnector'], 'validateQuery').mockImplementation(() => {
        throw new Error('Query contains prohibited pattern');
      });

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('prohibited pattern');
    });
  });

  describe('Stock Analysis Tasks', () => {
    it('should handle demand forecast analysis', async () => {
      const task: AgentTask = {
        type: 'stock-analysis',
        payload: {
          analysis_type: 'demand_forecast',
          product_filter: { category: 'Beverages' },
          time_period: { days: 30 }
        },
        priority: 'high',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.analysis_type).toBe('demand_forecast');
      expect(result.data.sql_analysis).toBeInstanceOf(Array);
      expect(result.data.insights).toBeInstanceOf(Array);
      expect(result.data.recommendations).toBeInstanceOf(Array);
    });

    it('should handle substitution pattern analysis', async () => {
      const task: AgentTask = {
        type: 'stock-analysis',
        payload: {
          analysis_type: 'substitution_patterns',
          time_period: { from: '2024-01-01', to: '2024-12-31' }
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.analysis_type).toBe('substitution_patterns');
      expect(result.data.sql_analysis).toBeInstanceOf(Array);
      expect(result.data.sql_analysis.length).toBeGreaterThan(0);
    });

    it('should handle inventory optimization analysis', async () => {
      const task: AgentTask = {
        type: 'stock-analysis',
        payload: {
          analysis_type: 'inventory_optimization',
          product_filter: { brand: 'Coca-Cola' }
        },
        priority: 'high',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.analysis_type).toBe('inventory_optimization');
      expect(result.data.sql_analysis).toBeInstanceOf(Array);
    });
  });

  describe('Data Fetch Tasks', () => {
    it('should handle product velocity data fetch', async () => {
      const task: AgentTask = {
        type: 'data-fetch',
        payload: {
          data_type: 'product_velocity',
          filters: {
            time_period: { days: 7 }
          }
        },
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.data_type).toBe('product_velocity');
      expect(result.data.sql_query).toContain('avg_velocity');
      expect(result.data.metadata.row_count).toBeDefined();
    });

    it('should handle substitution matrix data fetch', async () => {
      const task: AgentTask = {
        type: 'data-fetch',
        payload: {
          data_type: 'substitution_matrix'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.data_type).toBe('substitution_matrix');
      expect(result.data.sql_query).toContain('substitutions');
    });
  });

  describe('Health Check', () => {
    it('should perform comprehensive health check', async () => {
      const task: AgentTask = {
        type: 'health-check',
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('healthy');
      expect(result.data.sql_connection).toBe(true);
      expect(result.data.capabilities).toContain('sql-analysis');
      expect(result.data.capabilities).toContain('ai-insights');
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported task types', async () => {
      const task: AgentTask = {
        type: 'unsupported-task' as any,
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported task type');
    });

    it('should handle missing required parameters', async () => {
      const task: AgentTask = {
        type: 'sql-query',
        payload: {}, // Missing question or sql_query
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('question or sql_query must be provided');
    });

    it('should handle Azure OpenAI API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized'
      });

      const task: AgentTask = {
        type: 'sql-query',
        payload: {
          question: 'Test question'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Azure OpenAI API error');
    });
  });

  describe('Schema Compliance', () => {
    it('should use canonical schema types', () => {
      expect(agent.capabilities.inputSchema.analysis_type).toBe('string');
      expect(agent.capabilities.inputSchema.question).toBe('string');
      expect(agent.capabilities.inputSchema.sql_query).toBe('string');
      expect(agent.capabilities.outputSchema.stock_insights).toBe('array');
      expect(agent.capabilities.outputSchema.sql_results).toBe('object');
    });

    it('should validate against canonical schema dependencies', () => {
      expect(agent.capabilities.dependencies).toContain('canonical-schema');
      expect(agent.capabilities.dependencies).toContain('azure-openai');
      expect(agent.capabilities.dependencies).toContain('sql-database');
    });
  });

  describe('Performance', () => {
    it('should complete tasks within reasonable time', async () => {
      const startTime = Date.now();
      
      const task: AgentTask = {
        type: 'health-check',
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result = await agent.runTask(task);
      const executionTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    });

    it('should generate task IDs correctly', async () => {
      const task: AgentTask = {
        type: 'health-check',
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result1 = await agent.runTask(task);
      const result2 = await agent.runTask(task);
      
      expect(result1.metadata.taskId).toMatch(/^stockbot_sql_\d+_[a-z0-9]{6}$/);
      expect(result2.metadata.taskId).toMatch(/^stockbot_sql_\d+_[a-z0-9]{6}$/);
      expect(result1.metadata.taskId).not.toBe(result2.metadata.taskId);
    });
  });

  describe('Integration with Kill Switch', () => {
    it('should work with kill switch enabled', async () => {
      // Mock kill switch environment
      process.env.KILL_SWITCH = 'true';
      process.env.KILL_SWITCH_REASON = 'Integration test';

      const task: AgentTask = {
        type: 'health-check',
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      // Agent should still function but potentially with different behavior
      const result = await agent.runTask(task);
      
      expect(result).toBeDefined();
      expect(result.metadata.taskId).toBeDefined();
      
      // Cleanup
      delete process.env.KILL_SWITCH;
      delete process.env.KILL_SWITCH_REASON;
    });
  });
});