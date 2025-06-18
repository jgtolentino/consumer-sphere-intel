
import React from 'react';
import { Bot, MessageCircle, Zap } from 'lucide-react';

const RetailBot: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RetailBot</h1>
          <p className="text-gray-600 mt-1">AI-powered retail assistant and insights</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Chat with RetailBot</h3>
          </div>
          <div className="h-96 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chat interface will be implemented here</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Quick Actions</h4>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Analyze sales trends
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Product recommendations
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Market insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailBot;
