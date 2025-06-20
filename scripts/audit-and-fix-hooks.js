#!/usr/bin/env node

/**
 * Audit and Fix React Hooks - Remove Mock Fallbacks
 * Ensures all hooks use live data service without mock fallbacks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 AUDITING REACT HOOKS FOR MOCK FALLBACKS\n');

const projectRoot = path.join(__dirname, '..');

// Find all hook files
const hookPatterns = [
  'src/hooks/**/*.ts',
  'src/hooks/**/*.tsx',
  'src/components/**/use*.ts',
  'src/components/**/use*.tsx'
];

const problematicPatterns = [
  {
    name: 'Mock data fallback',
    pattern: /setData\(mock\w+\)|\.fallback\(mock\w+\)|mockData|mockTransactions/gi,
    severity: 'high'
  },
  {
    name: 'Empty array fallback',
    pattern: /useState<.*>\(\[\]\)|setData\(\[\]\)|return \[\]/g,
    severity: 'medium'
  },
  {
    name: 'Hardcoded default values',
    pattern: /useState<.*>\(\{[^}]+\}\)|setData\(\{[^}]+\}\)/g,
    severity: 'medium'
  },
  {
    name: 'Conditional mock injection',
    pattern: /if.*mock.*setData|setData.*mock/gi,
    severity: 'high'
  }
];

const fixes = [
  {
    pattern: /import.*mockData.*from.*['"][^'"]*mockData['"];?/gi,
    replacement: "// Removed mock data import - using live data service",
    description: "Remove mock data imports"
  },
  {
    pattern: /setData\(mockTransactions\)/gi,
    replacement: "// Using live data service - no mock fallback",
    description: "Remove mock transaction fallbacks"
  },
  {
    pattern: /const \[data, setData\] = useState<.*>\(\[\]\)/g,
    replacement: "const [data, setData] = useState<any[] | null>(null)",
    description: "Use null instead of empty array as initial state"
  }
];

function scanFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx)$/)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(projectRoot, filePath);
  
  const issues = [];
  
  problematicPatterns.forEach(({ name, pattern, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: relativePath,
        issue: name,
        severity,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  });

  return issues.length > 0 ? { file: relativePath, content, issues } : null;
}

function fixFile(filePath, content) {
  let fixedContent = content;
  let appliedFixes = [];

  fixes.forEach(({ pattern, replacement, description }) => {
    const newContent = fixedContent.replace(pattern, replacement);
    if (newContent !== fixedContent) {
      fixedContent = newContent;
      appliedFixes.push(description);
    }
  });

  // Additional targeted fixes
  
  // Fix useState patterns
  fixedContent = fixedContent.replace(
    /const \[(\w+), set\w+\] = useState<[^>]+>\(\[\]\)/g,
    'const [$1, set$1] = useState<any[] | null>(null)'
  );

  // Fix useEffect patterns that set mock data
  fixedContent = fixedContent.replace(
    /useEffect\(\(\) => \{\s*setData\(mock\w+\);?\s*\}, \[\]\);?/gi,
    '// Removed mock data useEffect - data loaded via service'
  );

  // Add proper loading states
  if (fixedContent.includes('useState') && !fixedContent.includes('loading')) {
    fixedContent = fixedContent.replace(
      /const \[data, setData\] = useState/,
      `const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n  \n  const`
    );
    appliedFixes.push('Added loading/error states');
  }

  // Ensure data service usage
  if (fixedContent.includes('getData') && !fixedContent.includes('useDataService')) {
    fixedContent = fixedContent.replace(
      /import React/,
      `import React from 'react';\nimport { useDataService } from '../providers/DataProvider';`
    );
    appliedFixes.push('Added useDataService import');
  }

  return { content: fixedContent, fixes: appliedFixes };
}

function scanDirectory(dirPath) {
  const fullPath = path.join(projectRoot, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const results = [];

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(itemPath);
      } else if (stat.isFile() && item.match(/^use.*\.(ts|tsx)$/)) {
        const result = scanFile(itemPath);
        if (result) {
          results.push(result);
        }
      }
    });
  }
  
  walkDir(fullPath);
  return results;
}

// Main execution
const dirsToScan = ['src/hooks', 'src/components'];
let allIssues = [];

dirsToScan.forEach(dir => {
  const issues = scanDirectory(dir);
  allIssues = allIssues.concat(issues);
});

console.log('📊 AUDIT RESULTS');
console.log('='.repeat(50));

if (allIssues.length === 0) {
  console.log('✅ No problematic hooks found!');
  console.log('All hooks appear to use live data services correctly.');
  process.exit(0);
}

console.log(`❌ Found ${allIssues.length} hooks with issues:\n`);

allIssues.forEach(({ file, issues }) => {
  console.log(`📁 ${file}`);
  issues.forEach(({ issue, severity, count, examples }) => {
    const severityIcon = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : 'ℹ️';
    console.log(`   ${severityIcon} ${issue} (${count} occurrences)`);
    examples.forEach(example => {
      console.log(`      "${example.substring(0, 60)}..."`);
    });
  });
  console.log();
});

// Offer to auto-fix
console.log('🔧 AUTO-FIX OPTIONS');
console.log('='.repeat(50));

let totalFixed = 0;

allIssues.forEach(({ file, content }) => {
  const filePath = path.join(projectRoot, file);
  const { content: fixedContent, fixes } = fixFile(filePath, content);
  
  if (fixes.length > 0) {
    console.log(`🔧 Fixing ${file}:`);
    fixes.forEach(fix => console.log(`   ✅ ${fix}`));
    
    // Write fixed content
    fs.writeFileSync(filePath, fixedContent);
    totalFixed++;
  }
});

console.log(`\n✅ Auto-fixed ${totalFixed} files`);

// Generate improved hook template
const improvedHookTemplate = `
// Example of improved hook pattern (no mock fallbacks)
import { useState, useEffect } from 'react';
import { useDataService } from '../providers/DataProvider';

export const useTransactionsLive = (filters?: any) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const dataService = useDataService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const transactions = await dataService.getTransactions(filters);
        setData(transactions); // Always from live service
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null); // No mock fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, dataService]);

  return { data, loading, error, refetch: () => fetchData() };
};
`;

const templatePath = path.join(projectRoot, 'src/hooks/useDataServiceTemplate.ts');
fs.writeFileSync(templatePath, improvedHookTemplate);

console.log('\n📋 RECOMMENDATIONS');
console.log('='.repeat(50));
console.log('1. All hooks should use useDataService() exclusively');
console.log('2. Replace useState([]) with useState(null) for initial state');
console.log('3. Add proper loading/error states to all data hooks');
console.log('4. Remove any conditional mock data injection');
console.log('5. Use the template in src/hooks/useDataServiceTemplate.ts');

console.log('\n✨ Hook audit and fix complete!');

// Exit with error code if critical issues remain
const criticalIssues = allIssues.reduce((count, { issues }) => 
  count + issues.filter(issue => issue.severity === 'high').length, 0
);

if (criticalIssues > 0) {
  console.log(`\n🚫 ${criticalIssues} critical issues still need manual review`);
  process.exit(1);
} else {
  console.log('\n✅ All critical issues resolved');
  process.exit(0);
}