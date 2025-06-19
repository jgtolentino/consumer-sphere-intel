/**
 * Universal AgentService Contract
 * ALL AI agents must implement this interface - no exceptions
 * Ensures consistency across BI Genie, Stockbot, RetailLearnBot, CESAI, etc.
 */

import { TransactionWithDetails, BrandPerformance, CategoryMix, ConsumerInsight } from '../schema';

export interface AgentTask {
  type: AgentTaskType;
  payload: any;
  context?: AgentContext;
  chainId?: string; // For multi-agent workflows
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    agentId: string;
    agentVersion: string;
    executionTime: number;
    timestamp: string;
    taskId: string;
    chainId?: string;
  };
  nextAgent?: string; // For chaining workflows
}

export interface AgentContext {
  userId?: string;
  userRole: 'admin' | 'analyst' | 'client' | 'guest';
  sessionId: string;
  preferences?: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
}

export type AgentTaskType = 
  | 'data-fetch'
  | 'insight-generation'
  | 'qa-validation'
  | 'visualization'
  | 'chat-response'
  | 'stock-analysis'
  | 'campaign-optimization'
  | 'learning-tutorial'
  | 'schema-validation'
  | 'health-check';

export interface AgentCapability {
  taskTypes: AgentTaskType[];
  inputSchema: any;
  outputSchema: any;
  dependencies: string[];
}

export abstract class AgentService {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract readonly capabilities: AgentCapability;
  
  abstract runTask(task: AgentTask): Promise<AgentResult>;
  
  // Health check - must return success/failure
  async healthCheck(): Promise<boolean> {
    try {
      const testTask: AgentTask = {
        type: 'health-check',
        payload: { test: true },
        context: {
          userRole: 'admin',
          sessionId: 'health-check',
          environment: 'development'
        }
      };
      const result = await this.runTask(testTask);
      return result.success;
    } catch {
      return false;
    }
  }

  // Schema validation helper
  protected validateSchema(data: any, expectedSchema: any): boolean {
    // Basic validation - can be enhanced with Zod or JSON Schema
    if (!data || typeof data !== 'object') return false;
    
    for (const key in expectedSchema) {
      if (!(key in data)) return false;
    }
    return true;
  }

  // Standard error response
  protected createErrorResult(error: string, taskId: string): AgentResult {
    return {
      success: false,
      error,
      metadata: {
        agentId: this.id,
        agentVersion: this.version,
        executionTime: 0,
        timestamp: new Date().toISOString(),
        taskId
      }
    };
  }

  // Standard success response
  protected createSuccessResult(data: any, taskId: string, executionTime: number): AgentResult {
    return {
      success: true,
      data,
      metadata: {
        agentId: this.id,
        agentVersion: this.version,
        executionTime,
        timestamp: new Date().toISOString(),
        taskId
      }
    };
  }
}

// Agent Registry Entry
export interface AgentRegistryEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  capabilities: AgentCapability;
  priority: number; // For agent selection
  servicePath: string; // Import path
}

// Task routing and agent selection
export interface TaskRouter {
  selectAgent(taskType: AgentTaskType, context: AgentContext): Promise<AgentService>;
  chainAgents(tasks: AgentTask[]): Promise<AgentResult[]>;
}

// Workflow logging
export interface WorkflowLog {
  workflowId: string;
  taskId: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  error?: string;
  chainPosition?: number;
}

// Kill switch integration
export interface KillSwitchConfig {
  enabled: boolean;
  reason?: string;
  affectedAgents?: string[];
  fallbackMode: 'mock' | 'degraded' | 'offline';
  triggeredAt?: string;
  triggeredBy?: string;
}