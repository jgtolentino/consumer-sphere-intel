/**
 * Agent Health Monitoring Dashboard
 * Real-time visualization of AI agent system health
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Shield, 
  Database,
  Cpu,
  Activity
} from 'lucide-react';

interface HealthData {
  timestamp: string;
  overall_status: string;
  execution_time_ms: number;
  kill_switch: {
    enabled: boolean;
    reason?: string;
    fallback_mode: string;
  };
  metrics: {
    total_agents: number;
    healthy_agents: number;
    degraded_agents: number;
    unhealthy_agents: number;
    health_percentage: number;
  };
  agents: Record<string, {
    status: string;
    agent_id: string;
    agent_name: string;
    version: string;
    priority: number;
    capabilities: string[];
    dependencies: string[];
    response_time_ms: number;
  }>;
  system_info: {
    environment: string;
    version: string;
  };
}

interface SystemHealthData {
  overall_status: string;
  subsystems: {
    agents: { status: string; healthy_agents: number; total_agents: number; health_percentage: number };
    schema: { status: string; types_validated: number; drift_detection: boolean };
    kill_switch: { enabled: boolean; reason?: string; auto_recovery: boolean };
  };
  health_endpoints: Record<string, string>;
}

export function AgentHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      setError(null);
      
      // Fetch both agent health and system overview
      const [agentsResponse, systemResponse] = await Promise.all([
        fetch('/api/health/agents'),
        fetch('/api/health')
      ]);
      
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setHealthData(agentsData);
      }
      
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemHealth(systemData);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const triggerKillSwitch = async (reason: string) => {
    try {
      await fetch('/api/health/killswitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      await fetchHealthData();
    } catch (err) {
      setError('Failed to trigger kill switch');
    }
  };

  const resetKillSwitch = async () => {
    try {
      await fetch('/api/health/killswitch', { method: 'DELETE' });
      await fetchHealthData();
    } catch (err) {
      setError('Failed to reset kill switch');
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    const interval = autoRefresh ? setInterval(fetchHealthData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
      case 'critical':
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'kill_switch_active': return <Shield className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'critical':
      case 'error': return 'bg-red-100 text-red-800';
      case 'kill_switch_active': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading health data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Agent Health Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.overall_status)}
                <Badge className={getStatusColor(systemHealth.overall_status)}>
                  {systemHealth.overall_status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.subsystems.agents.healthy_agents}/{systemHealth.subsystems.agents.total_agents}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemHealth.subsystems.agents.health_percentage}% healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <Badge className={getStatusColor(systemHealth.subsystems.schema.status)}>
                  {systemHealth.subsystems.schema.drift_detection ? 'Protected' : 'Unprotected'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Kill Switch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <Badge className={systemHealth.subsystems.kill_switch.enabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {systemHealth.subsystems.kill_switch.enabled ? 'ACTIVE' : 'STANDBY'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kill Switch Control */}
      {healthData?.kill_switch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Kill Switch Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthData.kill_switch.enabled ? (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Kill switch is <strong>ACTIVE</strong>. 
                    Reason: {healthData.kill_switch.reason}. 
                    All agents are using fallback mode: {healthData.kill_switch.fallback_mode}.
                  </AlertDescription>
                </Alert>
                <Button onClick={resetKillSwitch} variant="outline">
                  Reset Kill Switch
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Kill switch is on standby. Activate for emergency fallback to mock data.
                </p>
                <Button 
                  onClick={() => triggerKillSwitch('Manual activation from dashboard')}
                  variant="destructive"
                  size="sm"
                >
                  Activate Kill Switch
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Details */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>Agent Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(healthData.agents).map(([agentId, agent]) => (
                <div key={agentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{agent.agent_name}</h4>
                    {getStatusIcon(agent.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{agent.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span>{agent.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response:</span>
                      <span>{agent.response_time_ms}ms</span>
                    </div>
                    
                    <div className="pt-2">
                      <Badge className={getStatusColor(agent.status)} size="sm">
                        {agent.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        Capabilities: {agent.capabilities.slice(0, 2).join(', ')}
                        {agent.capabilities.length > 2 && ` (+${agent.capabilities.length - 2} more)`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <p className="font-medium">{healthData.system_info.environment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <p className="font-medium">{healthData.system_info.version}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Check:</span>
                <p className="font-medium">{new Date(healthData.timestamp).toLocaleTimeString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Response Time:</span>
                <p className="font-medium">{healthData.execution_time_ms}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}