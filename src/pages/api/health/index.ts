/**
 * Health Check API - System Overview
 * Comprehensive system health monitoring endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Get health from all subsystems
    const healthChecks = await Promise.allSettled([
      fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/health/agents`),
      fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/health/schema`),
      fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/health/killswitch`)
    ]);
    
    // Process results
    const results = await Promise.allSettled(
      healthChecks.map(async (check, index) => {
        if (check.status === 'fulfilled' && check.value.ok) {
          return await check.value.json();
        } else {
          const subsystems = ['agents', 'schema', 'killswitch'];
          throw new Error(`${subsystems[index]} health check failed`);
        }
      })
    );
    
    const [agentsHealth, schemaHealth, killswitchHealth] = results.map(result => 
      result.status === 'fulfilled' ? result.value : { overall_status: 'error', error: result.reason }
    );
    
    // Calculate overall system health
    const subsystemStatuses = [
      agentsHealth.overall_status,
      schemaHealth.overall_status,
      killswitchHealth.kill_switch?.enabled ? 'kill_switch_active' : 'healthy'
    ];
    
    const criticalCount = subsystemStatuses.filter(status => 
      status === 'critical' || status === 'error'
    ).length;
    
    const degradedCount = subsystemStatuses.filter(status => 
      status === 'degraded'
    ).length;
    
    const killSwitchActive = subsystemStatuses.includes('kill_switch_active');
    
    const overallStatus = killSwitchActive ? 'kill_switch_active' :
                         criticalCount > 0 ? 'critical' :
                         degradedCount > 0 ? 'degraded' : 'healthy';
    
    const response = {
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      execution_time_ms: Date.now() - startTime,
      system_info: {
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'development',
        deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'local',
        region: process.env.VERCEL_REGION || 'local',
        uptime_check: 'operational'
      },
      subsystems: {
        agents: {
          status: agentsHealth.overall_status,
          healthy_agents: agentsHealth.metrics?.healthy_agents || 0,
          total_agents: agentsHealth.metrics?.total_agents || 0,
          health_percentage: agentsHealth.metrics?.health_percentage || 0
        },
        schema: {
          status: schemaHealth.overall_status,
          types_validated: schemaHealth.canonical_schema?.types_count || 0,
          drift_detection: schemaHealth.canonical_schema?.drift_detection_enabled || false
        },
        kill_switch: {
          enabled: killswitchHealth.kill_switch?.enabled || false,
          reason: killswitchHealth.kill_switch?.reason || null,
          auto_recovery: killswitchHealth.kill_switch?.auto_recovery || false
        }
      },
      health_endpoints: {
        agents: '/api/health/agents',
        schema: '/api/health/schema', 
        killswitch: '/api/health/killswitch',
        system: '/api/health'
      },
      monitoring: {
        alerts_enabled: process.env.NODE_ENV === 'production',
        health_check_interval: '30s',
        last_full_check: new Date().toISOString()
      },
      actions: overallStatus !== 'healthy' ? [
        'Check individual subsystem endpoints for details',
        'Review recent deployment logs',
        'Verify environment configuration',
        'Run manual health validation'
      ] : []
    };
    
    // Set appropriate status code
    const statusCode = overallStatus === 'kill_switch_active' ? 503 :
                      overallStatus === 'critical' ? 500 :
                      overallStatus === 'degraded' ? 206 : 200;
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      overall_status: 'error',
      error: error instanceof Error ? error.message : 'System health check failed',
      emergency_contact: 'Check logs and individual health endpoints',
      kill_switch_recommendation: 'Consider activating kill switch if issues persist'
    });
  }
}