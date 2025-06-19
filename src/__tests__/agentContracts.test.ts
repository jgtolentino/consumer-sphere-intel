/**
 * Agent Contract Tests
 * Validates that ALL agents comply with AgentService contract
 * Ensures schema consistency across all AI agents
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BiGenieAgent } from '../agents/BiGenieAgent';
import { StockbotAgent } from '../agents/StockbotAgent';
import { RetailLearnBotAgent } from '../agents/RetailLearnBotAgent';
import { CesaiAgent } from '../agents/CesaiAgent';
import { AgentService, AgentTask, AgentResult, AgentTaskType } from '../agents/AgentService';

describe('Agent Contract Compliance', () => {
  const agents: { [key: string]: AgentService } = {
    'bi-genie': new BiGenieAgent(false),
    'stockbot': new StockbotAgent(false),
    'retail-learn-bot': new RetailLearnBotAgent(false),
    'cesai': new CesaiAgent(false)
  };

  beforeEach(() => {
    // Reset any state between tests
  });

  describe('Basic Contract Compliance', () => {
    Object.entries(agents).forEach(([agentName, agent]) => {
      describe(`${agentName} Agent`, () => {
        it('should have required properties', () => {
          expect(agent.id).toBeDefined();
          expect(typeof agent.id).toBe('string');
          expect(agent.id.length).toBeGreaterThan(0);
          
          expect(agent.version).toBeDefined();
          expect(typeof agent.version).toBe('string');
          expect(agent.version).toMatch(/^\d+\.\d+\.\d+$/);
          
          expect(agent.capabilities).toBeDefined();
          expect(agent.capabilities.taskTypes).toBeInstanceOf(Array);
          expect(agent.capabilities.taskTypes.length).toBeGreaterThan(0);
        });

        it('should implement runTask method', () => {
          expect(typeof agent.runTask).toBe('function');
        });

        it('should implement healthCheck method', () => {
          expect(typeof agent.healthCheck).toBe('function');
        });

        it('should have valid capabilities', () => {
          const { capabilities } = agent;
          
          expect(capabilities.taskTypes).toBeInstanceOf(Array);
          expect(capabilities.inputSchema).toBeDefined();
          expect(capabilities.outputSchema).toBeDefined();
          expect(capabilities.dependencies).toBeInstanceOf(Array);
          
          // Validate task types are valid
          capabilities.taskTypes.forEach(taskType => {
            expect(typeof taskType).toBe('string');
            expect(taskType.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Health Check Compliance', () => {
    Object.entries(agents).forEach(([agentName, agent]) => {
      it(`${agentName} should pass health check`, async () => {
        const healthResult = await agent.healthCheck();
        expect(typeof healthResult).toBe('boolean');
        expect(healthResult).toBe(true);
      });

      it(`${agentName} should handle health check task`, async () => {
        const healthTask: AgentTask = {
          type: 'health-check',
          payload: { test: true },
          context: {
            userRole: 'admin',
            sessionId: 'test-session',
            environment: 'development'
          }
        };

        const result = await agent.runTask(healthTask);
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.agentId).toBe(agent.id);
        expect(result.metadata.agentVersion).toBe(agent.version);
      });
    });
  });

  describe('Task Execution Contract', () => {
    Object.entries(agents).forEach(([agentName, agent]) => {
      it(`${agentName} should return valid AgentResult structure`, async () => {
        const testTask: AgentTask = {
          type: agent.capabilities.taskTypes[0] as AgentTaskType,
          payload: {},
          context: {
            userRole: 'analyst',
            sessionId: 'test-session',
            environment: 'development'
          }
        };

        const result = await agent.runTask(testTask);
        
        // Validate result structure
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.metadata).toBeDefined();
        
        // Validate metadata
        expect(result.metadata.agentId).toBe(agent.id);
        expect(result.metadata.agentVersion).toBe(agent.version);
        expect(typeof result.metadata.executionTime).toBe('number');
        expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
        expect(result.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(typeof result.metadata.taskId).toBe('string');
        expect(result.metadata.taskId.length).toBeGreaterThan(0);
        
        // If successful, should have data
        if (result.success) {
          expect(result.data).toBeDefined();
          expect(result.error).toBeUndefined();
        } else {
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        }
      });

      it(`${agentName} should handle unsupported task types gracefully`, async () => {
        const unsupportedTask: AgentTask = {
          type: 'unsupported-task-type' as AgentTaskType,
          payload: {},
          context: {
            userRole: 'analyst',
            sessionId: 'test-session',
            environment: 'development'
          }
        };

        const result = await agent.runTask(unsupportedTask);
        
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Unsupported task type');
      });
    });
  });

  describe('Schema Consistency', () => {
    it('should use consistent data structures across agents', async () => {
      // Test that similar task types return consistent schemas
      const insightTasks = Object.entries(agents)
        .filter(([_, agent]) => agent.capabilities.taskTypes.includes('insight-generation'))
        .map(([name, agent]) => ({ name, agent }));

      if (insightTasks.length > 1) {
        const results = await Promise.all(
          insightTasks.map(({ agent }) => 
            agent.runTask({
              type: 'insight-generation',
              payload: { focus_area: 'test' },
              context: {
                userRole: 'analyst',
                sessionId: 'schema-test',
                environment: 'development'
              }
            })
          )
        );

        // All should succeed and have insights
        results.forEach(result => {
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
        });

        // Check for consistent structure patterns
        const structures = results.map(r => Object.keys(r.data || {}));
        // At least some common keys should exist across agents
        const commonKeys = structures.reduce((common, keys) => 
          common.filter(key => keys.includes(key))
        );
        
        expect(commonKeys.length).toBeGreaterThan(0);
      }
    });

    it('should maintain canonical schema compliance', async () => {
      // Test BI Genie data-fetch returns canonical schema types
      const biGenie = agents['bi-genie'];
      
      const transactionResult = await biGenie.runTask({
        type: 'data-fetch',
        payload: { dataType: 'transactions' },
        context: {
          userRole: 'analyst',
          sessionId: 'schema-test',
          environment: 'development'
        }
      });

      expect(transactionResult.success).toBe(true);
      expect(transactionResult.data).toBeDefined();
      expect(transactionResult.data.data).toBeInstanceOf(Array);
      
      if (transactionResult.data.data.length > 0) {
        const transaction = transactionResult.data.data[0];
        
        // Validate canonical transaction schema
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('total_amount');
        expect(transaction).toHaveProperty('created_at');
        expect(transaction).toHaveProperty('transaction_items');
        expect(transaction).toHaveProperty('customers');
        expect(transaction).toHaveProperty('stores');
      }
    });
  });

  describe('Performance Contract', () => {
    Object.entries(agents).forEach(([agentName, agent]) => {
      it(`${agentName} should complete tasks within reasonable time`, async () => {
        const startTime = Date.now();
        
        const result = await agent.runTask({
          type: agent.capabilities.taskTypes[0] as AgentTaskType,
          payload: {},
          context: {
            userRole: 'analyst',
            sessionId: 'perf-test',
            environment: 'development'
          }
        });
        
        const executionTime = Date.now() - startTime;
        
        // Should complete within 10 seconds for mock data
        expect(executionTime).toBeLessThan(10000);
        
        // Metadata execution time should be reasonable
        expect(result.metadata.executionTime).toBeLessThan(executionTime + 100);
        expect(result.metadata.executionTime).toBeGreaterThan(0);
      });

      it(`${agentName} should handle concurrent tasks`, async () => {
        const concurrentTasks = Array(3).fill(null).map(() =>
          agent.runTask({
            type: agent.capabilities.taskTypes[0] as AgentTaskType,
            payload: {},
            context: {
              userRole: 'analyst',
              sessionId: `concurrent-test-${Math.random()}`,
              environment: 'development'
            }
          })
        );

        const results = await Promise.all(concurrentTasks);
        
        // All tasks should succeed
        results.forEach(result => {
          expect(result.success).toBe(true);
          expect(result.metadata.taskId).toBeDefined();
        });

        // All task IDs should be unique
        const taskIds = results.map(r => r.metadata.taskId);
        const uniqueTaskIds = [...new Set(taskIds)];
        expect(uniqueTaskIds.length).toBe(taskIds.length);
      });
    });
  });

  describe('Error Handling Contract', () => {
    Object.entries(agents).forEach(([agentName, agent]) => {
      it(`${agentName} should handle malformed input gracefully`, async () => {
        const malformedTask: AgentTask = {
          type: agent.capabilities.taskTypes[0] as AgentTaskType,
          payload: null as any,
          context: {
            userRole: 'analyst',
            sessionId: 'error-test',
            environment: 'development'
          }
        };

        const result = await agent.runTask(malformedTask);
        
        // Should not throw, should return error result
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.agentId).toBe(agent.id);
        
        // May succeed or fail, but should be handled gracefully
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        }
      });

      it(`${agentName} should handle empty context gracefully`, async () => {
        const taskWithoutContext: AgentTask = {
          type: agent.capabilities.taskTypes[0] as AgentTaskType,
          payload: {},
          // Missing context
        } as any;

        // Should not throw an exception
        try {
          const result = await agent.runTask(taskWithoutContext);
          expect(result).toBeDefined();
          expect(result.metadata).toBeDefined();
        } catch (error) {
          // If it throws, the error should be meaningful
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Agent Capability Validation', () => {
    it('should have unique agent IDs', () => {
      const agentIds = Object.values(agents).map(agent => agent.id);
      const uniqueIds = [...new Set(agentIds)];
      
      expect(uniqueIds.length).toBe(agentIds.length);
    });

    it('should have consistent version format', () => {
      Object.values(agents).forEach(agent => {
        expect(agent.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });

    it('should have non-overlapping specialized capabilities', () => {
      // Each agent should have at least one unique task type
      const allTaskTypes = Object.values(agents)
        .flatMap(agent => agent.capabilities.taskTypes);
      
      const specializedTasks = [
        'stock-analysis',
        'learning-tutorial', 
        'campaign-optimization'
      ];

      specializedTasks.forEach(taskType => {
        const agentsWithTask = Object.values(agents)
          .filter(agent => agent.capabilities.taskTypes.includes(taskType));
        
        // Each specialized task should be handled by exactly one agent
        expect(agentsWithTask.length).toBe(1);
      });
    });

    it('should have valid dependency declarations', () => {
      Object.values(agents).forEach(agent => {
        expect(agent.capabilities.dependencies).toBeInstanceOf(Array);
        
        agent.capabilities.dependencies.forEach(dependency => {
          expect(typeof dependency).toBe('string');
          expect(dependency.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Integration Contract', () => {
    it('should work with workflow orchestrator pattern', async () => {
      // Test that agents can be called through orchestrator-like interface
      const testAgent = agents['bi-genie'];
      
      const orchestratorTask = {
        type: 'data-fetch' as AgentTaskType,
        payload: { dataType: 'brands' },
        context: {
          userRole: 'analyst' as const,
          sessionId: 'orchestrator-test',
          environment: 'development' as const
        }
      };

      const result = await testAgent.runTask(orchestratorTask);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should support task chaining metadata', async () => {
      const testAgent = agents['bi-genie'];
      
      const chainedTask = {
        type: 'data-fetch' as AgentTaskType,
        payload: { dataType: 'brands' },
        context: {
          userRole: 'analyst' as const,
          sessionId: 'chain-test',
          environment: 'development' as const
        },
        chainId: 'test-chain-123'
      };

      const result = await testAgent.runTask(chainedTask);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      // Chain ID should be preserved in metadata if supported
    });
  });
});

describe('Cross-Agent Integration', () => {
  const agents = {
    biGenie: new BiGenieAgent(false),
    stockbot: new StockbotAgent(false),
    learnBot: new RetailLearnBotAgent(false),
    cesai: new CesaiAgent(false)
  };

  it('should maintain data consistency across agents', async () => {
    // Test that agents return consistent data for similar requests
    const dataFetchTasks = [
      { agent: agents.biGenie, payload: { dataType: 'brands' } },
      { agent: agents.stockbot, payload: { dataType: 'category_performance' } }
    ];

    const results = await Promise.all(
      dataFetchTasks.map(({ agent, payload }) =>
        agent.runTask({
          type: 'data-fetch',
          payload,
          context: {
            userRole: 'analyst',
            sessionId: 'consistency-test',
            environment: 'development'
          }
        })
      )
    );

    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  it('should support workflow handoffs', async () => {
    // Simulate a workflow where one agent's output feeds another
    const insightResult = await agents.biGenie.runTask({
      type: 'insight-generation',
      payload: { query: 'market trends' },
      context: {
        userRole: 'analyst',
        sessionId: 'workflow-test',
        environment: 'development'
      }
    });

    expect(insightResult.success).toBe(true);

    // Use BI Genie result to inform learning content
    const learningResult = await agents.learnBot.runTask({
      type: 'learning-tutorial',
      payload: { 
        query: 'market analysis',
        learning_context: 'insight_analysis',
        user_level: 'intermediate'
      },
      context: {
        userRole: 'analyst',
        sessionId: 'workflow-test',
        environment: 'development'
      }
    });

    expect(learningResult.success).toBe(true);
  });
});

console.log('✅ Agent contract tests ensure all AI agents comply with unified interface standards');