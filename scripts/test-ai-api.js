/**
 * Test script for AI Chat API
 * Run with: node scripts/test-ai-api.js
 */

const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'https://vettcodecli.vercel.app';
const ENDPOINT = '/api/ai-chat';

// Test data
const testReport = {
  projectName: "Test Project",
  score: 62,
  grade: "D",
  findings: [
    {
      severity: "critical",
      title: "SQL Injection in User Login",
      file: "auth/login.js",
      category: "SQL Injection",
      description: "User input directly concatenated into SQL query",
      mitigation: "Use parameterized queries"
    },
    {
      severity: "high",
      title: "XSS Vulnerability in Search",
      file: "search/index.js",
      category: "Cross-Site Scripting",
      description: "User input rendered without sanitization"
    },
    {
      severity: "medium",
      title: "Weak Password Policy",
      file: "auth/register.js",
      category: "Authentication"
    }
  ]
};

const testMessage = "What are the critical issues I should fix first?";

// Build request payload
const payload = JSON.stringify({
  message: testMessage,
  report: testReport,
  history: []
});

console.log('🧪 Testing AI Chat API\n');
console.log('📍 Endpoint:', API_URL + ENDPOINT);
console.log('💬 Message:', testMessage);
console.log('📊 Report:', testReport.projectName, `(${testReport.findings.length} issues)`);
console.log('\n' + '='.repeat(80) + '\n');

// Parse URL
const url = new URL(ENDPOINT, API_URL);

// Request options
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  }
};

console.log('🔄 Sending request...\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  const duration = Date.now() - startTime;
  
  console.log('📥 Response received');
  console.log('⏱️  Duration:', duration + 'ms');
  console.log('📊 Status:', res.statusCode, res.statusMessage);
  console.log('📋 Headers:');
  
  // Print response headers
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('✅ Response Body:');
      console.log(JSON.stringify(response, null, 2));
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      if (response.response) {
        console.log('🤖 AI Response:');
        console.log(response.response);
        console.log('\n');
      }
      
      if (response.error) {
        console.log('❌ Error:', response.error);
      }
      
      // Rate limit info
      if (res.headers['x-ratelimit-limit']) {
        console.log('\n📊 Rate Limit Info:');
        console.log('   Limit:', res.headers['x-ratelimit-limit']);
        console.log('   Remaining:', res.headers['x-ratelimit-remaining']);
        console.log('   Reset:', res.headers['x-ratelimit-reset']);
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ Test completed successfully');
      
    } catch (error) {
      console.error('❌ Failed to parse JSON response');
      console.error('Raw data:', data);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed');
  console.error('Error:', error.message);
  console.error('Code:', error.code);
  console.error('\n💡 Troubleshooting:');
  
  if (error.code === 'ENOTFOUND') {
    console.error('   - Check if the API URL is correct');
    console.error('   - Verify your internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('   - Make sure the server is running');
    console.error('   - Check if the port is correct');
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.error('\n⏱️  Request timed out');
  req.destroy();
  process.exit(1);
});

// Set timeout (60 seconds)
req.setTimeout(60000);

// Send request
req.write(payload);
req.end();

console.log('⏳ Waiting for response...\n');
