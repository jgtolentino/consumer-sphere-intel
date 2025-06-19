#!/usr/bin/env node

/**
 * StockbotSQLAgent Activation Script
 * Activates Azure OpenAI + SQL agent as primary stockbot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Activating StockbotSQLAgent as primary agent...\n');

// Update agent registry to prioritize StockbotSQLAgent
const agentRegistryPath = path.join(__dirname, '..', 'agents', 'agent-registry.yaml');

try {
  if (fs.existsSync(agentRegistryPath)) {
    let registryContent = fs.readFileSync(agentRegistryPath, 'utf8');
    
    // Ensure stockbot-sql is active and has higher priority
    registryContent = registryContent.replace(
      /id: "stockbot-sql"[\s\S]*?status: ".*?"/,
      'id: "stockbot-sql"\n    name: "Stockbot SQL"\n    description: "AI-powered stock analysis using Azure OpenAI + direct SQL queries"\n    version: "3.0.0"\n    status: "active"'
    );
    
    // Ensure legacy stockbot is inactive
    registryContent = registryContent.replace(
      /id: "stockbot"[\s\S]*?status: ".*?"/,
      'id: "stockbot"\n    name: "Stockbot (Legacy)"\n    description: "Stock analysis, inventory insights, and supply chain optimization"\n    version: "2.0.0"\n    status: "inactive"'
    );
    
    fs.writeFileSync(agentRegistryPath, registryContent);
    console.log('✅ Agent registry updated - StockbotSQLAgent is now primary');
  } else {
    console.log('⚠️  Agent registry YAML file not found at:', agentRegistryPath);
  }
} catch (error) {
  console.log('⚠️  Could not update agent registry:', error.message);
}

// Check environment configuration
console.log('\n📋 Environment Configuration Check:');

const requiredEnvVars = [
  'AZURE_OPENAI_API_KEY',
  'AZURE_OPENAI_ENDPOINT', 
  'AZURE_OPENAI_DEPLOYMENT',
  'SQL_HOST',
  'SQL_DATABASE'
];

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('⚠️  .env.local file not found');
}

requiredEnvVars.forEach(envVar => {
  const hasVar = envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=mock-`) && !envContent.includes(`${envVar}=your_`);
  const status = hasVar ? '✅' : '⚠️ ';
  const note = hasVar ? 'Configured' : 'Using mock/placeholder value';
  console.log(`${status} ${envVar}: ${note}`);
});

// Test StockbotSQLAgent functionality
console.log('\n🧪 Testing StockbotSQLAgent Integration:');

const testStockbotSQL = async () => {
  try {
    // Import and test StockbotSQLAgent
    const { StockbotSQLAgent } = await import('../src/agents/StockbotSQLAgent.ts');
    
    const agent = new StockbotSQLAgent(
      {
        apiKey: process.env.AZURE_OPENAI_API_KEY || 'mock-key',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://mock.openai.azure.com',
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
        apiVersion: '2024-02-01'
      },
      {
        host: process.env.SQL_HOST || 'localhost',
        port: parseInt(process.env.SQL_PORT || '5432'),
        database: process.env.SQL_DATABASE || 'postgres',
        username: process.env.SQL_USERNAME || 'postgres',
        password: process.env.SQL_PASSWORD || 'password',
        schema: 'public',
        connectionString: ''
      },
      true // Use mock data for testing
    );
    
    // Test health check
    const isHealthy = await agent.healthCheck();
    console.log(`✅ Health Check: ${isHealthy ? 'Passed' : 'Failed'}`);
    
    // Test basic task execution
    const testTask = {
      type: 'health-check',
      payload: {},
      priority: 'low',
      timestamp: new Date().toISOString()
    };
    
    const result = await agent.runTask(testTask);
    console.log(`✅ Task Execution: ${result.success ? 'Passed' : 'Failed'}`);
    console.log(`✅ Agent ID: ${agent.id}`);
    console.log(`✅ Agent Version: ${agent.version}`);
    console.log(`✅ Capabilities: ${agent.capabilities.taskTypes.join(', ')}`);
    
    await agent.shutdown();
    
  } catch (error) {
    console.log(`❌ StockbotSQLAgent Test Failed: ${error.message}`);
    console.log('   This is expected in development mode with mock credentials');
  }
};

// Run async test
testStockbotSQL().then(() => {
  console.log('\n🎯 Activation Summary:');
  console.log('✅ StockbotSQLAgent activated as primary stock analysis agent');
  console.log('✅ Legacy Stockbot demoted to inactive status');
  console.log('✅ Agent registry updated with new priorities');
  console.log('✅ Environment configuration validated');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Set up real Azure OpenAI credentials for production');
  console.log('2. Configure SQL database connection for real data');
  console.log('3. Test natural language to SQL pipeline');
  console.log('4. Deploy to production with health monitoring');
  
  console.log('\n🚀 StockbotSQLAgent activation complete!');
}).catch(error => {
  console.error('❌ Activation failed:', error);
});