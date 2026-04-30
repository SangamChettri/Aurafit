require('dotenv').config();

// Test if the route is reachable
async function testRoute() {
  try {
    console.log('🔍 Testing route accessibility...');
    
    // Test without auth first (should get 401)
    console.log('\n🚫 Testing without authentication...');
    const response1 = await fetch('http://localhost:5000/api/workouts/exercise/1/previous');
    console.log(`Status: ${response1.status}`);
    
    if (response1.status === 401) {
      console.log('✅ Route is reachable but requires authentication');
    } else {
      console.log('❌ Route not found or other error');
      const text = await response1.text();
      console.log('Response:', text);
    }
    
    // Test with authentication
    console.log('\n🔐 Testing with authentication...');
    
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aurafit.com', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.data.token;
      
      const response2 = await fetch('http://localhost:5000/api/workouts/exercise/1/previous', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`Status: ${response2.status}`);
      
      if (response2.ok) {
        const data = await response2.json();
        console.log('✅ Route working!');
        console.log('Data:', data);
      } else {
        const error = await response2.text();
        console.log('❌ Route failed:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoute();
