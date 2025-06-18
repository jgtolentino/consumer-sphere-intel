
import React from 'react';
import { Heart, Users, Star, TrendingUp } from 'lucide-react';

const VibeCheck: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vibe Check</h1>
          <p className="text-gray-600 mt-1">Consumer sentiment and market mood analysis</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
          Last updated: {new Date().toLocaleString('en-PH')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Sentiment</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">Positive</div>
          <p className="text-sm text-gray-600">+15% from last week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Mood</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">8.2/10</div>
          <p className="text-sm text-gray-600">Satisfaction score</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Perception</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-1">4.6★</div>
          <p className="text-sm text-gray-600">Average rating</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Direction</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">↗</div>
          <p className="text-sm text-gray-600">Growing positively</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Sentiment Timeline</h3>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Sentiment analysis chart will be rendered here</p>
        </div>
      </div>
    </div>
  );
};

export default VibeCheck;
