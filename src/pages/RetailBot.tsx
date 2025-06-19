
import React from 'react';
import { Bot, MessageCircle, Zap, Database } from 'lucide-react';
import { ChatInterface } from '../components/ChatInterface';
import { Card } from '../components/ui/card';

const RetailBot: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RetailBot</h1>
          <p className="text-gray-600 mt-1">AI-powered retail assistant with mock data analytics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
          <Database className="w-4 h-4" />
          <span className="font-medium">Mock Data Mode - QA Testing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
              <Bot className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Chat with RetailBot</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Mock Data</span>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface />
            </div>
          </Card>
        </div>

        {/* Sidebar with Quick Actions */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Quick Queries</h4>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700">
                "Show Alaska Milk sales trends"
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700">
                "Compare Oishi vs competitors"
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700">
                "Regional performance analysis"
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700">
                "Top performing categories"
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">Capabilities</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sales trend analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Brand performance metrics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Regional comparisons</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Consumer insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Chart generation</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Data Source:</strong> Mock Dataset</p>
              <p><strong>Mode:</strong> QA Testing</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString('en-PH')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetailBot;
