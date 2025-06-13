
import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

export const AiRecommendationPanel: React.FC = () => {
  // Mock AI insights - in production this would call an AI service
  const insights = [
    {
      title: "Peak Hour Optimization",
      message: "Consider increasing staff during 2-4 PM for 23% better service efficiency.",
      confidence: 0.85,
      type: "optimization"
    },
    {
      title: "Category Growth Opportunity", 
      message: "Electronics showing 18% growth. Consider expanding inventory in this category.",
      confidence: 0.92,
      type: "growth"
    },
    {
      title: "Regional Performance Alert",
      message: "Quezon City stores outperforming by 12%. Analyze best practices for replication.",
      confidence: 0.78,
      type: "alert"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'growth': return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const colorClass = confidence >= 0.8 ? 'bg-green-100 text-green-800' : 
                      confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800';
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
        {percentage}% confidence
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
        AI Recommendations
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  {getConfidenceBadge(insight.confidence)}
                </div>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>AI Insights:</strong> Generated based on current filter selection and historical patterns. 
          Recommendations update automatically as you refine your analysis.
        </p>
      </div>
    </div>
  );
};
