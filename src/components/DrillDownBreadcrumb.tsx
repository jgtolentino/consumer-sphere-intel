
import React from 'react';
import { ChevronRight, Home, RotateCcw } from 'lucide-react';
import { useDrillDownStore } from '../state/useDrillDownStore';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export const DrillDownBreadcrumb: React.FC = () => {
  const { drillPath, jumpToLevel, reset } = useDrillDownStore();

  if (drillPath.length === 0) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">All Regions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sticky top-32 z-30">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => reset()}
                className="cursor-pointer flex items-center hover:text-blue-600"
              >
                <Home className="h-4 w-4 mr-1" />
                All Regions
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {drillPath.map((level, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {index === drillPath.length - 1 ? (
                    <BreadcrumbPage className="font-semibold text-blue-700">
                      {level.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => jumpToLevel(index)}
                      className="cursor-pointer hover:text-blue-600"
                    >
                      {level.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {drillPath.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
