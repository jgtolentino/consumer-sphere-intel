/**
 * Agent Contract Compliance Test Suite
 * Verifies that all agents follow the universal AgentService contract
 * Including the new StockbotSQLAgent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AgentService, AgentTask, AgentResult } from '../agents/AgentService';
import { BiGenieAgent } from '../agents/BiGenieAgent';
import { StockbotAgent } from '../agents/StockbotAgent';
import { StockbotSQLAgent } from '../agents/StockbotSQLAgent';
import { RetailLearnBotAgent } from '../agents/RetailLearnBotAgent';
import { CesaiAgent } from '../agents/CesaiAgent';

describe('Agent Contract Compliance', () => {
  const allAgentClasses = [
    { name: 'BiGenieAgent', class: BiGenieAgent },
    { name: 'StockbotAgent', class: StockbotAgent },
    { name: 'StockbotSQLAgent', class: StockbotSQLAgent },
    { name: 'RetailLearnBotAgent', class: RetailLearnBotAgent },
    { name: 'CesaiAgent', class: CesaiAgent }
  ];

  describe('Universal Agent Contract Requirements', () => {
    allAgentClasses.forEach(({ name, class: AgentClass }) => {
      describe(`${name} Contract Compliance`, () => {
        let agent: AgentService;

        beforeEach(() => {
          // Initialize each agent with mock data
          if (name === 'StockbotSQLAgent') {
            agent = new AgentClass(
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
          } else {
            agent = new AgentClass(true); // Use mock data
          }
        });

        it('should extend AgentService abstract class', () => {
          expect(agent).toBeInstanceOf(AgentService);
        });

        it('should have required property: id', () => {
          expect(agent.id).toBeDefined();
          expect(typeof agent.id).toBe('string');
          expect(agent.id.length).toBeGreaterThan(0);
        });

        it('should have required property: version', () => {
          expect(agent.version).toBeDefined();
          expect(typeof agent.version).toBe('string');
          expect(agent.version).toMatch(/^\d+\.\d+\.\d+$/); // Semantic versioning
        });

        it('should have required property: capabilities', () => {
          expect(agent.capabilities).toBeDefined();
          expect(agent.capabilities.taskTypes).toBeDefined();
          expect(Array.isArray(agent.capabilities.taskTypes)).toBe(true);
          expect(agent.capabilities.taskTypes.length).toBeGreaterThan(0);
          
          expect(agent.capabilities.inputSchema).toBeDefined();
          expect(typeof agent.capabilities.inputSchema).toBe('object');
          
          expect(agent.capabilities.outputSchema).toBeDefined();
          expect(typeof agent.capabilities.outputSchema).toBe('object');
          
          expect(agent.capabilities.dependencies).toBeDefined();
          expect(Array.isArray(agent.capabilities.dependencies)).toBe(true);
        });

        it('should implement required method: runTask', () => {
          expect(typeof agent.runTask).toBe('function');
        });

        it('should implement required method: healthCheck', () => {
          expect(typeof agent.healthCheck).toBe('function');
        });

        it('should return valid AgentResult from runTask', async () => {
          // Use a supported task type for this agent
          const taskType = agent.capabilities.taskTypes[0];
          const task: AgentTask = {
            type: taskType,
            payload: {},
            priority: 'medium',
            timestamp: new Date().toISOString()
          };

          const result = await agent.runTask(task);
          
          // Verify AgentResult interface compliance
          expect(result).toBeDefined();
          expect(typeof result.success).toBe('boolean');
          expect(typeof result.taskId).toBe('string');
          expect(result.data).toBeDefined();
          expect(typeof result.metadata).toBe('object');
          expect(typeof result.metadata.executionTime).toBe('number');
          expect(result.metadata.executionTime).toBeGreaterThan(0);
          
          if (!result.success) {
            expect(typeof result.error).toBe('string');
          }
        });

        it('should return valid boolean from healthCheck', async () => {
          const healthResult = await agent.healthCheck();
          expect(typeof healthResult).toBe('boolean');
        });

        it('should handle unsupported task types gracefully', async () => {
          const task: AgentTask = {
            type: 'unsupported-task-type' as any,
            payload: {},
            priority: 'low',
            timestamp: new Date().toISOString()
          };

          const result = await agent.runTask(task);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        });

        it('should have unique agent ID', () => {
          const otherAgents = allAgentClasses
            .filter(other => other.name !== name)
            .map(other => {
              if (other.name === 'StockbotSQLAgent') {
                return new other.class(
                  { apiKey: 'mock', endpoint: 'mock', deploymentName: 'mock' },
                  { host: 'mock', port: 5432, database: 'mock', username: 'mock', password: 'mock', schema: 'public', connectionString: '' },
                  true
                );
              } else {
                return new other.class(true);
              }
            });

          const allIds = [agent.id, ...otherAgents.map(a => a.id)];
          const uniqueIds = [...new Set(allIds)];
          
          expect(uniqueIds.length).toBe(allIds.length);
        });

        it('should support at least one task type', () => {
          expect(agent.capabilities.taskTypes.length).toBeGreaterThanOrEqual(1);
        });

        it('should have at least one dependency', () => {
          expect(agent.capabilities.dependencies.length).toBeGreaterThanOrEqual(1);
        });
      });
    });
  });

  describe('StockbotSQLAgent Enhanced Contract', () => {
    let sqlAgent: StockbotSQLAgent;

    beforeEach(() => {
      sqlAgent = new StockbotSQLAgent(
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

    it('should support sql-query task type', () => {
      expect(sqlAgent.capabilities.taskTypes).toContain('sql-query');
    });

    it('should have enhanced input schema for SQL operations', () => {
      expect(sqlAgent.capabilities.inputSchema.sql_query).toBe('string');
      expect(sqlAgent.capabilities.inputSchema.question).toBe('string');
    });

    it('should have enhanced output schema for SQL results', () => {
      expect(sqlAgent.capabilities.outputSchema.sql_results).toBe('object');
    });

    it('should have Azure OpenAI dependencies', () => {
      expect(sqlAgent.capabilities.dependencies).toContain('azure-openai');
      expect(sqlAgent.capabilities.dependencies).toContain('sql-database');
      expect(sqlAgent.capabilities.dependencies).toContain('canonical-schema');
    });

    it('should have correct version and ID', () => {
      expect(sqlAgent.id).toBe('stockbot-sql');
      expect(sqlAgent.version).toBe('3.0.0');
    });

    it('should handle direct SQL query tasks', async () => {
      const task: AgentTask = {
        type: 'sql-query',
        payload: {
          sql_query: 'SELECT 1 as test',
          question: 'Test query'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await sqlAgent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.sql_query).toBeDefined();
      expect(result.data.results).toBeDefined();
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
                    sql_query: 'SELECT * FROM brands LIMIT 10',
                    explanation: 'Shows top 10 brands',
                    confidence_score: 0.9
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
          question: 'Show me the top brands'
        },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await sqlAgent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.question).toBe('Show me the top brands');
      expect(result.data.sql_query).toContain('SELECT');
      expect(result.data.insights).toBeDefined();
    });

    it('should maintain backward compatibility with legacy stock-analysis tasks', async () => {
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

      const result = await sqlAgent.runTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.analysis_type).toBe('demand_forecast');
      expect(result.data.sql_analysis).toBeDefined();
      expect(result.data.insights).toBeDefined();
    });
  });

  describe('Cross-Agent Compatibility', () => {
    it('should have compatible output formats for chaining', async () => {
      const agents = allAgentClasses.map(({ name, class: AgentClass }) => {
        if (name === 'StockbotSQLAgent') {
          return new AgentClass(
            { apiKey: 'mock', endpoint: 'mock', deploymentName: 'mock' },
            { host: 'mock', port: 5432, database: 'mock', username: 'mock', password: 'mock', schema: 'public', connectionString: '' },
            true
          );
        } else {
          return new AgentClass(true);
        }
      });

      for (const agent of agents) {
        // Test with insight-generation which most agents support
        if (agent.capabilities.taskTypes.includes('insight-generation')) {
          const task: AgentTask = {
            type: 'insight-generation',
            payload: { focus_area: 'test' },
            priority: 'medium',
            timestamp: new Date().toISOString()
          };

          const result = await agent.runTask(task);
          
          // All agents should return insights in a compatible format
          expect(result.data).toBeDefined();
          expect(result.metadata).toBeDefined();
          expect(result.metadata.executionTime).toBeGreaterThan(0);
        }
      }
    });

    it('should all support health checks', async () => {
      const agents = allAgentClasses.map(({ name, class: AgentClass }) => {
        if (name === 'StockbotSQLAgent') {
          return new AgentClass(
            { apiKey: 'mock', endpoint: 'mock', deploymentName: 'mock' },
            { host: 'mock', port: 5432, database: 'mock', username: 'mock', password: 'mock', schema: 'public', connectionString: '' },
            true
          );
        } else {
          return new AgentClass(true);
        }
      });

      const healthChecks = await Promise.all(
        agents.map(agent => agent.healthCheck())
      );

      // All agents should return a boolean health status
      healthChecks.forEach(health => {
        expect(typeof health).toBe('boolean');
      });
    });
  });

  describe('Kill Switch Integration', () => {
    it('should work with kill switch environment variables', async () => {
      // Set kill switch environment
      process.env.KILL_SWITCH = 'true';
      process.env.KILL_SWITCH_REASON = 'Contract compliance test';

      const sqlAgent = new StockbotSQLAgent(
        { apiKey: 'mock', endpoint: 'mock', deploymentName: 'mock' },
        { host: 'mock', port: 5432, database: 'mock', username: 'mock', password: 'mock', schema: 'public', connectionString: '' },
        true
      );

      const task: AgentTask = {
        type: 'health-check',
        payload: {},
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      const result = await sqlAgent.runTask(task);
      
      // Agent should still function but potentially with different behavior
      expect(result).toBeDefined();
      expect(result.taskId).toBeDefined();
      
      // Cleanup
      delete process.env.KILL_SWITCH;
      delete process.env.KILL_SWITCH_REASON;
    });
  });
});