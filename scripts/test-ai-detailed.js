/**
 * Detailed AI Chat API Testing Script
 * Tests multiple scenarios and provides comprehensive diagnostics
 * 
 * Run with: node scripts/test-ai-detailed.js
 */

const https = require('https');

const API_URL = process.env.API_URL || 'https://vettcodecli.vercel.app';
const ENDPOINT = '/api/ai-chat';

// Test scenarios
const testScenarios = [
  {
    name: "Critical Issues Query",
    message: "What are the most critical issues?",
    description: "Tests if fallback responds to critical issues queries"
  },
  {
    name: "SQL Injection Query",
    message: "How do I fix SQL injection?",
    description: "Tests SQL injection specific responses"
  },
  {
    name: "Impact Assessment",
    message: "What's the security impact?",
    description: "Tests impact/risk assessment responses"
  },
  {
    name: "General Fix Request",
    message: "How do I fix these issues?",
    description: "Tests general fix guidance"
  },
  {
    name: "Prevention Strategies",
    message: "What prevention strategies should I use?",
    description: "Tests best practices responses"
  }
];

// Sample report data
const sampleReport = {
  projectName: "VettCode Test Project",
  score: 45,
  grade: "F",
  findings: [
    {
      severity: "critical",
      title: "SQL Injection in User Authentication",
      file: "server/auth/login.js",
      line: 42,
      category: "SQL Injection",
      description: "Direct string concatenation in SQL query allows injection attacks",
      mitigation: "Use parameterized queries or prepared statements",
      prevention: "Implement input validation and use ORM frameworks"
    },
    {
      severity: "critical",
      title: "Hardcoded Database Credentials",
      file: "server/config/database.js",
      line: 12,
      category: "Sensitive Data Exposure",
      description: "Database password stored in plaintext in source code"
    },
    {
      severity: "high",
      title: "XSS Vulnerability in Search Results",
      file: "client/components/Search.js",
      line: 88,
      category: "Cross-Site Scripting",
      description: "User input rendered without sanitization"
    },
    {
      severity: "high",
      title: "Missing Authentication Check",
      file: "server/routes/admin.js",
      line: 15,
      category: "Authorization",
      description: "Admin endpoint accessible without authentication"
    },
    {
      severity: "medium",
      title: "Weak Password Policy",
      file: "server/auth/register.js",
      line: 67,
      category: "Authentication"
    },
    {
      severity: "low",
      title: "Console.log Statement",
      file: "server/utils/logger.js",
      line: 23,
      category: "Information Disclosure"
    }
  ]
};

// Statistics
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  fallback: 0,
  aiResponses: 0,
  totalDuration: 0
};

console.log('\n' + '='.repeat(100));
console.log('🧪 AI CHAT API - DETAILED TESTING SUITE');
console.log('='.repeat(100));
console.log(`\n📍 Testing Endpoint: ${API_URL}${ENDPOINT}`);
console.log(`📊 Report: ${sampleReport.projectName} (${sampleReport.findings.length} findings)`);
console.log(`🎯 Test Scenarios: ${testScenarios.length}\n`);
console.log('='.repeat(100) + '\n');

// Function to make API request
function testAPI(scenario, index) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      message: scenario.message,
      report: sampleReport,
      history: []
    });

    const url = new URL(ENDPOINT, API_URL);
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

    console.log(`\n${'─'.repeat(100)}`);
    console.log(`📝 Test ${index + 1}/${testScenarios.length}: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Message: "${scenario.message}"`);
    console.log(`${'─'.repeat(100)}\n`);

    const startTime = Date.now();
    stats.total++;

    const req = https.request(options, (res) => {
      const duration = Date.now() - startTime;
      stats.totalDuration += duration;

      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);

      // Check rate limit headers
      if (res.headers['x-ratelimit-remaining']) {
        console.log(`📊 Rate Limit: ${res.headers['x-ratelimit-remaining']}/${res.headers['x-ratelimit-limit']} remaining`);
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200) {
            stats.success++;

            // Check if it's a fallback or AI response
            const isFallback = !response.model || 
              response.response.includes('**') || 
              response.response.includes('Report Summary');
            
            if (isFallback) {
              stats.fallback++;
              console.log(`🔄 Response Type: FALLBACK (AI API unavailable)`);
            } else {
              stats.aiResponses++;
              console.log(`🤖 Response Type: AI (${response.model})`);
            }

            console.log(`\n📄 Response Preview (first 300 chars):`);
            console.log(`   ${response.response.substring(0, 300)}${response.response.length > 300 ? '...' : ''}\n`);
            
            console.log(`📏 Response Length: ${response.response.length} characters`);
            
            // Check for helpful content
            const hasCodeBlocks = response.response.includes('```');
            const hasBulletPoints = response.response.includes('- ');
            const hasRecommendations = response.response.toLowerCase().includes('fix') || 
                                      response.response.toLowerCase().includes('recommendation');
            
            console.log(`\n✨ Content Analysis:`);
            console.log(`   - Code Examples: ${hasCodeBlocks ? '✅' : '❌'}`);
            console.log(`   - Bullet Points: ${hasBulletPoints ? '✅' : '❌'}`);
            console.log(`   - Recommendations: ${hasRecommendations ? '✅' : '❌'}`);

            resolve({ success: true, response, duration });
          } else {
            stats.failed++;
            console.log(`❌ Request failed with status ${res.statusCode}`);
            console.log(`   Error: ${response.error || 'Unknown error'}`);
            resolve({ success: false, error: response.error, statusCode: res.statusCode });
          }
        } catch (error) {
          stats.failed++;
          console.error(`❌ JSON Parse Error: ${error.message}`);
          console.error(`   Raw Data: ${data.substring(0, 200)}`);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      stats.failed++;
      console.error(`❌ Request Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(45000); // 45 second timeout
    req.on('timeout', () => {
      stats.failed++;
      console.error(`⏱️  Request timed out`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(payload);
    req.end();
  });
}

// Run all tests sequentially
async function runTests() {
  console.log('🚀 Starting tests...\n');

  for (let i = 0; i < testScenarios.length; i++) {
    await testAPI(testScenarios[i], i);
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (i < testScenarios.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(100));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(100));
  console.log(`\n✅ Total Tests: ${stats.total}`);
  console.log(`✅ Successful: ${stats.success} (${((stats.success/stats.total)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${stats.failed} (${((stats.failed/stats.total)*100).toFixed(1)}%)`);
  console.log(`\n🤖 AI Responses: ${stats.aiResponses}`);
  console.log(`🔄 Fallback Responses: ${stats.fallback}`);
  console.log(`\n⏱️  Average Duration: ${Math.round(stats.totalDuration / stats.total)}ms`);
  console.log(`⏱️  Total Duration: ${(stats.totalDuration / 1000).toFixed(2)}s`);

  console.log('\n' + '='.repeat(100));
  
  if (stats.fallback === stats.success && stats.fallback > 0) {
    console.log('\n⚠️  NOTICE: All responses were fallbacks');
    console.log('   This indicates the OpenRouter API is not responding.');
    console.log('   Check:');
    console.log('   1. OPENROUTER_API_KEY environment variable is set in Vercel');
    console.log('   2. API key is valid and has credits');
    console.log('   3. OpenRouter service status: https://status.openrouter.ai');
    console.log('   4. Vercel deployment logs for detailed errors');
  } else if (stats.aiResponses > 0) {
    console.log('\n✅ SUCCESS: AI API is working correctly!');
    console.log('   OpenRouter integration is functional.');
  }

  if (stats.failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run the test suite
runTests().catch(error => {
  console.error('\n💥 Unexpected Error:', error);
  process.exit(1);
});
