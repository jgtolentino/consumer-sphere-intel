
import React from 'react';
import { Sparkles, Brain, Target, TrendingUp } from 'lucide-react';

const AiAssist: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assist</h1>
          <p className="text-gray-600 mt-1">Intelligent business recommendations and insights</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
          </div>
          <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">AI insights coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="h-32 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">Recommendations engine</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Predictions</h3>
          </div>
          <div className="h-32 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">Predictive analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssist;
