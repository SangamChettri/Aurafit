// Test script to verify API connection using Node.js built-in http module
const http = require('http');

async function testAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: '123456',
      goal: 'general_fitness'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('✅ API Response Status:', res.statusCode);
        console.log('✅ Response Body:', data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error('❌ API test failed:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

testAPI().catch(console.error);
