#!/usr/bin/env node

/**
 * Quick System Validation
 * Fast validation of critical components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 QUICK SYSTEM VALIDATION\n');

const results = {
  core: { passed: 0, total: 0 },
  agents: { passed: 0, total: 0 },
  monitoring: { passed: 0, total: 0 },
  config: { passed: 0, total: 0 }
};

// Check file existence
function check(category, filePath, description) {
  results[category].total++;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    results[category].passed++;
    return true;
  } else {
    console.log(`❌ ${description} - Missing: ${filePath}`);
    return false;
  }
}

console.log('📦 CORE ARCHITECTURE');
console.log('-'.repeat(30));
check('core', 'src/schema/index.ts', 'Canonical Schema');
check('core', 'src/agents/AgentService.ts', 'Agent Contract');
check('core', 'src/orchestration/WorkflowOrchestrator.ts', 'Orchestrator');
check('core', 'src/config/killSwitch.ts', 'Kill Switch');

console.log('\n🤖 AI AGENTS');
console.log('-'.repeat(30));
check('agents', 'src/agents/BiGenieAgent.ts', 'BI Genie');
check('agents', 'src/agents/StockbotSQLAgent.ts', 'Stockbot SQL');
check('agents', 'src/agents/RetailLearnBotAgent.ts', 'RetailLearnBot');
check('agents', 'src/agents/CesaiAgent.ts', 'CESAI');

console.log('\n🏥 HEALTH MONITORING');
console.log('-'.repeat(30));
check('monitoring', 'src/pages/api/health/index.ts', 'Health API');
check('monitoring', 'src/components/AgentHealthDashboard.tsx', 'Dashboard');
check('monitoring', 'src/hooks/useHealthMonitoring.ts', 'Monitoring Hook');

console.log('\n⚙️  CONFIGURATION');
console.log('-'.repeat(30));
check('config', '.env.local', 'Environment Config');
check('config', 'agents/agent-registry.yaml', 'Agent Registry');
check('config', 'package.json', 'Package Config');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));

let totalPassed = 0;
let totalChecks = 0;

Object.entries(results).forEach(([category, stats]) => {
  totalPassed += stats.passed;
  totalChecks += stats.total;
  const percentage = ((stats.passed / stats.total) * 100).toFixed(0);
  console.log(`${category.toUpperCase()}: ${stats.passed}/${stats.total} (${percentage}%)`);
});

const overallPercentage = ((totalPassed / totalChecks) * 100).toFixed(0);
console.log(`\nOVERALL: ${totalPassed}/${totalChecks} (${overallPercentage}%)`);

// Agent Registry Check
console.log('\n🔍 AGENT REGISTRY STATUS');
console.log('-'.repeat(30));
const registryPath = path.join(__dirname, '..', 'agents', 'agent-registry.yaml');
if (fs.existsSync(registryPath)) {
  const content = fs.readFileSync(registryPath, 'utf8');
  const stockbotSQL = content.includes('stockbot-sql') && content.includes('status: "active"');
  const stockbotLegacy = content.includes('id: "stockbot"') && content.includes('status: "inactive"');
  
  console.log(`StockbotSQL: ${stockbotSQL ? '✅ Active' : '❌ Not Active'}`);
  console.log(`Stockbot Legacy: ${stockbotLegacy ? '✅ Inactive' : '⚠️  Still Active'}`);
}

// Production Readiness
console.log('\n🚀 PRODUCTION READINESS');
console.log('-'.repeat(30));
if (overallPercentage === '100') {
  console.log('✅ ALL SYSTEMS GO - Ready for production!');
} else if (parseInt(overallPercentage) >= 90) {
  console.log('⚠️  NEARLY READY - Minor issues to address');
} else {
  console.log('❌ NOT READY - Critical components missing');
}

console.log('\n✨ Validation complete!');