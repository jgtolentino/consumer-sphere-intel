/**
 * Health Monitoring React Hook
 * Real-time health data fetching and alerts
 */

import { useState, useEffect, useCallback } from 'react';

interface HealthStatus {
  overall_status: string;
  subsystems: {
    agents: { status: string; healthy_agents: number; total_agents: number; health_percentage: number };
    schema: { status: string; types_validated: number; drift_detection: boolean };
    kill_switch: { enabled: boolean; reason?: string; auto_recovery: boolean };
  };
  timestamp: string;
  execution_time_ms: number;
}

interface AlertConfig {
  enabled: boolean;
  criticalThreshold: number; // Health percentage below which to alert
  degradedThreshold: number;
  checkInterval: number; // Minutes
}

export function useHealthMonitoring(alertConfig?: AlertConfig) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: 'info' | 'warning' | 'critical'; timestamp: string }>>([]);

  const defaultConfig: AlertConfig = {
    enabled: true,
    criticalThreshold: 50,
    degradedThreshold: 80,
    checkInterval: 1, // 1 minute
    ...alertConfig
  };

  const fetchHealthStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthStatus(data);
      
      // Check for alerts
      if (defaultConfig.enabled) {
        checkForAlerts(data);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      
      // Add critical alert for health check failure
      addAlert({
        message: `Health monitoring system failure: ${errorMessage}`,
        severity: 'critical'
      });
    } finally {
      setLoading(false);
    }
  }, [defaultConfig.enabled]);

  const addAlert = useCallback((alert: { message: string; severity: 'info' | 'warning' | 'critical' }) => {
    const newAlert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...alert
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    
    // Browser notification for critical alerts
    if (alert.severity === 'critical' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Consumer Sphere Intel - Critical Alert', {
            body: alert.message,
            icon: '/favicon.ico',
            tag: 'health-alert'
          });
        }
      });
    }
    
    console.warn(`[Health Alert - ${alert.severity.toUpperCase()}]:`, alert.message);
  }, []);

  const checkForAlerts = useCallback((status: HealthStatus) => {
    const { subsystems } = status;
    
    // Check kill switch status
    if (subsystems.kill_switch.enabled) {
      addAlert({
        message: `Kill switch is active: ${subsystems.kill_switch.reason || 'Unknown reason'}`,
        severity: 'warning'
      });
    }
    
    // Check agent health
    const agentHealthPercentage = subsystems.agents.health_percentage;
    if (agentHealthPercentage < defaultConfig.criticalThreshold) {
      addAlert({
        message: `Critical: Only ${agentHealthPercentage}% of agents are healthy (${subsystems.agents.healthy_agents}/${subsystems.agents.total_agents})`,
        severity: 'critical'
      });
    } else if (agentHealthPercentage < defaultConfig.degradedThreshold) {
      addAlert({
        message: `Warning: Agent health at ${agentHealthPercentage}% (${subsystems.agents.healthy_agents}/${subsystems.agents.total_agents})`,
        severity: 'warning'
      });
    }
    
    // Check schema drift
    if (!subsystems.schema.drift_detection) {
      addAlert({
        message: 'Schema drift detection is disabled - system vulnerable to data inconsistencies',
        severity: 'warning'
      });
    }
    
    // Check overall system status
    if (status.overall_status === 'critical') {
      addAlert({
        message: 'System status is critical - immediate attention required',
        severity: 'critical'
      });
    }
    
  }, [defaultConfig, addAlert]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const triggerKillSwitch = useCallback(async (reason: string) => {
    try {
      const response = await fetch('/api/health/killswitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        addAlert({
          message: `Kill switch activated: ${reason}`,
          severity: 'warning'
        });
        await fetchHealthStatus(); // Refresh status
      } else {
        throw new Error('Failed to activate kill switch');
      }
    } catch (err) {
      addAlert({
        message: `Failed to activate kill switch: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'critical'
      });
    }
  }, [fetchHealthStatus, addAlert]);

  const resetKillSwitch = useCallback(async () => {
    try {
      const response = await fetch('/api/health/killswitch', { method: 'DELETE' });
      
      if (response.ok) {
        addAlert({
          message: 'Kill switch reset - normal operations resumed',
          severity: 'info'
        });
        await fetchHealthStatus(); // Refresh status
      } else {
        throw new Error('Failed to reset kill switch');
      }
    } catch (err) {
      addAlert({
        message: `Failed to reset kill switch: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'critical'
      });
    }
  }, [fetchHealthStatus, addAlert]);

  // Auto-refresh health status
  useEffect(() => {
    fetchHealthStatus();
    
    const interval = setInterval(fetchHealthStatus, defaultConfig.checkInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHealthStatus, defaultConfig.checkInterval]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    healthStatus,
    loading,
    error,
    alerts,
    actions: {
      refresh: fetchHealthStatus,
      clearAlert,
      clearAllAlerts,
      triggerKillSwitch,
      resetKillSwitch
    },
    metrics: healthStatus ? {
      isHealthy: healthStatus.overall_status === 'healthy',
      isCritical: healthStatus.overall_status === 'critical',
      killSwitchActive: healthStatus.subsystems.kill_switch.enabled,
      agentHealthPercentage: healthStatus.subsystems.agents.health_percentage,
      responseTime: healthStatus.execution_time_ms
    } : null
  };
}