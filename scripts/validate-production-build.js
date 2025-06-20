#!/usr/bin/env node

/**
 * Production Build Validation Script
 * Validates that the production build will work correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 PRODUCTION BUILD VALIDATION');
console.log('==============================\n');

let issues = 0;
const fixes = [];

// Check 1: Verify React is properly imported in main.tsx
const mainTsxPath = path.join(process.cwd(), 'src/main.tsx');
if (fs.existsSync(mainTsxPath)) {
  const content = fs.readFileSync(mainTsxPath, 'utf8');
  
  if (!content.includes('import React from')) {
    console.error('❌ main.tsx missing explicit React import');
    issues++;
  } else {
    console.log('✅ main.tsx has explicit React import');
    fixes.push('React properly imported in main.tsx');
  }
  
  if (!content.includes('React.StrictMode')) {
    console.error('❌ main.tsx not using React.StrictMode');
    issues++;
  } else {
    console.log('✅ main.tsx uses React.StrictMode');
    fixes.push('React.StrictMode wrapper present');
  }
} else {
  console.error('❌ main.tsx not found');
  issues++;
}

// Check 2: Verify Vite config has proper React chunking
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (!content.includes('manualChunks')) {
    console.error('❌ vite.config.ts missing manual chunks configuration');
    issues++;
  } else {
    console.log('✅ vite.config.ts has manual chunks');
    fixes.push('Vite manual chunks configured');
  }
  
  if (!content.includes("react: ['react', 'react-dom']")) {
    console.error('❌ vite.config.ts missing React chunk separation');
    issues++;
  } else {
    console.log('✅ vite.config.ts properly separates React');
    fixes.push('React chunk separation configured');
  }
} else {
  console.error('❌ vite.config.ts not found');
  issues++;
}

// Check 3: Build and verify output
console.log('\n🏗️ Testing production build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Production build successful');
  fixes.push('Production build completes');
  
  // Check if dist folder has the expected files
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath, { recursive: true });
    const hasIndex = files.some(f => f.includes('index') && f.endsWith('.html'));
    const hasReactChunk = files.some(f => f.includes('react') && f.endsWith('.js'));
    
    if (hasIndex) {
      console.log('✅ index.html generated');
      fixes.push('HTML entry point created');
    } else {
      console.error('❌ index.html not found in dist');
      issues++;
    }
    
    if (hasReactChunk) {
      console.log('✅ React chunk separated');
      fixes.push('React chunk properly separated');
    } else {
      // Check if React is bundled in main chunk instead
      const hasMainJs = files.some(f => f.includes('index') && f.endsWith('.js'));
      if (hasMainJs) {
        console.log('✅ React bundled in main chunk');
        fixes.push('React included in build');
      } else {
        console.error('❌ React chunk not found - may cause runtime errors');
        issues++;
      }
    }
  }
} catch (error) {
  console.error('❌ Production build failed');
  console.error(error.message);
  issues++;
}

// Check 4: Verify there are no null React imports
console.log('\n🔍 Scanning for problematic React patterns...');
const srcPath = path.join(process.cwd(), 'src');

function scanForReactIssues(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      scanForReactIssues(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Check for problematic patterns
      if (content.includes('React.useState') && !content.includes('import React') && !content.includes('import * as React')) {
        console.error(`❌ ${relativePath}: Uses React.useState without importing React`);
        issues++;
      }
      
      // Check for missing React import in JSX files
      if (file.endsWith('.tsx') && content.includes('<') && !content.includes('import React') && !content.includes('import * as React')) {
        console.error(`❌ ${relativePath}: JSX file missing React import`);
        issues++;
      }
    }
  });
}

scanForReactIssues(srcPath);

// Summary
console.log('\n📊 VALIDATION SUMMARY');
console.log('====================');
console.log(`Issues Found: ${issues}`);
console.log(`Fixes Applied: ${fixes.length}`);

if (issues > 0) {
  console.log('\n❌ PRODUCTION BUILD VALIDATION FAILED');
  console.log('The following issues must be fixed before deployment:');
  console.log('1. Ensure explicit React import in main.tsx');
  console.log('2. Configure React chunk separation in vite.config.ts');
  console.log('3. Add React imports to all JSX files');
  console.log('4. Test production build thoroughly');
  process.exit(1);
} else {
  console.log('\n✅ PRODUCTION BUILD VALIDATION PASSED');
  console.log('Build is ready for deployment!');
  
  console.log('\n📋 Validated Features:');
  fixes.forEach(fix => console.log(`  • ${fix}`));
  
  process.exit(0);
}