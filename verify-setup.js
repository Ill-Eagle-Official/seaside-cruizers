/**
 * Setup Verification Script
 * Run this to verify all dependencies and files are correctly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Dash Sheet PDF Setup...\n');

let allGood = true;

// Check 1: Required packages
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const required = ['@sparticuz/chromium', 'puppeteer-core', 'nodemailer'];
  
  for (const pkg of required) {
    if (packageJson.dependencies[pkg]) {
      console.log(`  ✅ ${pkg} v${packageJson.dependencies[pkg]}`);
    } else {
      console.log(`  ❌ ${pkg} - MISSING!`);
      allGood = false;
    }
  }
} catch (err) {
  console.log('  ❌ Error reading package.json:', err.message);
  allGood = false;
}

// Check 2: Required files
console.log('\n📄 Checking required files...');
const requiredFiles = [
  'dashsheet.html',
  'seaside-cruizers.jpg',
  'api/webhook.js',
  'api/utils/pdfGenerator.js',
  'api/test-dashsheet.js',
  'vercel.json'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - MISSING!`);
    allGood = false;
  }
}

// Check 3: Verify dashsheet.html has placeholders
console.log('\n🎨 Checking dashsheet.html template...');
try {
  const template = fs.readFileSync(path.join(__dirname, 'dashsheet.html'), 'utf8');
  const placeholders = [
    '{{entryNumber}}',
    '{{year}}',
    '{{make}}',
    '{{model}}',
    '{{ownerName}}',
    '{{city}}',
    '{{province}}'
  ];
  
  for (const placeholder of placeholders) {
    if (template.includes(placeholder)) {
      console.log(`  ✅ ${placeholder}`);
    } else {
      console.log(`  ⚠️  ${placeholder} - NOT FOUND (might be okay if intentional)`);
    }
  }
  
  if (template.includes('seaside-cruizers.jpg')) {
    console.log('  ✅ Logo reference found');
  } else {
    console.log('  ⚠️  Logo reference not found');
  }
} catch (err) {
  console.log('  ❌ Error reading dashsheet.html:', err.message);
  allGood = false;
}

// Check 4: Verify Vercel configuration
console.log('\n⚙️  Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.functions && vercelConfig.functions['api/webhook.js']) {
    const config = vercelConfig.functions['api/webhook.js'];
    console.log(`  ✅ Memory: ${config.memory}MB`);
    console.log(`  ✅ Max Duration: ${config.maxDuration}s`);
    
    if (config.memory < 2048) {
      console.log('  ⚠️  Memory might be low for PDF generation (recommended: 3008MB)');
    }
    if (config.maxDuration < 30) {
      console.log('  ⚠️  Timeout might be short for PDF generation (recommended: 60s)');
    }
  } else {
    console.log('  ⚠️  No function configuration found for api/webhook.js');
  }
} catch (err) {
  console.log('  ❌ Error reading vercel.json:', err.message);
  allGood = false;
}

// Check 5: Environment variables (can't check values, just inform)
console.log('\n🔐 Environment variables needed (verify in Vercel dashboard):');
const envVars = [
  'GMAIL_USER',
  'GMAIL_PASS',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL (optional)',
  'GOOGLE_PRIVATE_KEY (optional)',
  'GOOGLE_SHEETS_ID (optional)'
];

for (const envVar of envVars) {
  if (process.env[envVar.split(' ')[0]]) {
    console.log(`  ✅ ${envVar} - Set`);
  } else {
    console.log(`  ℹ️  ${envVar} - Not detected locally (should be set in Vercel)`);
  }
}

// Check 6: Verify pdfGenerator.js imports
console.log('\n🔧 Checking pdfGenerator.js...');
try {
  const pdfGen = fs.readFileSync(path.join(__dirname, 'api/utils/pdfGenerator.js'), 'utf8');
  
  const checks = [
    { pattern: /import chromium from '@sparticuz\/chromium'/, name: 'Chromium import' },
    { pattern: /import puppeteer from 'puppeteer-core'/, name: 'Puppeteer import' },
    { pattern: /export async function generateDashSheetPDF/, name: 'generateDashSheetPDF export' },
    { pattern: /export async function sendDashSheetEmail/, name: 'sendDashSheetEmail export' },
    { pattern: /getLogoBase64/, name: 'Logo base64 conversion' },
    { pattern: /populateDashSheetTemplate/, name: 'Template population' }
  ];
  
  for (const check of checks) {
    if (check.pattern.test(pdfGen)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      allGood = false;
    }
  }
} catch (err) {
  console.log('  ❌ Error reading pdfGenerator.js:', err.message);
  allGood = false;
}

// Check 7: Verify webhook.js integration
console.log('\n🪝 Checking webhook.js integration...');
try {
  const webhook = fs.readFileSync(path.join(__dirname, 'api/webhook.js'), 'utf8');
  
  const checks = [
    { pattern: /import.*generateDashSheetPDF.*from.*pdfGenerator/, name: 'PDF generator import' },
    { pattern: /import.*sendDashSheetEmail.*from.*pdfGenerator/, name: 'Email sender import' },
    { pattern: /generateDashSheetPDF\(/, name: 'PDF generation call' },
    { pattern: /sendDashSheetEmail\(/, name: 'Email sending call' },
    { pattern: /getEntryCount/, name: 'Entry count function' }
  ];
  
  for (const check of checks) {
    if (check.pattern.test(webhook)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      allGood = false;
    }
  }
} catch (err) {
  console.log('  ❌ Error reading webhook.js:', err.message);
  allGood = false;
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ All checks passed! Your setup looks good.');
  console.log('\n📝 Next steps:');
  console.log('   1. Deploy to Vercel: vercel --prod');
  console.log('   2. Test the endpoint (see QUICK_START.md)');
  console.log('   3. Complete a test registration');
} else {
  console.log('⚠️  Some checks failed. Please review the issues above.');
  console.log('   See DASHSHEET_SETUP.md for detailed setup instructions.');
}
console.log('='.repeat(60) + '\n');

