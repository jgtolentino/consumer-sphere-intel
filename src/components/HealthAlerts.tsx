/**
 * Health Alerts Component
 * Real-time alert notifications for system health monitoring
 */

import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  Bell,
  BellOff
} from 'lucide-react';

interface HealthAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

interface HealthAlertsProps {
  alerts: HealthAlert[];
  onClearAlert: (alertId: string) => void;
  onClearAll: () => void;
  compact?: boolean;
}

export function HealthAlerts({ alerts, onClearAlert, onClearAll, compact = false }: HealthAlertsProps) {
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = alerts.filter(alert => alert.severity === 'info');

  if (alerts.length === 0) {
    return compact ? null : (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <BellOff className="h-6 w-6 mr-2" />
        <span>No active alerts</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Summary badges */}
        <div className="flex items-center space-x-2">
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              {warningAlerts.length} Warning
            </Badge>
          )}
          {infoAlerts.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {infoAlerts.length} Info
            </Badge>
          )}
        </div>

        {/* Latest critical alert only */}
        {criticalAlerts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{criticalAlerts[0].message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearAlert(criticalAlerts[0].id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert summary and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span className="font-medium">System Alerts ({alerts.length})</span>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <Alert 
            key={alert.id} 
            variant={getAlertVariant(alert.severity) as any}
            className="relative"
          >
            {getAlertIcon(alert.severity)}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getSeverityColor(alert.severity)} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <AlertDescription>
                    {alert.message}
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearAlert(alert.id)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {/* Alert statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
          <div className="text-xs text-muted-foreground">Warning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{infoAlerts.length}</div>
          <div className="text-xs text-muted-foreground">Info</div>
        </div>
      </div>
    </div>
  );
}