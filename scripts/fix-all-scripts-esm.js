#!/usr/bin/env node

/**
 * Fix All Scripts ESM Compatibility
 * Converts all Node.js scripts from require() to import syntax
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 CONVERTING ALL SCRIPTS TO ESM\n');

const scriptsDir = path.join(__dirname);

// ESM conversion patterns
const conversions = [
  {
    pattern: /const { ([^}]+) } = require\(['"`]([^'"`]+)['"`]\);?/g,
    replacement: 'import { $1 } from \'$2\';'
  },
  {
    pattern: /const (\w+) = require\(['"`]([^'"`]+)['"`]\);?/g,
    replacement: 'import $1 from \'$2\';'
  },
  {
    pattern: /require\(['"`]([^'"`]+)['"`]\)/g,
    replacement: 'import(\'$1\')'
  }
];

// Add __dirname and __filename polyfills for ESM
const esmPolyfill = `
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
`;

function convertFile(filePath) {
  if (!filePath.endsWith('.js') || filePath.includes('node_modules')) {
    return false;
  }

  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`🔧 Converting ${relativePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Check if already ESM
  if (content.includes('import {') || content.includes('import ')) {
    console.log(`   ✅ Already ESM format`);
    return false;
  }

  // Check if has require statements
  if (!content.includes('require(')) {
    console.log(`   ℹ️  No require statements found`);
    return false;
  }

  // Apply conversions
  conversions.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });

  // Add ESM polyfills if __dirname or __filename are used
  if ((content.includes('__dirname') || content.includes('__filename')) && 
      !content.includes('fileURLToPath')) {
    
    // Find the best place to insert the polyfill (after imports)
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].includes('from \'')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' || lines[i].startsWith('//')) {
        continue;
      } else {
        break;
      }
    }
    
    // Insert polyfill
    lines.splice(insertIndex, 0, esmPolyfill);
    content = lines.join('\n');
    hasChanges = true;
  }

  // Clean up extra blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Converted to ESM`);
    return true;
  } else {
    console.log(`   ℹ️  No changes needed`);
    return false;
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  let converted = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      converted += scanDirectory(filePath);
    } else if (stat.isFile() && file.endsWith('.js')) {
      if (convertFile(filePath)) {
        converted++;
      }
    }
  });

  return converted;
}

console.log('📂 Scanning scripts directory...\n');

const totalConverted = scanDirectory(scriptsDir);

console.log('\n' + '='.repeat(50));
console.log('📊 CONVERSION SUMMARY');
console.log('='.repeat(50));

console.log(`✅ Converted ${totalConverted} files to ESM format`);

if (totalConverted > 0) {
  console.log('\n📋 Post-Conversion Steps:');
  console.log('1. Test all scripts: npm run check-schema-drift');
  console.log('2. Verify CI/CD: npm run validate-schema');
  console.log('3. Run builds: npm run build');
  console.log('4. Check for any remaining require() statements');
} else {
  console.log('\n✅ All scripts are already ESM compatible');
}

console.log('\n✨ ESM conversion complete!');
console.log('🚀 CI/CD schema drift detection should now work properly');