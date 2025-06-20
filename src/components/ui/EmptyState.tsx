import React from 'react';
import { AlertCircle, FileX, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  type?: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  error?: Error | string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  message,
  error,
  children
}) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-400" />;
      default:
        return <FileX className="h-8 w-8 text-gray-400" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'loading':
        return 'Loading...';
      case 'error':
        return 'Error occurred';
      default:
        return 'No data available';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return 'Please wait while we load your data';
      case 'error':
        return error ? (typeof error === 'string' ? error : error.message) : 'Something went wrong';
      default:
        return 'There is no data to display at the moment';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {getIcon()}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {title || getDefaultTitle()}
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        {message || getDefaultMessage()}
      </p>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;