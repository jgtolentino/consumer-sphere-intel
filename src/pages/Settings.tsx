
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Database, Settings2 } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings2 className="h-6 w-6 text-[#36CFC9]" />
        <h1 className="text-2xl font-bold text-[#0A2540] dark:text-[#F5F6FA]">Settings</h1>
      </div>

      {/* Data Source Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Data Source Configuration</span>
            <Badge variant="default">PRODUCTION</Badge>
          </CardTitle>
          <CardDescription>
            Production mode - connected to live Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span>Live Data Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-blue-800 space-y-2">
              <p>• Live Supabase connection</p>
              <p>• Real-time data updates</p>
              <p>• Production analytics</p>
              <p>• Dynamic filtering</p>
              <p>• Enterprise-grade performance</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>
            Current application configuration and build details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data Mode:</span>
                <Badge variant="default">PRODUCTION</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="font-medium">
                  {import.meta.env.MODE === 'development' ? 'Development' : 'Production'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Build Version:</span>
                <span className="font-medium">v3.2.0</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Live Data:</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Debug Mode:</span>
                <Badge variant={import.meta.env.DEV ? 'secondary' : 'outline'}>
                  {import.meta.env.DEV ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hot Reload:</span>
                <Badge variant={import.meta.env.DEV ? 'secondary' : 'outline'}>
                  {import.meta.env.DEV ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Details */}
      <Card>
        <CardHeader>
          <CardTitle>Data Source Details</CardTitle>
          <CardDescription>
            Information about the current data source configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Supabase Database</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Real-time data synchronization</p>
              <p>• PostgreSQL backend</p>
              <p>• Row-level security enabled</p>
              <p>• API rate limiting in effect</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
