#!/usr/bin/env node

/**
 * Fix React Imports Script
 * Automatically adds missing React imports to files that need them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 FIXING REACT IMPORTS');
console.log('=======================\n');

let filesFixed = 0;
const fixes = [];

function addReactImport(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check if React import already exists
  if (content.includes('import React') || content.includes('import * as React')) {
    return false;
  }
  
  // Check if file needs React import
  const needsReact = content.includes('<') || content.includes('React.') || content.includes('useState') || content.includes('useEffect');
  
  if (!needsReact) {
    return false;
  }
  
  // Add React import at the top
  let newContent = content;
  
  // Find the first import line
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Look for existing imports
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i;
      break;
    }
    if (lines[i].trim() && !lines[i].startsWith('//') && !lines[i].startsWith('/*') && !lines[i].startsWith('*')) {
      insertIndex = i;
      break;
    }
  }
  
  // Determine what React features are needed
  const needsUseState = content.includes('useState');
  const needsUseEffect = content.includes('useEffect');
  const needsUseCallback = content.includes('useCallback');
  const needsUseMemo = content.includes('useMemo');
  const needsUseRef = content.includes('useRef');
  
  let imports = ['React'];
  if (needsUseState) imports.push('useState');
  if (needsUseEffect) imports.push('useEffect');
  if (needsUseCallback) imports.push('useCallback');
  if (needsUseMemo) imports.push('useMemo');
  if (needsUseRef) imports.push('useRef');
  
  const importStatement = imports.length === 1 
    ? "import React from 'react';"
    : `import React, { ${imports.slice(1).join(', ')} } from 'react';`;
  
  // Insert the import
  lines.splice(insertIndex, 0, importStatement);
  newContent = lines.join('\n');
  
  fs.writeFileSync(filePath, newContent);
  
  console.log(`✅ ${relativePath}: Added React import`);
  fixes.push({
    file: relativePath,
    import: importStatement
  });
  
  return true;
}

function fixReactImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixReactImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (addReactImport(filePath, content)) {
        filesFixed++;
      }
    }
  });
}

// Fix files in src directory
const srcPath = path.join(process.cwd(), 'src');
fixReactImports(srcPath);

// Special case: Fix specific problematic files identified by validation
const problematicFiles = [
  'src/components/ui/carousel.tsx',
  'src/components/ui/sidebar.tsx',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-toast.ts'
];

problematicFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace React.useState with useState and add import
    if (content.includes('React.useState') && !content.includes('import React')) {
      content = content.replace(/React\.useState/g, 'useState');
      content = content.replace(/React\.useEffect/g, 'useEffect');
      content = content.replace(/React\.useCallback/g, 'useCallback');
      content = content.replace(/React\.useMemo/g, 'useMemo');
      content = content.replace(/React\.useRef/g, 'useRef');
      
      // Add React import
      if (!content.includes('import React') && !content.includes('import * as React')) {
        const importLine = "import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';";
        content = importLine + '\n' + content;
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath}: Fixed React.useState pattern`);
        filesFixed++;
      }
    }
  }
});

console.log('\n📊 REACT IMPORT FIX SUMMARY');
console.log('===========================');
console.log(`Files Fixed: ${filesFixed}`);
console.log(`Total Fixes Applied: ${fixes.length}`);

if (filesFixed > 0) {
  console.log('\n📋 Fixed Files:');
  fixes.forEach(fix => {
    console.log(`  • ${fix.file}: ${fix.import}`);
  });
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Run production build validation: node scripts/validate-production-build.js');
  console.log('2. Test the build: npm run build');
  console.log('3. Deploy if validation passes');
} else {
  console.log('\n✅ No React import issues found!');
}

console.log('\n✨ React import fix complete!');