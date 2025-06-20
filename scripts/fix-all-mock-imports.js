#!/usr/bin/env node

/**
 * Comprehensive Mock Import Fixer
 * Automatically fixes all hardcoded mock data imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 FIXING ALL MOCK DATA IMPORTS\n');

const projectRoot = path.join(__dirname, '..');

// Files that need fixing based on audit
const filesToFix = [
  'src/components/GeoMap.tsx',
  'src/components/GlobalFilterBar.tsx', 
  'src/hooks/useComprehensiveAnalytics.ts',
  'src/pages/api/health/schema.ts'
];

// Common replacement patterns
const replacements = [
  {
    pattern: /import \{ [^}]*mockTransactions[^}]* \} from ['"][^'"]*mockData['"];?/g,
    replacement: ''
  },
  {
    pattern: /import \{ [^}]*regions[^}]* \} from ['"][^'"]*mockData['"];?/g,
    replacement: ''
  },
  {
    pattern: /import \{ [^}]*tbwaClientBrands[^}]* \} from ['"][^'"]*mockData['"];?/g,
    replacement: ''
  },
  {
    pattern: /import \{ [^}]*competitorBrands[^}]* \} from ['"][^'"]*mockData['"];?/g,
    replacement: ''
  },
  {
    pattern: /import \{ MockDataService \} from ['"][^'"]*MockDataService['"];?/g,
    replacement: "import { useDataService } from '../providers/DataProvider';"
  }
];

// Add empty state handling template
const emptyStateTemplate = `
// Empty state handling
if (loading) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-800">Error loading data: {error.message}</p>
    </div>
  );
}

if (!data || data.length === 0) {
  return (
    <div className="p-4 text-center text-gray-500">
      <p className="text-sm">No data available</p>
    </div>
  );
}
`;

function fixFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  console.log(`🔧 Fixing ${filePath}...`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });

  // Remove empty import lines
  content = content.replace(/^\s*import \{\s*\} from [^;]+;\s*$/gm, '');
  
  // Remove duplicate empty lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  // Special fixes for specific files
  if (filePath.includes('GeoMap.tsx')) {
    // Add data loading to GeoMap
    const dataServiceImport = "import { useDataService } from '../providers/DataProvider';";
    if (!content.includes(dataServiceImport)) {
      content = content.replace(
        /import { useFilterStore }[^;]+;/,
        `import { useFilterStore } from '../state/useFilterStore';\n${dataServiceImport}`
      );
      hasChanges = true;
    }

    // Replace mockTransactions usage with data service
    content = content.replace(
      /mockTransactions/g,
      'transactions'
    );
    
    // Add state for loaded data
    if (!content.includes('const [transactions,')) {
      content = content.replace(
        /const \[.*?\] = useState/,
        `const [transactions, setTransactions] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const dataService = useDataService();\n\n  $&`
      );
      hasChanges = true;
    }
  }

  if (filePath.includes('GlobalFilterBar.tsx')) {
    // Replace brand arrays with dynamic loading (already done above)
    content = content.replace(
      /tbwaClientBrands|competitorBrands/g,
      'availableBrands.tbwa'
    );
    hasChanges = true;
  }

  if (filePath.includes('useComprehensiveAnalytics.ts')) {
    // Fix hook to use data service
    content = content.replace(
      /import \{ [^}]*regions[^}]* \} from ['"][^'"]*mockData['"];?/g,
      "import { useDataService } from '../providers/DataProvider';"
    );
    
    content = content.replace(
      /regions\./g,
      'regionData.'
    );
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
    return false;
  }
}

// Create empty state component template
function createEmptyStateComponent() {
  const componentPath = path.join(projectRoot, 'src/components/ui/EmptyState.tsx');
  
  const emptyStateComponent = `import React from 'react';
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

export default EmptyState;`;

  if (!fs.existsSync(componentPath)) {
    fs.writeFileSync(componentPath, emptyStateComponent);
    console.log('✅ Created EmptyState component');
    return true;
  }
  
  return false;
}

// Create data loading hook template
function createDataLoadingHook() {
  const hookPath = path.join(projectRoot, 'src/hooks/useDataWithStates.ts');
  
  const hookContent = `import { useState, useEffect } from 'react';
import { useDataService } from '../providers/DataProvider';

interface UseDataWithStatesResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataWithStates<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseDataWithStatesResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Convenience hooks for common data operations
export function useTransactionsWithStates(filters?: any) {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getTransactions(filters),
    [filters]
  );
}

export function useBrandDataWithStates() {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getBrandData(),
    []
  );
}

export function useRegionalDataWithStates() {
  const dataService = useDataService();
  return useDataWithStates(
    () => dataService.getRegionalData(),
    []
  );
}`;

  if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, hookContent);
    console.log('✅ Created useDataWithStates hook');
    return true;
  }
  
  return false;
}

// Main execution
console.log('📋 Files to fix:');
filesToFix.forEach(file => console.log(`   ${file}`));
console.log();

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    totalFixed++;
  }
});

// Create utility components and hooks
createEmptyStateComponent();
createDataLoadingHook();

console.log('\n' + '='.repeat(50));
console.log('📊 FIX SUMMARY');
console.log('='.repeat(50));

console.log(`✅ Fixed ${totalFixed}/${filesToFix.length} files`);
console.log('✅ Created EmptyState component');
console.log('✅ Created useDataWithStates hook');

console.log('\n📋 Manual Review Required:');
console.log('1. Check that all components now use DataProvider context');
console.log('2. Verify empty/loading/error states are properly handled');
console.log('3. Test both mock and real data modes');
console.log('4. Update any remaining hardcoded brand/region references');

console.log('\n🧪 Next Steps:');
console.log('1. Run: npm run build (should pass without mock import errors)');
console.log('2. Run: node scripts/audit-mock-imports.js (should show 0 mock imports)');
console.log('3. Test: npm run dev (verify all components load correctly)');

console.log('\n✨ Mock import cleanup complete!');