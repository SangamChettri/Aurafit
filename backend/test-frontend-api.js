// Test the API connection from frontend perspective
const axios = require('axios');

// Simulate the frontend axios configuration
const API_URL = 'http://10.0.2.2:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing frontend API connection...');
    console.log('🔌 API URL configured:', API_URL);
    
    // Test registration
    const response = await axiosInstance.post('/auth/register', {
      name: 'Frontend Test User',
      email: `frontend${Date.now()}@example.com`,
      password: '123456',
      goal: 'general_fitness'
    });
    
    console.log('✅ Frontend API test successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Frontend API test failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendAPI();
