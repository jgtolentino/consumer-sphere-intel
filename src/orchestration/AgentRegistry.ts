/**
 * Agent Registry Manager
 * Handles dynamic loading and registration of all AI agents
 * Integrates with kill switch and monitoring
 */

import { workflowOrchestrator } from './WorkflowOrchestrator';
import { AgentRegistryEntry } from '../agents/AgentService';
import { killSwitch } from '../config/killSwitch';

// Import all agent services
import { BiGenieAgent } from '../agents/BiGenieAgent';
import { StockbotAgent } from '../agents/StockbotAgent';
import { StockbotSQLAgent } from '../agents/StockbotSQLAgent';
import { RetailLearnBotAgent } from '../agents/RetailLearnBotAgent';
import { CesaiAgent } from '../agents/CesaiAgent';

export class AgentRegistryManager {
  private registry: Map<string, AgentRegistryEntry> = new Map();
  private loadedAgents: Map<string, any> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.loadRegistryConfig();
    this.initializeAgents();
    this.startHealthMonitoring();
  }

  async initializeAgents(): Promise<void> {
    console.log('🚀 Initializing AI Agent Registry...');
    
    try {
      // Load agent configurations
      const agentConfigs = await this.loadAgentConfigurations();
      
      // Register each agent
      for (const config of agentConfigs) {
        await this.registerAgent(config);
      }
      
      console.log(`✅ Successfully registered ${this.loadedAgents.size} agents`);
      
      // Perform initial health check
      await this.performGlobalHealthCheck();
      
    } catch (error) {
      console.error('❌ Failed to initialize agents:', error);
      killSwitch.trigger(`Agent initialization failed: ${error}`);
    }
  }

  private async loadAgentConfigurations(): Promise<AgentRegistryEntry[]> {
    // In a real implementation, this would load from agent-registry.yaml
    // For now, return hardcoded configurations
    return [
      {
        id: 'bi-genie',
        name: 'BI Genie',
        description: 'Business intelligence queries and insight generation agent',
        version: '2.0.0',
        status: 'active',
        capabilities: {
          taskTypes: ['insight-generation', 'data-fetch', 'visualization'],
          inputSchema: {
            query: 'string',
            filters: 'object',
            visualization_type: 'string'
          },
          outputSchema: {
            insights: 'array',
            data: 'object',
            recommendations: 'array'
          },
          dependencies: ['supabase', 'analytics-engine']
        },
        priority: 90,
        servicePath: 'BiGenieAgent'
      },
      {
        id: 'stockbot-sql',
        name: 'Stockbot SQL',
        description: 'AI-powered stock analysis using Azure OpenAI + direct SQL queries',
        version: '3.0.0',
        status: 'active',
        capabilities: {
          taskTypes: ['stock-analysis', 'insight-generation', 'data-fetch', 'sql-query'],
          inputSchema: {
            analysis_type: 'string',
            question: 'string',
            sql_query: 'string',
            product_filter: 'object',
            time_period: 'object'
          },
          outputSchema: {
            stock_insights: 'array',
            inventory_recommendations: 'array',
            substitution_patterns: 'array',
            sql_results: 'object'
          },
          dependencies: ['azure-openai', 'sql-database', 'canonical-schema']
        },
        priority: 90,
        servicePath: 'StockbotSQLAgent'
      },
      {
        id: 'stockbot',
        name: 'Stockbot (Legacy)',
        description: 'Stock analysis, inventory insights, and supply chain optimization',
        version: '2.0.0',
        status: 'inactive', // Demoted to legacy status
        capabilities: {
          taskTypes: ['stock-analysis', 'insight-generation', 'data-fetch'],
          inputSchema: {
            analysis_type: 'string',
            product_filter: 'object',
            time_period: 'object'
          },
          outputSchema: {
            stock_insights: 'array',
            inventory_recommendations: 'array',
            substitution_patterns: 'array'
          },
          dependencies: ['product-catalog', 'inventory-system']
        },
        priority: 75, // Reduced priority
        servicePath: 'StockbotAgent'
      },
      {
        id: 'retail-learn-bot',
        name: 'RetailLearnBot',
        description: 'Educational content, training, and knowledge management agent',
        version: '2.0.0',
        status: 'active',
        capabilities: {
          taskTypes: ['learning-tutorial', 'chat-response', 'insight-generation'],
          inputSchema: {
            query: 'string',
            learning_context: 'string',
            user_level: 'string'
          },
          outputSchema: {
            tutorial_content: 'object',
            chat_response: 'string',
            learning_recommendations: 'array'
          },
          dependencies: ['knowledge-base', 'nlp-engine']
        },
        priority: 75,
        servicePath: 'RetailLearnBotAgent'
      },
      {
        id: 'cesai',
        name: 'CESAI',
        description: 'Campaign optimization, creative analysis, and strategic insights',
        version: '2.0.0',
        status: 'active',
        capabilities: {
          taskTypes: ['campaign-optimization', 'insight-generation', 'data-fetch'],
          inputSchema: {
            campaign_brief: 'object',
            target_metrics: 'array',
            optimization_goals: 'array'
          },
          outputSchema: {
            campaign_recommendations: 'array',
            creative_insights: 'array',
            performance_predictions: 'object'
          },
          dependencies: ['creative-database', 'campaign-analytics', 'market-intelligence']
        },
        priority: 95,
        servicePath: 'CesaiAgent'
      }
    ];
  }

  private async registerAgent(config: AgentRegistryEntry): Promise<void> {
    try {
      // Check if kill switch affects this agent
      if (killSwitch.isServiceAffected(config.id)) {
        console.log(`⚠️ Skipping ${config.id} - affected by kill switch`);
        return;
      }

      // Dynamically instantiate agent based on service path
      const AgentClass = this.getAgentClass(config.servicePath);
      if (!AgentClass) {
        throw new Error(`Agent class not found: ${config.servicePath}`);
      }

      // Determine data mode (use environment or kill switch state)
      const useRealData = !killSwitch.enabled && process.env.NODE_ENV === 'production';
      
      // Create agent instance
      const agentInstance = new AgentClass(useRealData);
      
      // Validate agent health before registration
      const isHealthy = await agentInstance.healthCheck();
      if (!isHealthy) {
        throw new Error(`Agent ${config.id} failed health check`);
      }

      // Register with orchestrator
      workflowOrchestrator.registerAgent(agentInstance, config);
      
      // Store in local registry
      this.registry.set(config.id, config);
      this.loadedAgents.set(config.id, agentInstance);
      
      console.log(`✅ Registered agent: ${config.name} (${config.id}) v${config.version}`);
      
    } catch (error) {
      console.error(`❌ Failed to register agent ${config.id}:`, error);
      
      // Update agent status to inactive
      config.status = 'inactive';
      this.registry.set(config.id, config);
      
      // Don't trigger kill switch for individual agent failures
      // unless it's a critical agent
      if (config.priority > 90) {
        killSwitch.trigger(`Critical agent ${config.id} failed to register: ${error}`);
      }
    }
  }

  private getAgentClass(servicePath: string): any {
    const agentClasses = {
      'BiGenieAgent': BiGenieAgent,
      'StockbotAgent': StockbotAgent,
      'StockbotSQLAgent': StockbotSQLAgent,
      'RetailLearnBotAgent': RetailLearnBotAgent,
      'CesaiAgent': CesaiAgent
    };
    
    return agentClasses[servicePath as keyof typeof agentClasses];
  }

  private loadRegistryConfig(): void {
    // Load configuration from environment or defaults
    console.log('📋 Loading agent registry configuration...');
  }

  private startHealthMonitoring(): void {
    // Perform health checks every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performGlobalHealthCheck();
    }, 5 * 60 * 1000);
  }

  private async performGlobalHealthCheck(): Promise<void> {
    console.log('🏥 Performing global agent health check...');
    
    const healthResults = new Map<string, boolean>();
    
    for (const [agentId, agentInstance] of this.loadedAgents) {
      try {
        const isHealthy = await agentInstance.healthCheck();
        healthResults.set(agentId, isHealthy);
        
        if (!isHealthy) {
          console.warn(`⚠️ Agent ${agentId} failed health check`);
          
          // Update registry status
          const config = this.registry.get(agentId);
          if (config) {
            config.status = 'maintenance';
            this.registry.set(agentId, config);
          }
        }
      } catch (error) {
        console.error(`❌ Health check error for ${agentId}:`, error);
        healthResults.set(agentId, false);
      }
    }
    
    // Check if too many agents are unhealthy
    const unhealthyAgents = Array.from(healthResults.entries())
      .filter(([_, healthy]) => !healthy)
      .map(([agentId]) => agentId);
    
    if (unhealthyAgents.length >= this.loadedAgents.size * 0.5) {
      killSwitch.trigger(`Multiple agent failures detected: ${unhealthyAgents.join(', ')}`);
    }
    
    // Emit health status event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('agentHealthUpdate', {
        detail: {
          healthResults: Object.fromEntries(healthResults),
          unhealthyCount: unhealthyAgents.length,
          totalAgents: this.loadedAgents.size
        }
      }));
    }
  }

  // Public API methods
  getRegisteredAgents(): AgentRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  getActiveAgents(): AgentRegistryEntry[] {
    return Array.from(this.registry.values())
      .filter(agent => agent.status === 'active');
  }

  getAgentById(agentId: string): AgentRegistryEntry | undefined {
    return this.registry.get(agentId);
  }

  isAgentHealthy(agentId: string): boolean {
    const agentInstance = this.loadedAgents.get(agentId);
    if (!agentInstance) return false;
    
    // Return cached health status or perform check
    return true; // Simplified for now
  }

  async reloadAgent(agentId: string): Promise<boolean> {
    try {
      // Unregister existing agent
      workflowOrchestrator.unregisterAgent(agentId);
      this.loadedAgents.delete(agentId);
      
      // Re-register agent
      const config = this.registry.get(agentId);
      if (config) {
        await this.registerAgent(config);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to reload agent ${agentId}:`, error);
      return false;
    }
  }

  shutdown(): void {
    console.log('🛑 Shutting down agent registry...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Unregister all agents
    for (const agentId of this.loadedAgents.keys()) {
      workflowOrchestrator.unregisterAgent(agentId);
    }
    
    this.loadedAgents.clear();
    this.registry.clear();
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistryManager();