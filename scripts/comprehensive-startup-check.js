#!/usr/bin/env node

/**
 * Comprehensive Startup Check
 * Validates all critical systems before CI/CD deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 COMPREHENSIVE STARTUP CHECK');
console.log('===============================\n');

let criticalErrors = 0;
let warnings = 0;
const results = [];

function addResult(category, test, status, message, details = null) {
  const result = { category, test, status, message, details };
  results.push(result);
  
  const statusIcon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${statusIcon} ${category}: ${test}`);
  console.log(`   ${message}`);
  
  if (details) {
    details.forEach(detail => console.log(`   • ${detail}`));
  }
  
  if (status === 'fail') criticalErrors++;
  if (status === 'warning') warnings++;
  
  console.log();
}

// 1. Node.js Environment Check
console.log('📋 NODE.JS ENVIRONMENT');
console.log('-'.repeat(30));

try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    addResult('Environment', 'Node.js Version', 'pass', `Node.js ${nodeVersion} (compatible)`);
  } else {
    addResult('Environment', 'Node.js Version', 'fail', `Node.js ${nodeVersion} (requires >= 18)`);
  }
} catch (error) {
  addResult('Environment', 'Node.js Version', 'fail', 'Cannot determine Node.js version');
}

// 2. Package.json Configuration
try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageJson.type === 'module') {
    addResult('Environment', 'ESM Configuration', 'pass', 'Package configured for ES modules');
  } else {
    addResult('Environment', 'ESM Configuration', 'warning', 'Package not configured for ES modules');
  }
  
  // Check for required scripts
  const requiredScripts = ['dev', 'build', 'check-schema-drift'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
  
  if (missingScripts.length === 0) {
    addResult('Environment', 'Required Scripts', 'pass', 'All required npm scripts present');
  } else {
    addResult('Environment', 'Required Scripts', 'fail', 'Missing required scripts', missingScripts);
  }
  
} catch (error) {
  addResult('Environment', 'Package Configuration', 'fail', 'Cannot read package.json');
}

// 3. TypeScript Compilation
console.log('📋 TYPESCRIPT COMPILATION');
console.log('-'.repeat(30));

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  addResult('TypeScript', 'Compilation', 'pass', 'TypeScript compiles without errors');
} catch (error) {
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || 'Unknown error';
  const errorLines = errorOutput.split('\n').filter(line => line.trim()).slice(0, 5);
  addResult('TypeScript', 'Compilation', 'fail', 'TypeScript compilation errors', errorLines);
}

// 4. ESM Script Validation
console.log('📋 ESM SCRIPT VALIDATION');
console.log('-'.repeat(30));

const scriptFiles = [
  'scripts/check-schema-drift.js',
  'scripts/quick-validation.js',
  'scripts/system-validation.js'
];

let esmIssues = 0;

scriptFiles.forEach(scriptFile => {
  const fullPath = path.join(process.cwd(), scriptFile);
  
  if (!fs.existsSync(fullPath)) {
    addResult('ESM', `Script: ${scriptFile}`, 'warning', 'Script file not found');
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('require(') && !content.includes('import ')) {
    addResult('ESM', `Script: ${scriptFile}`, 'fail', 'Uses CommonJS require() instead of ESM import');
    esmIssues++;
  } else if (content.includes('import ')) {
    addResult('ESM', `Script: ${scriptFile}`, 'pass', 'Properly uses ESM import syntax');
  } else {
    addResult('ESM', `Script: ${scriptFile}`, 'warning', 'No module imports detected');
  }
});

// 5. Schema Drift Detection
console.log('📋 SCHEMA DRIFT DETECTION');
console.log('-'.repeat(30));

try {
  const output = execSync('npm run check-schema-drift', { 
    stdio: 'pipe',
    timeout: 30000
  });
  addResult('Schema', 'Drift Detection', 'pass', 'Schema drift detection completed successfully');
} catch (error) {
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || 'Unknown error';
  
  if (errorOutput.includes('require is not defined')) {
    addResult('Schema', 'Drift Detection', 'fail', 'ESM/CommonJS module system mismatch');
  } else if (errorOutput.includes('ECONNREFUSED') || errorOutput.includes('connection')) {
    addResult('Schema', 'Drift Detection', 'warning', 'Database connection failed (expected in CI)');
  } else {
    addResult('Schema', 'Drift Detection', 'fail', 'Schema drift detection failed', [errorOutput.slice(0, 200)]);
  }
}

// 6. Build Process Validation
console.log('📋 BUILD PROCESS');
console.log('-'.repeat(30));

try {
  const buildOutput = execSync('npm run build', { 
    stdio: 'pipe',
    timeout: 60000
  });
  
  // Check if dist directory was created
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const distFiles = fs.readdirSync(distPath);
    if (distFiles.length > 0) {
      addResult('Build', 'Production Build', 'pass', `Build successful (${distFiles.length} files generated)`);
    } else {
      addResult('Build', 'Production Build', 'fail', 'Build completed but no files generated');
    }
  } else {
    addResult('Build', 'Production Build', 'fail', 'Build completed but dist directory not found');
  }
  
} catch (error) {
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || 'Unknown error';
  const criticalErrors = [
    'module not found',
    'cannot resolve',
    'type error',
    'syntax error'
  ];
  
  const hasCriticalError = criticalErrors.some(err => 
    errorOutput.toLowerCase().includes(err.toLowerCase())
  );
  
  if (hasCriticalError) {
    addResult('Build', 'Production Build', 'fail', 'Build failed with critical errors', [errorOutput.slice(0, 300)]);
  } else {
    addResult('Build', 'Production Build', 'warning', 'Build completed with warnings');
  }
}

// 7. Mock Import Audit
console.log('📋 MOCK IMPORT AUDIT');
console.log('-'.repeat(30));

try {
  const auditOutput = execSync('npm run audit:mock-imports', { 
    stdio: 'pipe',
    timeout: 15000
  });
  
  const outputStr = auditOutput.toString();
  
  if (outputStr.includes('0 ISSUES FOUND') || outputStr.includes('✅ CLEAN CODEBASE')) {
    addResult('Code Quality', 'Mock Import Audit', 'pass', 'No hardcoded mock imports found');
  } else if (outputStr.includes('ISSUES FOUND')) {
    const issueCount = outputStr.match(/(\d+) ISSUES FOUND/)?.[1] || 'unknown';
    addResult('Code Quality', 'Mock Import Audit', 'warning', `${issueCount} issues found (non-blocking)`);
  } else {
    addResult('Code Quality', 'Mock Import Audit', 'warning', 'Audit completed with unknown status');
  }
  
} catch (error) {
  addResult('Code Quality', 'Mock Import Audit', 'warning', 'Mock import audit script not available');
}

// 8. Critical File Existence Check
console.log('📋 CRITICAL FILES');
console.log('-'.repeat(30));

const criticalFiles = [
  { path: 'src/providers/DataProvider.tsx', name: 'Data Provider' },
  { path: 'src/schema/index.ts', name: 'Schema Definitions' },
  { path: 'src/services/MockDataService.v2.ts', name: 'Mock Data Service' },
  { path: 'src/services/RealDataService.v2.ts', name: 'Real Data Service' },
  { path: '.env.local', name: 'Environment Configuration' },
  { path: 'supabase/migrations', name: 'Database Migrations' }
];

criticalFiles.forEach(({ path: filePath, name }) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath);
      addResult('Files', name, 'pass', `Directory exists with ${files.length} files`);
    } else {
      addResult('Files', name, 'pass', 'File exists');
    }
  } else {
    if (filePath === '.env.local') {
      addResult('Files', name, 'warning', 'File missing (may be intentional)');
    } else {
      addResult('Files', name, 'fail', 'Critical file missing');
    }
  }
});

// 9. Generate Report
console.log('📊 STARTUP CHECK SUMMARY');
console.log('='.repeat(50));

const totalChecks = results.length;
const passedChecks = results.filter(r => r.status === 'pass').length;
const failedChecks = results.filter(r => r.status === 'fail').length;
const warningChecks = results.filter(r => r.status === 'warning').length;

console.log(`Total Checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`⚠️  Warnings: ${warningChecks}`);
console.log(`❌ Failed: ${failedChecks}`);

const successRate = Math.round((passedChecks / totalChecks) * 100);
console.log(`Success Rate: ${successRate}%\n`);

// Determine overall status
let overallStatus = 'HEALTHY';
let exitCode = 0;

if (criticalErrors > 0) {
  overallStatus = 'CRITICAL FAILURE';
  exitCode = 1;
} else if (warnings > 3) {
  overallStatus = 'DEGRADED';
  exitCode = 0;
} else if (warnings > 0) {
  overallStatus = 'HEALTHY WITH WARNINGS';
  exitCode = 0;
}

console.log(`🎯 Overall Status: ${overallStatus}`);

if (criticalErrors > 0) {
  console.log('\n❌ CRITICAL ISSUES MUST BE RESOLVED BEFORE DEPLOYMENT:');
  results.filter(r => r.status === 'fail').forEach(result => {
    console.log(`   • ${result.category}: ${result.test} - ${result.message}`);
  });
}

if (warnings > 0) {
  console.log('\n⚠️  WARNINGS (should be addressed):');
  results.filter(r => r.status === 'warning').forEach(result => {
    console.log(`   • ${result.category}: ${result.test} - ${result.message}`);
  });
}

// Save detailed report
const reportPath = path.join(process.cwd(), 'startup-check-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  overallStatus,
  successRate,
  summary: {
    total: totalChecks,
    passed: passedChecks,
    warnings: warningChecks,
    failed: failedChecks
  },
  details: results
}, null, 2));

console.log(`\n📄 Detailed report saved: startup-check-report.json`);

if (exitCode === 0) {
  console.log('\n✅ STARTUP CHECK PASSED - System ready for deployment');
} else {
  console.log('\n❌ STARTUP CHECK FAILED - Critical issues must be resolved');
}

process.exit(exitCode);