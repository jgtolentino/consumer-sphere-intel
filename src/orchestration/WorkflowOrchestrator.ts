/**
 * Unified WorkflowOrchestrator
 * Central dispatch and management for ALL AI agents
 * Handles routing, chaining, monitoring, and fallback
 */

import { 
  AgentService, 
  AgentTask, 
  AgentResult, 
  AgentContext, 
  AgentTaskType,
  TaskRouter,
  WorkflowLog,
  KillSwitchConfig,
  AgentRegistryEntry
} from '../agents/AgentService';

export class WorkflowOrchestrator implements TaskRouter {
  private agents: Map<string, AgentService> = new Map();
  private registry: AgentRegistryEntry[] = [];
  private workflowLogs: WorkflowLog[] = [];
  private killSwitch: KillSwitchConfig = { enabled: false, fallbackMode: 'mock' };

  constructor() {
    this.loadKillSwitchState();
  }

  // Agent Registration
  registerAgent(agent: AgentService, registryEntry: AgentRegistryEntry): void {
    this.agents.set(agent.id, agent);
    this.registry.push(registryEntry);
    console.log(`🤖 Agent registered: ${agent.id} v${agent.version}`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.registry = this.registry.filter(entry => entry.id !== agentId);
    console.log(`🚫 Agent unregistered: ${agentId}`);
  }

  // Primary task execution with automatic fallback
  async executeTask(task: AgentTask): Promise<AgentResult> {
    const taskId = this.generateTaskId();
    const startTime = new Date().toISOString();

    // Check kill switch
    if (this.killSwitch.enabled) {
      return this.handleKillSwitchFallback(task, taskId);
    }

    try {
      // Log task start
      this.logWorkflow({
        workflowId: task.chainId || taskId,
        taskId,
        agentId: 'orchestrator',
        startTime,
        status: 'pending',
        input: task
      });

      // Select appropriate agent
      const agent = await this.selectAgent(task.type, task.context!);
      
      // Health check before execution
      const isHealthy = await agent.healthCheck();
      if (!isHealthy) {
        this.triggerKillSwitch(`Agent ${agent.id} failed health check`);
        return this.handleKillSwitchFallback(task, taskId);
      }

      // Execute task
      const result = await this.executeWithTimeout(agent, task, 30000); // 30s timeout
      
      // Log completion
      this.logWorkflow({
        workflowId: task.chainId || taskId,
        taskId,
        agentId: agent.id,
        startTime,
        endTime: new Date().toISOString(),
        status: result.success ? 'completed' : 'failed',
        input: task,
        output: result.data,
        error: result.error
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Task execution failed: ${errorMessage}`);
      
      // Auto-trigger kill switch on critical failures
      this.triggerKillSwitch(`Task execution failure: ${errorMessage}`);
      return this.handleKillSwitchFallback(task, taskId);
    }
  }

  // Agent selection logic
  async selectAgent(taskType: AgentTaskType, context: AgentContext): Promise<AgentService> {
    // Filter agents by capability and status
    const capableAgents = this.registry.filter(entry => 
      entry.status === 'active' && 
      entry.capabilities.taskTypes.includes(taskType)
    );

    if (capableAgents.length === 0) {
      throw new Error(`No agents available for task type: ${taskType}`);
    }

    // Sort by priority (higher number = higher priority)
    capableAgents.sort((a, b) => b.priority - a.priority);

    // Return the highest priority agent
    const selectedEntry = capableAgents[0];
    const agent = this.agents.get(selectedEntry.id);
    
    if (!agent) {
      throw new Error(`Agent ${selectedEntry.id} is registered but not available`);
    }

    return agent;
  }

  // Multi-agent workflow chaining
  async chainAgents(tasks: AgentTask[]): Promise<AgentResult[]> {
    const chainId = this.generateTaskId();
    const results: AgentResult[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = { ...tasks[i], chainId };
      
      // For chained tasks, pass previous result as input to next task
      if (i > 0 && results[i - 1].success) {
        task.payload = { ...task.payload, previousResult: results[i - 1].data };
      }
      
      const result = await this.executeTask(task);
      results.push(result);
      
      // Stop chain if any task fails
      if (!result.success) {
        console.error(`❌ Chain broken at step ${i + 1}: ${result.error}`);
        break;
      }
    }
    
    return results;
  }

  // Kill switch management
  triggerKillSwitch(reason: string): void {
    this.killSwitch = {
      enabled: true,
      reason,
      fallbackMode: 'mock',
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'orchestrator'
    };
    
    // Persist to localStorage for UI
    localStorage.setItem('killSwitch', 'true');
    localStorage.setItem('killSwitchReason', reason);
    
    console.error(`🚨 KILL SWITCH ACTIVATED: ${reason}`);
    
    // Emit event for UI notification
    window.dispatchEvent(new CustomEvent('killSwitchActivated', { 
      detail: this.killSwitch 
    }));
  }

  resetKillSwitch(): void {
    this.killSwitch = { enabled: false, fallbackMode: 'mock' };
    localStorage.removeItem('killSwitch');
    localStorage.removeItem('killSwitchReason');
    
    console.log('✅ Kill switch reset - normal operations resumed');
    
    window.dispatchEvent(new CustomEvent('killSwitchReset'));
  }

  private loadKillSwitchState(): void {
    const killSwitchEnabled = localStorage.getItem('killSwitch') === 'true';
    const reason = localStorage.getItem('killSwitchReason');
    
    if (killSwitchEnabled) {
      this.killSwitch = {
        enabled: true,
        reason: reason || 'Unknown reason',
        fallbackMode: 'mock',
        triggeredAt: new Date().toISOString(),
        triggeredBy: 'previous_session'
      };
    }
  }

  private async handleKillSwitchFallback(task: AgentTask, taskId: string): Promise<AgentResult> {
    console.warn(`⚠️ Kill switch active - using fallback for task: ${task.type}`);
    
    // Import mock data service dynamically
    const { MockDataServiceV2 } = await import('../services/MockDataService.v2');
    const mockService = new MockDataServiceV2();
    
    try {
      // Handle different task types with mock data
      let mockData;
      switch (task.type) {
        case 'data-fetch':
          mockData = await mockService.getTransactions(task.payload?.filters);
          break;
        case 'insight-generation':
          mockData = await mockService.getBrandData();
          break;
        case 'qa-validation':
          mockData = { status: 'mock_validation_passed', warnings: [] };
          break;
        case 'visualization':
          mockData = await mockService.getCategoryMix();
          break;
        case 'sql-query':
          // Mock SQL query response
          mockData = {
            question: task.payload?.question || 'Mock query',
            sql_query: task.payload?.sql_query || 'SELECT * FROM mock_table LIMIT 10',
            results: [
              { brand_name: 'Mock Brand A', total_sales: 50000, transaction_count: 250 },
              { brand_name: 'Mock Brand B', total_sales: 35000, transaction_count: 180 }
            ],
            insights: {
              summary: 'Mock SQL analysis - kill switch active',
              recommendations: ['Mock recommendation: Review data when kill switch is disabled'],
              key_findings: ['Kill switch fallback data is simulated']
            },
            metadata: {
              confidence: 0.8,
              execution_time: 50,
              row_count: 2
            }
          };
          break;
        case 'stock-analysis':
          // Mock stock analysis response
          mockData = {
            analysis_type: task.payload?.analysis_type || 'general',
            sql_analysis: [
              {
                analysis: 'Mock demand analysis',
                sql_query: 'SELECT category, COUNT(*) FROM products GROUP BY category',
                results: [
                  { category: 'Beverages', transaction_count: 120, total_quantity: 450 },
                  { category: 'Food & Grocery', transaction_count: 95, total_quantity: 380 }
                ],
                execution_time_ms: 80
              }
            ],
            insights: [
              {
                analysis_type: 'Mock analysis',
                summary: 'Kill switch fallback data for stock analysis',
                recommendations: ['Verify results when systems are restored'],
                key_findings: ['Mock data used due to system maintenance']
              }
            ],
            recommendations: [
              {
                based_on: 'Mock analysis',
                recommendations: ['Enable real data once kill switch is disabled'],
                priority: 'high',
                estimated_impact: 'medium'
              }
            ]
          };
          break;
        default:
          mockData = { message: 'Mock response - kill switch active' };
      }

      return {
        success: true,
        data: mockData,
        metadata: {
          agentId: 'kill_switch_fallback',
          agentVersion: '1.0.0',
          executionTime: 100,
          timestamp: new Date().toISOString(),
          taskId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Kill switch fallback failed: ${error}`,
        metadata: {
          agentId: 'kill_switch_fallback',
          agentVersion: '1.0.0',
          executionTime: 0,
          timestamp: new Date().toISOString(),
          taskId
        }
      };
    }
  }

  private async executeWithTimeout(
    agent: AgentService, 
    task: AgentTask, 
    timeoutMs: number
  ): Promise<AgentResult> {
    return Promise.race([
      agent.runTask(task),
      new Promise<AgentResult>((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), timeoutMs)
      )
    ]);
  }

  private logWorkflow(log: WorkflowLog): void {
    this.workflowLogs.push(log);
    
    // Keep only last 1000 logs in memory
    if (this.workflowLogs.length > 1000) {
      this.workflowLogs = this.workflowLogs.slice(-1000);
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters for monitoring
  getWorkflowLogs(): WorkflowLog[] {
    return [...this.workflowLogs];
  }

  getKillSwitchStatus(): KillSwitchConfig {
    return { ...this.killSwitch };
  }

  getRegisteredAgents(): AgentRegistryEntry[] {
    return [...this.registry];
  }

  getActiveAgents(): AgentRegistryEntry[] {
    return this.registry.filter(entry => entry.status === 'active');
  }
}

// Singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();