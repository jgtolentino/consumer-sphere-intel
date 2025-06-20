#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testDashboardFunctionality() {
  console.log('🚀 Testing dashboard functionality...\n');

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console logging
    const consoleMessages = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        console.log(`⚠️  Console Warning: ${text}`);
      } else if (text.includes('✅') || text.includes('Failed to load') || text.includes('transactions')) {
        console.log(`📝 Console Log: ${text}`);
      }
    });
    
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        error: request.failure()?.errorText
      });
      console.log(`🌐 Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate to the dashboard
    console.log('1️⃣ Navigating to dashboard...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check for specific data mode toggle
    console.log('\n2️⃣ Checking data mode...');
    const dataModeElement = await page.$('[data-testid="data-mode-toggle"]');
    if (dataModeElement) {
      const modeText = await page.evaluate(el => el.textContent, dataModeElement);
      console.log(`📊 Current data mode: ${modeText}`);
    } else {
      console.log('📊 Data mode toggle not found, checking localStorage...');
      const dataMode = await page.evaluate(() => localStorage.getItem('dataMode'));
      console.log(`📊 Data mode from localStorage: ${dataMode}`);
    }
    
    // Check for KPI cards
    console.log('\n3️⃣ Checking KPI cards...');
    const kpiCards = await page.$$('.kpi-card, [data-testid*="kpi"], [class*="KpiCard"]');
    console.log(`📈 Found ${kpiCards.length} KPI cards`);
    
    if (kpiCards.length > 0) {
      for (let i = 0; i < Math.min(kpiCards.length, 3); i++) {
        const cardText = await page.evaluate(el => el.textContent, kpiCards[i]);
        console.log(`   Card ${i + 1}: ${cardText?.substring(0, 100)}...`);
      }
    }
    
    // Wait for any data loading
    console.log('\n4️⃣ Waiting for data to load...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check final state
    console.log('\n5️⃣ Final status check...');
    
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    const dataLogs = consoleMessages.filter(m => 
      m.text.includes('transactions') || 
      m.text.includes('data') || 
      m.text.includes('Using') ||
      m.text.includes('Failed to load')
    );
    
    console.log(`\n📊 Summary:`);
    console.log(`   Console Errors: ${errors.length}`);
    console.log(`   Console Warnings: ${warnings.length}`);
    console.log(`   Network Errors: ${networkErrors.length}`);
    console.log(`   Data-related logs: ${dataLogs.length}`);
    
    if (errors.length === 0 && networkErrors.length === 0) {
      console.log('\n✅ Dashboard appears to be working without errors!');
    } else {
      console.log('\n⚠️  Found some issues that may need attention.');
    }
    
    // Take a screenshot for reference
    await page.screenshot({ path: '/tmp/dashboard-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/dashboard-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Install puppeteer if not available, then run test
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function ensurePuppeteer() {
  try {
    await import('puppeteer');
    return true;
  } catch (e) {
    console.log('📦 Installing puppeteer...');
    try {
      await execAsync('npm install puppeteer');
      return true;
    } catch (installError) {
      console.log('⚠️  Could not install puppeteer, skipping browser test');
      return false;
    }
  }
}

ensurePuppeteer().then(available => {
  if (available) {
    testDashboardFunctionality().catch(console.error);
  }
});