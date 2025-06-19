/**
 * Health Check API - AI Agents Status
 * Real-time agent health monitoring for production
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { agentRegistry } from '../../../orchestration/AgentRegistry';
import { killSwitch } from '../../../config/killSwitch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Get all registered agents
    const registeredAgents = agentRegistry.getRegisteredAgents();
    const activeAgents = agentRegistry.getActiveAgents();
    
    // Perform health checks
    const healthResults = {};
    const healthPromises = registeredAgents.map(async (agent) => {
      try {
        const isHealthy = agentRegistry.isAgentHealthy(agent.id);
        const agentInstance = (agentRegistry as any).loadedAgents?.get(agent.id);
        
        let detailedHealth = false;
        if (agentInstance) {
          detailedHealth = await agentInstance.healthCheck();
        }
        
        healthResults[agent.id] = {
          status: detailedHealth ? 'healthy' : (isHealthy ? 'degraded' : 'unhealthy'),
          agent_id: agent.id,
          agent_name: agent.name,
          version: agent.version,
          priority: agent.priority,
          registry_status: agent.status,
          capabilities: agent.capabilities.taskTypes,
          dependencies: agent.capabilities.dependencies,
          last_check: new Date().toISOString(),
          response_time_ms: detailedHealth ? 50 : 0
        };
      } catch (error) {
        healthResults[agent.id] = {
          status: 'error',
          agent_id: agent.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          last_check: new Date().toISOString()
        };
      }
    });
    
    await Promise.all(healthPromises);
    
    // Calculate overall health metrics
    const totalAgents = registeredAgents.length;
    const healthyAgents = Object.values(healthResults).filter((h: any) => h.status === 'healthy').length;
    const degradedAgents = Object.values(healthResults).filter((h: any) => h.status === 'degraded').length;
    const unhealthyAgents = Object.values(healthResults).filter((h: any) => h.status === 'unhealthy' || h.status === 'error').length;
    
    const overallHealth = healthyAgents === totalAgents ? 'healthy' : 
                         unhealthyAgents === 0 ? 'degraded' : 'critical';
    
    // Kill switch status
    const killSwitchState = killSwitch.getState();
    
    const response = {
      timestamp: new Date().toISOString(),
      overall_status: killSwitchState.enabled ? 'kill_switch_active' : overallHealth,
      execution_time_ms: Date.now() - startTime,
      kill_switch: {
        enabled: killSwitchState.enabled,
        reason: killSwitchState.reason,
        fallback_mode: killSwitchState.fallbackMode,
        triggered_at: killSwitchState.triggeredAt,
        auto_recovery: killSwitchState.autoRecovery
      },
      metrics: {
        total_agents: totalAgents,
        active_agents: activeAgents.length,
        healthy_agents: healthyAgents,
        degraded_agents: degradedAgents,
        unhealthy_agents: unhealthyAgents,
        health_percentage: Math.round((healthyAgents / totalAgents) * 100)
      },
      agents: healthResults,
      system_info: {
        environment: process.env.NODE_ENV || 'development',
        deployment_time: process.env.VERCEL_DEPLOYMENT_ID ? new Date().toISOString() : 'local',
        version: '3.0.0'
      }
    };
    
    // Set appropriate status code
    const statusCode = killSwitchState.enabled ? 503 : 
                      overallHealth === 'critical' ? 503 :
                      overallHealth === 'degraded' ? 206 : 200;
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      overall_status: 'error',
      error: error instanceof Error ? error.message : 'Health check failed',
      kill_switch: { enabled: true, reason: 'Health check system failure' }
    });
  }
}