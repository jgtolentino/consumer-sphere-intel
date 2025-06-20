#!/usr/bin/env node

/**
 * Mock Data Import Auditor
 * Scans codebase for hardcoded mock data imports and usage
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🕵️  MOCK DATA IMPORT AUDIT\n');
console.log('Scanning for hardcoded mock data usage...\n');

const projectRoot = path.join(__dirname, '..');
const auditResults = {
  mockImports: [],
  hardcodedData: [],
  directArrays: [],
  missingStateHandling: [],
  deadEndComponents: []
};

// Patterns to search for
const patterns = {
  mockImports: [
    /import.*mock/gi,
    /import.*Mock/gi,
    /import.*MOCK/gi,
    /from ['"][^'"]*mock[^'"]*['"]/gi,
    /require\(['"][^'"]*mock[^'"]*['"]\)/gi
  ],
  hardcodedData: [
    /const.*=\s*\[[\s\S]*{[\s\S]*}[\s\S]*\]/gm, // Large object arrays
    /MOCK_[A-Z_]+/g,
    /TEST_[A-Z_]+/g,
    /mockData/g,
    /testData/g
  ],
  dataServiceBypass: [
    /useQuery\s*\(\s*['"`][^'"`]*mock[^'"`]*['"`]/gi,
    /fetch\s*\(\s*['"`][^'"`]*mock[^'"`]*['"`]/gi,
    /axios\s*\.\s*get\s*\(\s*['"`][^'"`]*mock[^'"`]*['"`]/gi
  ]
};

// Directories to scan
const scanDirs = [
  'src/components',
  'src/pages', 
  'src/routes',
  'src/hooks',
  'src/providers'
];

function scanFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx|js|jsx)$/)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(projectRoot, filePath);

  // Check for mock imports
  patterns.mockImports.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        auditResults.mockImports.push({
          file: relativePath,
          line: getLineNumber(content, match),
          match: match.trim()
        });
      });
    }
  });

  // Check for hardcoded data
  patterns.hardcodedData.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip small arrays and legitimate constants
        if (match.length > 100 || match.includes('MOCK_') || match.includes('TEST_')) {
          auditResults.hardcodedData.push({
            file: relativePath,
            line: getLineNumber(content, match),
            match: match.substring(0, 100) + '...'
          });
        }
      });
    }
  });

  // Check for data service bypass
  patterns.dataServiceBypass.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        auditResults.hardcodedData.push({
          file: relativePath,
          line: getLineNumber(content, match),
          match: match.trim(),
          type: 'data_service_bypass'
        });
      });
    }
  });

  // Check for missing state handling
  if (filePath.includes('/components/') || filePath.includes('/pages/')) {
    checkStateHandling(content, relativePath);
  }
}

function getLineNumber(content, searchString) {
  const lines = content.substring(0, content.indexOf(searchString)).split('\n');
  return lines.length;
}

function checkStateHandling(content, filePath) {
  // Check if component has data loading but missing state handling
  const hasDataFetch = /use(Query|Data|Effect)/.test(content) || 
                      /fetch|axios|supabase/.test(content) ||
                      /useDataService|DataProvider/.test(content);
  
  if (hasDataFetch) {
    const hasLoadingState = /loading|isLoading|pending/.test(content);
    const hasErrorState = /error|isError|catch/.test(content);
    const hasEmptyState = /empty|noData|length === 0/.test(content);
    
    if (!hasLoadingState || !hasErrorState || !hasEmptyState) {
      auditResults.missingStateHandling.push({
        file: filePath,
        missing: {
          loading: !hasLoadingState,
          error: !hasErrorState,
          empty: !hasEmptyState
        }
      });
    }
  }

  // Check for potential dead-end components (components that render nothing on error)
  const hasReturnNull = /return null/.test(content);
  const hasReturnUndefined = /return undefined/.test(content);
  const hasEmptyReturn = /return\s*;/.test(content) && content.includes('if');
  
  if (hasReturnNull || hasReturnUndefined || hasEmptyReturn) {
    auditResults.deadEndComponents.push({
      file: filePath,
      issue: 'Component may render nothing on certain conditions'
    });
  }
}

function scanDirectory(dirPath) {
  const fullPath = path.join(projectRoot, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(itemPath);
      } else if (stat.isFile()) {
        scanFile(itemPath);
      }
    });
  }
  
  walkDir(fullPath);
}

// Run grep-based search for additional patterns
function runGrepAudit() {
  console.log('🔍 Running grep-based audit...\n');
  
  const grepCommands = [
    {
      name: 'Mock imports',
      cmd: 'grep -r "import.*mock" src/components src/pages src/routes 2>/dev/null || true'
    },
    {
      name: 'Test data imports', 
      cmd: 'grep -r "import.*test" src/components src/pages src/routes 2>/dev/null || true'
    },
    {
      name: 'Hardcoded MOCK constants',
      cmd: 'grep -r "MOCK_" src/components src/pages src/routes 2>/dev/null || true'
    },
    {
      name: 'Direct mock file imports',
      cmd: 'grep -r "from.*mock" src/components src/pages src/routes 2>/dev/null || true'
    }
  ];

  grepCommands.forEach(({ name, cmd }) => {
    try {
      const result = execSync(cmd, { encoding: 'utf8', cwd: projectRoot });
      if (result.trim()) {
        console.log(`❌ ${name}:`);
        console.log(result);
      } else {
        console.log(`✅ ${name}: Clean`);
      }
    } catch (error) {
      console.log(`✅ ${name}: Clean (no matches)`);
    }
  });
}

// Main audit execution
console.log('📂 Scanning directories...\n');

scanDirs.forEach(dir => {
  console.log(`   Scanning ${dir}...`);
  scanDirectory(dir);
});

runGrepAudit();

// Generate report
console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT RESULTS');
console.log('='.repeat(60));

console.log(`\n🚨 Mock Imports Found: ${auditResults.mockImports.length}`);
if (auditResults.mockImports.length > 0) {
  auditResults.mockImports.forEach(item => {
    console.log(`   ${item.file}:${item.line} - ${item.match}`);
  });
}

console.log(`\n🚨 Hardcoded Data Found: ${auditResults.hardcodedData.length}`);
if (auditResults.hardcodedData.length > 0) {
  auditResults.hardcodedData.forEach(item => {
    console.log(`   ${item.file}:${item.line} - ${item.match}`);
  });
}

console.log(`\n⚠️  Missing State Handling: ${auditResults.missingStateHandling.length}`);
if (auditResults.missingStateHandling.length > 0) {
  auditResults.missingStateHandling.forEach(item => {
    const missing = Object.entries(item.missing)
      .filter(([_, isMissing]) => isMissing)
      .map(([state, _]) => state);
    console.log(`   ${item.file} - Missing: ${missing.join(', ')}`);
  });
}

console.log(`\n💀 Potential Dead-End Components: ${auditResults.deadEndComponents.length}`);
if (auditResults.deadEndComponents.length > 0) {
  auditResults.deadEndComponents.forEach(item => {
    console.log(`   ${item.file} - ${item.issue}`);
  });
}

// Overall score
const totalIssues = auditResults.mockImports.length + 
                   auditResults.hardcodedData.length + 
                   auditResults.missingStateHandling.length + 
                   auditResults.deadEndComponents.length;

console.log('\n' + '='.repeat(60));
console.log('🎯 AUDIT SUMMARY');
console.log('='.repeat(60));

if (totalIssues === 0) {
  console.log('✅ CLEAN CODEBASE');
  console.log('   No hardcoded mock data found');
  console.log('   All components use DataService injection');
  console.log('   State handling appears complete');
  process.exit(0);
} else {
  console.log(`❌ ${totalIssues} ISSUES FOUND`);
  console.log('\n📋 Required Actions:');
  
  if (auditResults.mockImports.length > 0) {
    console.log('1. Remove all mock data imports from UI components');
    console.log('   Replace with useDataService() or DataProvider context');
  }
  
  if (auditResults.hardcodedData.length > 0) {
    console.log('2. Replace hardcoded data with dynamic service calls');
    console.log('   Move test data to proper mock service layer');
  }
  
  if (auditResults.missingStateHandling.length > 0) {
    console.log('3. Add loading/error/empty state handling to components');
    console.log('   Implement proper UI feedback for all data states');
  }
  
  if (auditResults.deadEndComponents.length > 0) {
    console.log('4. Fix dead-end components that render nothing');
    console.log('   Replace null returns with proper error/empty states');
  }
  
  console.log('\n🚫 BUILD SHOULD FAIL with these issues present');
  process.exit(1);
}

// Save detailed results
const reportPath = path.join(projectRoot, 'mock-data-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
console.log(`\n📄 Detailed report saved: ${reportPath}`);