
import React from 'react';

export const SankeyChart: React.FC = () => {
  const sankeyData = [
    { from: 'Samsung Galaxy A54', to: 'iPhone 14', flow: 45 },
    { from: 'Samsung Galaxy A54', to: 'Xiaomi Redmi Note', flow: 32 },
    { from: 'Nestle Coffee', to: 'Kopiko Coffee', flow: 28 },
    { from: 'Unilever Shampoo', to: 'P&G Shampoo', flow: 21 },
    { from: 'Nike Shoes', to: 'Adidas Shoes', flow: 15 }
  ];

  return (
    <div className="h-80 flex flex-col justify-center">
      <div className="space-y-4">
        {sankeyData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1 text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                {item.from}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-16 h-2 bg-gradient-to-r from-blue-300 to-green-300 rounded"></div>
              <span className="text-xs text-gray-500 font-medium">{item.flow}%</span>
            </div>
            <div className="flex-1">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                {item.to}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">Product substitution patterns based on customer purchase behavior</p>
      </div>
    </div>
  );
};
