/**
 * Test OpenRouter API directly
 * This tests the OpenRouter API connection independently
 * 
 * Run with: node scripts/test-openrouter-direct.js
 * Or with custom key: API_KEY=your-key node scripts/test-openrouter-direct.js
 */

const https = require('https');

// Get API key from environment
const API_KEY = process.env.API_KEY || process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ No API key provided');
  console.error('Set API_KEY or OPENROUTER_API_KEY environment variable');
  console.error('Example: API_KEY=your-key node scripts/test-openrouter-direct.js');
  process.exit(1);
}

console.log('\n' + '='.repeat(80));
console.log('🧪 OpenRouter API Direct Test');
console.log('='.repeat(80));
console.log(`\n🔑 API Key: ${API_KEY.substring(0, 20)}...${API_KEY.substring(API_KEY.length - 10)}`);
console.log('🌐 Endpoint: https://openrouter.ai/api/v1/chat/completions');
console.log('🤖 Model: google/gemma-2-9b-it:free\n');
console.log('='.repeat(80) + '\n');

const payload = JSON.stringify({
  model: "google/gemma-2-9b-it:free",
  messages: [
    {
      role: "system",
      content: "You are a helpful AI assistant. Respond concisely."
    },
    {
      role: "user",
      content: "Say hello and confirm you're working. Keep it brief."
    }
  ],
  temperature: 0.7,
  max_tokens: 100
});

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'HTTP-Referer': 'https://vettcodecli.vercel.app',
    'X-Title': 'VettCode CLI Test'
  }
};

console.log('🔄 Sending test request...\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  const duration = Date.now() - startTime;
  
  console.log('📥 Response received');
  console.log('⏱️  Duration:', duration + 'ms');
  console.log('📊 Status:', res.statusCode, res.statusMessage);
  console.log('\n📋 Response Headers:');
  
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
      
      console.log('📄 Response Body:');
      console.log(JSON.stringify(response, null, 2));
      console.log('\n' + '='.repeat(80) + '\n');
      
      if (res.statusCode === 200) {
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ SUCCESS! OpenRouter API is working');
          console.log('\n🤖 AI Response:');
          console.log(response.choices[0].message.content);
          console.log('\n' + '='.repeat(80));
          console.log('\n✨ The API key is valid and the service is operational!');
          console.log('   The issue must be in the Vercel environment configuration.');
          console.log('\n💡 Next steps:');
          console.log('   1. Check Vercel environment variables');
          console.log('   2. Make sure OPENROUTER_API_KEY is set');
          console.log('   3. Redeploy after setting the variable');
        } else {
          console.log('⚠️  Unexpected response structure');
          console.log('   Response received but missing expected fields');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ AUTHENTICATION FAILED');
        console.log('   The API key is invalid or expired');
        console.log('\n💡 Solutions:');
        console.log('   1. Verify the API key is correct');
        console.log('   2. Generate a new key at https://openrouter.ai/keys');
        console.log('   3. Update the key in your environment');
      } else if (res.statusCode === 429) {
        console.log('⚠️  RATE LIMIT EXCEEDED');
        console.log('   Too many requests to OpenRouter');
        console.log('\n💡 Solutions:');
        console.log('   1. Wait before retrying');
        console.log('   2. Check if free tier limits apply');
        console.log('   3. Consider upgrading your plan');
      } else if (res.statusCode === 400) {
        console.log('❌ BAD REQUEST');
        console.log('   The request format is incorrect');
        console.log('\n   Error details:');
        console.log('   ', response.error?.message || 'Unknown error');
      } else {
        console.log('❌ REQUEST FAILED');
        console.log('   Status:', res.statusCode);
        console.log('   Error:', response.error?.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse JSON response');
      console.error('   Parse error:', error.message);
      console.error('\n📄 Raw Response Data:');
      console.error(data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ REQUEST ERROR');
  console.error('   Error:', error.message);
  console.error('   Code:', error.code);
  
  console.error('\n💡 Troubleshooting:');
  if (error.code === 'ENOTFOUND') {
    console.error('   - DNS lookup failed for openrouter.ai');
    console.error('   - Check your internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('   - Connection refused by server');
    console.error('   - OpenRouter might be down');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('   - Request timed out');
    console.error('   - Network might be slow or unstable');
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.error('\n⏱️  REQUEST TIMED OUT');
  console.error('   The request took too long to complete');
  req.destroy();
  process.exit(1);
});

req.setTimeout(30000); // 30 second timeout

req.write(payload);
req.end();
