/**
 * Global Kill Switch Implementation
 * Instant, global fallback to mock data on any agent, API, or database failure
 * Zero downtime with full audit trail
 */

export interface KillSwitchState {
  enabled: boolean;
  reason?: string;
  triggeredAt?: string;
  triggeredBy?: string;
  affectedServices?: string[];
  fallbackMode: 'mock' | 'degraded' | 'offline';
  autoRecovery: boolean;
}

class KillSwitchManager {
  private state: KillSwitchState;
  private listeners: Array<(state: KillSwitchState) => void> = [];
  private recoveryInterval?: NodeJS.Timeout;

  constructor() {
    this.state = this.loadState();
    this.setupEventListeners();
    
    if (this.state.enabled && this.state.autoRecovery) {
      this.startRecoveryMonitoring();
    }
  }

  get enabled(): boolean {
    return this.state.enabled;
  }

  get reason(): string {
    return this.state.reason || 'Unknown reason';
  }

  get fallbackMode(): string {
    return this.state.fallbackMode;
  }

  // Trigger kill switch with reason and optional affected services
  trigger(reason: string, affectedServices?: string[]): void {
    const previousState = { ...this.state };
    
    this.state = {
      enabled: true,
      reason,
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'orchestrator',
      affectedServices: affectedServices || ['all'],
      fallbackMode: 'mock',
      autoRecovery: true
    };

    this.persistState();
    this.notifyListeners();
    this.logKillSwitchEvent('ACTIVATED', reason);
    
    // Start recovery monitoring
    this.startRecoveryMonitoring();

    // Emit global event for UI notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('killSwitchActivated', { 
        detail: { ...this.state, previousState }
      }));
      
      // Force page reload for immediate fallback (can be made less aggressive)
      if (this.shouldForceReload()) {
        window.location.reload();
      }
    }
  }

  // Reset kill switch and restore normal operations
  reset(): void {
    const previousState = { ...this.state };
    
    this.state = {
      enabled: false,
      fallbackMode: 'mock',
      autoRecovery: false
    };

    this.persistState();
    this.notifyListeners();
    this.logKillSwitchEvent('RESET', 'Manual reset');
    
    // Stop recovery monitoring
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = undefined;
    }

    // Emit global event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('killSwitchReset', {
        detail: { previousState }
      }));
      
      // Reload to restore normal operations
      window.location.reload();
    }
  }

  // Check if specific service is affected
  isServiceAffected(serviceName: string): boolean {
    if (!this.state.enabled) return false;
    if (!this.state.affectedServices) return true;
    
    return this.state.affectedServices.includes('all') || 
           this.state.affectedServices.includes(serviceName);
  }

  // Add listener for state changes
  addListener(callback: (state: KillSwitchState) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (state: KillSwitchState) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Get current state (read-only)
  getState(): Readonly<KillSwitchState> {
    return { ...this.state };
  }

  // Manual health check for recovery
  async performHealthCheck(): Promise<boolean> {
    try {
      // Basic connectivity checks
      const checks = await Promise.all([
        this.checkDataServices(),
        this.checkSchemaCompliance(),
        this.checkAgentHealth()
      ]);

      const allHealthy = checks.every(check => check);
      
      if (allHealthy && this.state.enabled && this.state.autoRecovery) {
        this.logKillSwitchEvent('AUTO_RECOVERY', 'Health checks passed');
        this.reset();
        return true;
      }
      
      return allHealthy;
    } catch (error) {
      this.logKillSwitchEvent('HEALTH_CHECK_FAILED', `Health check error: ${error}`);
      return false;
    }
  }

  private loadState(): KillSwitchState {
    if (typeof localStorage === 'undefined') {
      return { enabled: false, fallbackMode: 'mock', autoRecovery: false };
    }

    const enabled = localStorage.getItem('killSwitch') === 'true';
    const reason = localStorage.getItem('killSwitchReason');
    const triggeredAt = localStorage.getItem('killSwitchTriggeredAt');
    const fallbackMode = localStorage.getItem('killSwitchFallbackMode') as 'mock' | 'degraded' | 'offline' || 'mock';
    const autoRecovery = localStorage.getItem('killSwitchAutoRecovery') === 'true';

    // Check environment variable override
    const envKillSwitch = process.env.KILL_SWITCH === 'true';
    
    return {
      enabled: enabled || envKillSwitch,
      reason: reason || (envKillSwitch ? 'Environment variable override' : undefined),
      triggeredAt,
      fallbackMode,
      autoRecovery: autoRecovery ?? true
    };
  }

  private persistState(): void {
    if (typeof localStorage === 'undefined') return;

    if (this.state.enabled) {
      localStorage.setItem('killSwitch', 'true');
      localStorage.setItem('killSwitchReason', this.state.reason || '');
      localStorage.setItem('killSwitchTriggeredAt', this.state.triggeredAt || '');
      localStorage.setItem('killSwitchFallbackMode', this.state.fallbackMode);
      localStorage.setItem('killSwitchAutoRecovery', String(this.state.autoRecovery));
    } else {
      localStorage.removeItem('killSwitch');
      localStorage.removeItem('killSwitchReason');
      localStorage.removeItem('killSwitchTriggeredAt');
      localStorage.removeItem('killSwitchFallbackMode');
      localStorage.removeItem('killSwitchAutoRecovery');
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Kill switch listener error:', error);
      }
    });
  }

  private setupEventListeners(): void {
    // Listen for manual kill switch commands
    if (typeof window !== 'undefined') {
      window.addEventListener('triggerKillSwitch', (event: any) => {
        this.trigger(event.detail?.reason || 'Manual trigger', event.detail?.services);
      });

      window.addEventListener('resetKillSwitch', () => {
        this.reset();
      });
    }
  }

  private startRecoveryMonitoring(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
    }

    // Check for recovery every 30 seconds
    this.recoveryInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private shouldForceReload(): boolean {
    // Only force reload in production, be gentler in development
    return process.env.NODE_ENV === 'production';
  }

  private async checkDataServices(): Promise<boolean> {
    try {
      // Check SQL database connectivity if available
      if (typeof require !== 'undefined') {
        try {
          const { SQLConnector } = await import('../services/SQLConnector');
          const sqlConnector = new SQLConnector({
            host: process.env.SQL_HOST || 'localhost',
            port: parseInt(process.env.SQL_PORT || '5432'),
            database: process.env.SQL_DATABASE || 'retail_analytics',
            username: process.env.SQL_USERNAME || 'postgres',
            password: process.env.SQL_PASSWORD || 'password',
            schema: 'public',
            connectionString: process.env.SQL_CONNECTION_STRING || ''
          });
          
          return await sqlConnector.healthCheck();
        } catch (sqlError) {
          console.warn('SQL health check failed:', sqlError);
          return false;
        }
      }
      
      // Fallback to basic connectivity check
      return true;
    } catch {
      return false;
    }
  }

  private async checkSchemaCompliance(): Promise<boolean> {
    try {
      // Check if schema drift detection is passing
      // Validate that canonical schema types are available
      if (typeof require !== 'undefined') {
        try {
          const schema = await import('../schema');
          const requiredTypes = [
            'TransactionWithDetails',
            'BrandPerformance', 
            'CategoryMix',
            'ProductSubstitution'
          ];
          
          for (const typeName of requiredTypes) {
            if (!(typeName in schema)) {
              console.warn(`Missing canonical schema type: ${typeName}`);
              return false;
            }
          }
          
          return true;
        } catch (schemaError) {
          console.warn('Schema compliance check failed:', schemaError);
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private async checkAgentHealth(): Promise<boolean> {
    try {
      // Check if registered agents are responding
      if (typeof require !== 'undefined') {
        try {
          // Import agent registry to check agent health
          const { agentRegistry } = await import('../orchestration/AgentRegistry');
          
          const registeredAgents = agentRegistry.getRegisteredAgents();
          const activeAgents = agentRegistry.getActiveAgents();
          
          // Ensure at least one agent is active
          if (activeAgents.length === 0) {
            console.warn('No active agents found');
            return false;
          }
          
          // Check specific agent health (SQL agents get priority)
          const sqlAgent = registeredAgents.find(agent => agent.id === 'stockbot-sql');
          if (sqlAgent && sqlAgent.status === 'active') {
            const isHealthy = agentRegistry.isAgentHealthy('stockbot-sql');
            if (!isHealthy) {
              console.warn('Stockbot SQL agent health check failed');
              return false;
            }
          }
          
          return true;
        } catch (agentError) {
          console.warn('Agent health check failed:', agentError);
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private logKillSwitchEvent(event: string, details: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      state: this.getState()
    };

    console.log(`🚨 KILL SWITCH ${event}:`, logEntry);

    // In real implementation, send to monitoring service
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('kill_switch_event', logEntry);
    }
  }
}

// Singleton instance
export const killSwitch = new KillSwitchManager();

// React hook for components
export function useKillSwitch() {
  // This will be implemented when React is available
  // For now, return the current state
  return {
    ...killSwitch.getState(),
    trigger: killSwitch.trigger.bind(killSwitch),
    reset: killSwitch.reset.bind(killSwitch),
    isServiceAffected: killSwitch.isServiceAffected.bind(killSwitch)
  };
}

// Utility functions for service integration
export function withKillSwitchFallback<T>(
  primaryFunction: () => Promise<T>,
  fallbackFunction: () => Promise<T>,
  serviceName: string
): Promise<T> {
  return killSwitch.isServiceAffected(serviceName)
    ? fallbackFunction()
    : primaryFunction().catch(async (error) => {
        killSwitch.trigger(`Service failure: ${serviceName} - ${error.message}`, [serviceName]);
        return fallbackFunction();
      });
}

// Environment-based kill switch trigger (for CI/CD)
export function triggerFromEnvironment(): void {
  if (process.env.KILL_SWITCH === 'true') {
    const reason = process.env.KILL_SWITCH_REASON || 'Environment trigger';
    killSwitch.trigger(reason);
  }
}

// Auto-initialize environment check
if (typeof window !== 'undefined') {
  // Check on load
  triggerFromEnvironment();
}

export default killSwitch;