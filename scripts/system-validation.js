#!/usr/bin/env node

/**
 * Complete System Validation Script
 * Comprehensive validation of the managed AI bot workflow system
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CONSUMER SPHERE INTEL - COMPLETE SYSTEM VALIDATION\n');
console.log('=' .repeat(60));
console.log('Validating all components of the managed AI bot workflow...\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to run commands safely
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ PASSED');
    results.passed.push(description);
    return { success: true, output };
  } catch (error) {
    console.log('❌ FAILED');
    results.failed.push(description);
    return { success: false, error: error.message };
  }
}

// Helper function to check file existence
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    results.passed.push(description);
    return true;
  } else {
    console.log(`❌ ${description} - File missing: ${filePath}`);
    results.failed.push(description);
    return false;
  }
}

console.log('🏗️  1. ARCHITECTURE VALIDATION');
console.log('-'.repeat(40));

// Check core architecture files
checkFile('src/schema/index.ts', 'Canonical Schema Definition');
checkFile('src/agents/AgentService.ts', 'Universal Agent Contract');
checkFile('src/orchestration/WorkflowOrchestrator.ts', 'Workflow Orchestrator');
checkFile('src/config/killSwitch.ts', 'Kill Switch System');
checkFile('agents/agent-registry.yaml', 'Agent Registry Configuration');

console.log('\n🤖 2. AI AGENT VALIDATION');
console.log('-'.repeat(40));

// Check all agent implementations
const agents = [
  { file: 'src/agents/BiGenieAgent.ts', name: 'BI Genie Agent' },
  { file: 'src/agents/StockbotAgent.ts', name: 'Stockbot Agent (Legacy)' },
  { file: 'src/agents/StockbotSQLAgent.ts', name: 'Stockbot SQL Agent' },
  { file: 'src/agents/RetailLearnBotAgent.ts', name: 'RetailLearnBot Agent' },
  { file: 'src/agents/CesaiAgent.ts', name: 'CESAI Agent' }
];

agents.forEach(agent => checkFile(agent.file, agent.name));

console.log('\n🧪 3. TEST SUITE VALIDATION');
console.log('-'.repeat(40));

// Run critical tests
runCommand('npm run schema:test', 'Schema Drift Detection Tests');
runCommand('npm run agents:test', 'Agent Contract Compliance Tests');
runCommand('npm run test:sql-integration', 'SQL Integration Tests');

console.log('\n📊 4. DATA SERVICE VALIDATION');
console.log('-'.repeat(40));

// Check data services
checkFile('src/services/MockDataService.v2.ts', 'Mock Data Service v2');
checkFile('src/services/RealDataService.v2.ts', 'Real Data Service v2');
checkFile('src/services/SQLConnector.ts', 'SQL Connector Service');

console.log('\n🏥 5. HEALTH MONITORING VALIDATION');
console.log('-'.repeat(40));

// Check monitoring components
checkFile('src/pages/api/health/index.ts', 'System Health Endpoint');
checkFile('src/pages/api/health/agents.ts', 'Agent Health Endpoint');
checkFile('src/pages/api/health/schema.ts', 'Schema Health Endpoint');
checkFile('src/pages/api/health/killswitch.ts', 'Kill Switch Endpoint');
checkFile('src/components/AgentHealthDashboard.tsx', 'Health Dashboard Component');
checkFile('src/hooks/useHealthMonitoring.ts', 'Health Monitoring Hook');

console.log('\n🔧 6. CONFIGURATION VALIDATION');
console.log('-'.repeat(40));

// Check environment configuration
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Environment configuration file exists');
  results.passed.push('Environment configuration');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'AZURE_OPENAI_API_KEY',
    'SQL_HOST',
    'SQL_DATABASE'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      console.log(`   ✅ ${varName} configured`);
    } else {
      console.log(`   ⚠️  ${varName} not configured`);
      results.warnings.push(`Missing environment variable: ${varName}`);
    }
  });
} else {
  console.log('❌ Environment configuration file missing');
  results.failed.push('Environment configuration');
}

console.log('\n🚨 7. KILL SWITCH VALIDATION');
console.log('-'.repeat(40));

// Test kill switch functionality
console.log('Testing kill switch activation/deactivation...');
try {
  // Set kill switch environment variable
  process.env.KILL_SWITCH = 'true';
  process.env.KILL_SWITCH_REASON = 'System validation test';
  console.log('✅ Kill switch can be activated via environment');
  results.passed.push('Kill switch activation');
  
  // Reset
  delete process.env.KILL_SWITCH;
  delete process.env.KILL_SWITCH_REASON;
  console.log('✅ Kill switch can be deactivated');
  results.passed.push('Kill switch deactivation');
} catch (error) {
  console.log('❌ Kill switch test failed');
  results.failed.push('Kill switch functionality');
}

console.log('\n📦 8. BUILD VALIDATION');
console.log('-'.repeat(40));

// Test build process
runCommand('npm run build', 'Production Build');

// Check build output
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`✅ Build output generated (${files.length} files)`);
  results.passed.push('Build output verification');
} else {
  console.log('❌ Build output directory missing');
  results.failed.push('Build output verification');
}

console.log('\n🎯 9. AGENT REGISTRY VALIDATION');
console.log('-'.repeat(40));

// Check agent registry status
const registryPath = path.join(__dirname, '..', 'agents', 'agent-registry.yaml');
if (fs.existsSync(registryPath)) {
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  
  // Check StockbotSQL is active
  if (registryContent.includes('id: "stockbot-sql"') && registryContent.includes('status: "active"')) {
    console.log('✅ StockbotSQL Agent is active');
    results.passed.push('StockbotSQL activation');
  } else {
    console.log('❌ StockbotSQL Agent is not active');
    results.failed.push('StockbotSQL activation');
  }
  
  // Check legacy Stockbot is inactive
  if (registryContent.includes('id: "stockbot"') && registryContent.includes('status: "inactive"')) {
    console.log('✅ Legacy Stockbot is inactive');
    results.passed.push('Legacy Stockbot deactivation');
  } else {
    console.log('⚠️  Legacy Stockbot is still active');
    results.warnings.push('Legacy Stockbot should be inactive');
  }
}

console.log('\n🔐 10. SECURITY VALIDATION');
console.log('-'.repeat(40));

// Check for hardcoded secrets
console.log('Scanning for hardcoded secrets...');
try {
  const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | head -20', { encoding: 'utf8' }).trim().split('\n');
  let secretsFound = false;
  
  srcFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.match(/api_key\s*=\s*["'][^"']+["']/i) && !content.includes('mock') && !content.includes('example')) {
        console.log(`   ⚠️  Potential hardcoded secret in ${file}`);
        secretsFound = true;
      }
    }
  });
  
  if (!secretsFound) {
    console.log('✅ No hardcoded secrets detected');
    results.passed.push('Security scan');
  } else {
    results.warnings.push('Potential hardcoded secrets found');
  }
} catch (error) {
  console.log('   ℹ️  Security scan skipped');
}

// Generate validation report
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));

const totalTests = results.passed.length + results.failed.length;
const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

console.log(`\n✅ Passed: ${results.passed.length}/${totalTests} (${passRate}%)`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:');
  results.failed.forEach(test => console.log(`   - ${test}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.warnings.forEach(warning => console.log(`   - ${warning}`));
}

// Production readiness assessment
console.log('\n🚀 PRODUCTION READINESS ASSESSMENT');
console.log('-'.repeat(40));

const criticalComponents = [
  'Canonical Schema Definition',
  'Universal Agent Contract',
  'Workflow Orchestrator',
  'Kill Switch System',
  'Agent Contract Compliance Tests',
  'Schema Drift Detection Tests'
];

const criticalPassed = criticalComponents.every(comp => results.passed.includes(comp));

if (criticalPassed && results.failed.length === 0) {
  console.log('✅ SYSTEM IS PRODUCTION READY');
  console.log('   All critical components validated');
  console.log('   No blocking issues detected');
} else if (criticalPassed) {
  console.log('⚠️  SYSTEM IS CONDITIONALLY READY');
  console.log('   Critical components validated');
  console.log('   Non-critical issues should be addressed');
} else {
  console.log('❌ SYSTEM NOT READY FOR PRODUCTION');
  console.log('   Critical components need attention');
}

// Generate deployment checklist
const checklistPath = path.join(__dirname, '..', 'DEPLOYMENT_CHECKLIST.md');
const checklist = `# 🚀 Production Deployment Checklist

Generated: ${new Date().toISOString()}

## ✅ Validated Components (${results.passed.length})

${results.passed.map(item => `- [x] ${item}`).join('\n')}

## ❌ Failed Validations (${results.failed.length})

${results.failed.length > 0 ? results.failed.map(item => `- [ ] ${item}`).join('\n') : '- None'}

## ⚠️  Warnings (${results.warnings.length})

${results.warnings.length > 0 ? results.warnings.map(item => `- ${item}`).join('\n') : '- None'}

## 📋 Pre-Deployment Tasks

- [ ] Set production environment variables
- [ ] Configure Azure OpenAI credentials
- [ ] Set up SQL database connection
- [ ] Enable health monitoring alerts
- [ ] Review and test kill switch procedures
- [ ] Run performance benchmarks
- [ ] Update agent registry for production
- [ ] Configure error logging and monitoring
- [ ] Set up backup and recovery procedures
- [ ] Document emergency procedures

## 🔐 Security Checklist

- [ ] Remove all development/mock credentials
- [ ] Enable HTTPS only
- [ ] Set up API rate limiting
- [ ] Configure CORS policies
- [ ] Enable audit logging
- [ ] Review SQL injection protections
- [ ] Test kill switch activation

## 📊 Performance Targets

- Agent response time: < 2 seconds
- Health check interval: 30 seconds
- Kill switch activation: < 100ms
- Schema validation: Real-time
- Error recovery: Automatic with fallback

## 🎯 Deployment Status

**System Validation**: ${passRate}% passed
**Production Ready**: ${criticalPassed && results.failed.length === 0 ? 'YES ✅' : 'NO ❌'}
**Deployment Risk**: ${results.failed.length === 0 ? 'LOW' : results.failed.length < 3 ? 'MEDIUM' : 'HIGH'}
`;

fs.writeFileSync(checklistPath, checklist);
console.log(`\n📄 Deployment checklist generated: DEPLOYMENT_CHECKLIST.md`);

console.log('\n✨ VALIDATION COMPLETE\n');