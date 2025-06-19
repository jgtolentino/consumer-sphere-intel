/**
 * Health Check API - Kill Switch Status & Control
 * Monitor and control global kill switch state
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { killSwitch } from '../../../config/killSwitch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const startTime = Date.now();
    
    if (req.method === 'GET') {
      // Get kill switch status
      const state = killSwitch.getState();
      
      // Perform health check if not in kill switch mode
      let healthCheckResult = null;
      if (!state.enabled) {
        try {
          healthCheckResult = await killSwitch.performHealthCheck();
        } catch (error) {
          healthCheckResult = false;
        }
      }
      
      const response = {
        timestamp: new Date().toISOString(),
        execution_time_ms: Date.now() - startTime,
        kill_switch: {
          enabled: state.enabled,
          reason: state.reason,
          triggered_at: state.triggeredAt,
          triggered_by: state.triggeredBy,
          affected_services: state.affectedServices,
          fallback_mode: state.fallbackMode,
          auto_recovery: state.autoRecovery
        },
        system_health: {
          last_health_check: healthCheckResult !== null ? new Date().toISOString() : null,
          health_check_passed: healthCheckResult,
          services_operational: !state.enabled && healthCheckResult
        },
        environment_overrides: {
          env_kill_switch: process.env.KILL_SWITCH === 'true',
          env_reason: process.env.KILL_SWITCH_REASON || null
        },
        controls: {
          trigger_endpoint: '/api/health/killswitch (POST)',
          reset_endpoint: '/api/health/killswitch (DELETE)',
          health_check_endpoint: '/api/health/killswitch?action=healthcheck'
        }
      };
      
      // Status code based on kill switch state
      const statusCode = state.enabled ? 503 : 200;
      res.status(statusCode).json(response);
      
    } else if (req.method === 'POST') {
      // Trigger kill switch
      const { reason, affected_services } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: 'Reason is required to trigger kill switch' });
      }
      
      killSwitch.trigger(reason, affected_services);
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        action: 'kill_switch_triggered',
        reason,
        affected_services: affected_services || ['all'],
        message: 'Kill switch activated successfully'
      });
      
    } else if (req.method === 'DELETE') {
      // Reset kill switch
      killSwitch.reset();
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        action: 'kill_switch_reset',
        message: 'Kill switch reset successfully - normal operations resumed'
      });
      
    } else if (req.method === 'GET' && req.query.action === 'healthcheck') {
      // Manual health check
      const healthResult = await killSwitch.performHealthCheck();
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        action: 'manual_health_check',
        health_check_passed: healthResult,
        execution_time_ms: Date.now() - startTime,
        message: healthResult ? 'All systems healthy' : 'Health check failed - issues detected'
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Kill switch API error:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Kill switch API failed',
      kill_switch_forced: true,
      message: 'Kill switch API error - system protection activated'
    });
  }
}