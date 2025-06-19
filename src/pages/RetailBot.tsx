
import React from 'react';
import { Bot, MessageCircle, Zap } from 'lucide-react';
import { ChatInterface } from '../components/ChatInterface';
import { Card } from '../components/ui/card';

const RetailBot: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-scout-navy dark:text-scout-teal">RetailBot</h1>
          <p className="text-scout-dark dark:text-gray-300 mt-1">AI-powered retail analytics assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col scout-card border-scout-teal/10">
            <div className="flex items-center space-x-3 p-4 border-b border-scout-teal/10">
              <Bot className="h-6 w-6 text-scout-teal" />
              <h3 className="text-lg font-semibold text-scout-navy dark:text-scout-teal">Chat with RetailBot</h3>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface />
            </div>
          </Card>
        </div>

        {/* Sidebar with Quick Actions */}
        <div className="space-y-4">
          <Card className="p-4 scout-card border-scout-teal/10">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="h-5 w-5 text-scout-teal" />
              <h4 className="font-semibold text-scout-navy dark:text-scout-teal">Quick Queries</h4>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-scout-light dark:hover:bg-scout-dark rounded text-sm text-scout-dark dark:text-gray-300 transition-colors">
                "Show Alaska Milk sales trends"
              </button>
              <button className="w-full text-left p-2 hover:bg-scout-light dark:hover:bg-scout-dark rounded text-sm text-scout-dark dark:text-gray-300 transition-colors">
                "Compare Oishi vs competitors"
              </button>
              <button className="w-full text-left p-2 hover:bg-scout-light dark:hover:bg-scout-dark rounded text-sm text-scout-dark dark:text-gray-300 transition-colors">
                "Regional performance analysis"
              </button>
              <button className="w-full text-left p-2 hover:bg-scout-light dark:hover:bg-scout-dark rounded text-sm text-scout-dark dark:text-gray-300 transition-colors">
                "Top performing categories"
              </button>
            </div>
          </Card>

          <Card className="p-4 scout-card border-scout-teal/10">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-scout-teal" />
              <h4 className="font-semibold text-scout-navy dark:text-scout-teal">Capabilities</h4>
            </div>
            <div className="space-y-2 text-sm text-scout-dark dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-scout-teal rounded-full"></div>
                <span>Sales trend analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-scout-teal rounded-full"></div>
                <span>Brand performance metrics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-scout-teal rounded-full"></div>
                <span>Regional comparisons</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-scout-teal rounded-full"></div>
                <span>Consumer insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-scout-teal rounded-full"></div>
                <span>Chart generation</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 scout-card border-scout-teal/10">
            <div className="text-xs text-scout-dark/70 dark:text-gray-400 space-y-1">
              <p><strong>Data Source:</strong> Live Database</p>
              <p><strong>Mode:</strong> Production</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString('en-PH')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetailBot;
