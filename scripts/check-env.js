#!/usr/bin/env node

/**
 * Environment Check Script
 * 
 * Validates that all required environment variables are set
 * Run with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = {
  SERPAPI_KEY: 'Required for web search functionality',
};

const OPTIONAL_VARS = {
  OPENAI_API_KEY: 'Required if using OpenAI GPT-4o',
  ANTHROPIC_API_KEY: 'Required if using Claude',
};

console.log('🔍 Checking environment configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ .env.local file not found!');
  console.log('\n💡 Create .env.local by copying .env.local.example:');
  console.log('   cp .env.local.example .env.local\n');
  process.exit(1);
}

console.log('✅ .env.local file exists\n');

// Load environment variables
require('dotenv').config({ path: envPath });

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('📋 Required Variables:');
for (const [varName, description] of Object.entries(REQUIRED_VARS)) {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName}: Missing - ${description}`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('..._here')) {
    console.error(`❌ ${varName}: Placeholder value detected - ${description}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Configured`);
  }
}

console.log('\n📋 Optional Variables (at least one required):');
let hasLLM = false;
for (const [varName, description] of Object.entries(OPTIONAL_VARS)) {
  const value = process.env[varName];
  if (!value) {
    console.warn(`⚠️  ${varName}: Not set - ${description}`);
  } else if (value.includes('your_') || value.includes('..._here')) {
    console.warn(`⚠️  ${varName}: Placeholder value - ${description}`);
  } else {
    console.log(`✅ ${varName}: Configured`);
    hasLLM = true;
  }
}

if (!hasLLM) {
  console.error('\n❌ ERROR: No LLM provider configured!');
  console.error('   You need at least one of: OPENAI_API_KEY or ANTHROPIC_API_KEY');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Environment check FAILED');
  console.log('\n💡 Please configure the missing variables in .env.local');
  console.log('   Get your API keys from:');
  console.log('   - OpenAI: https://platform.openai.com/api-keys');
  console.log('   - Anthropic: https://console.anthropic.com/');
  console.log('   - SerpApi: https://serpapi.com/manage-api-key');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment check passed with warnings');
  console.log('   Consider configuring both LLM providers for flexibility\n');
  process.exit(0);
} else {
  console.log('✅ Environment check PASSED');
  console.log('   All required variables are configured!\n');
  process.exit(0);
}
