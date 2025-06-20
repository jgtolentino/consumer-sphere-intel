
import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const ErrorDisplay: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="p-4 border border-red-200 bg-red-50 rounded">
    <p className="text-red-700 mb-2">Error: {error}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Retry
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ message?: string }> = ({ message = "No data available" }) => (
  <div className="p-8 text-center text-gray-500">
    <p>{message}</p>
  </div>
);
