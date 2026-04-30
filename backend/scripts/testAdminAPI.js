require('dotenv').config();

// Test admin API endpoint
async function testAdminAPI() {
  try {
    console.log('🔍 Testing admin API endpoint...');
    
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@aurafit.com',
        password: 'admin123' // You might need to change this
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);

    if (!loginData.success) {
      console.log('❌ Login error:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('🔑 Got token:', token.substring(0, 20) + '...');

    // Now test the exercise library endpoint
    const exerciseResponse = await fetch('http://localhost:5000/api/admin/exercise-library/manage', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!exerciseResponse.ok) {
      throw new Error(`Exercise API failed: ${exerciseResponse.status}`);
    }

    const exerciseData = await exerciseResponse.json();
    console.log('✅ Exercise API response:', exerciseData.success);
    console.log('📊 Exercise count:', exerciseData.data?.exercises?.length || 0);

    if (exerciseData.success && exerciseData.data?.exercises) {
      console.log('🏋️ First few exercises:');
      exerciseData.data.exercises.slice(0, 3).forEach((ex, i) => {
        console.log(`  ${i+1}. ${ex.name} (${ex.category})`);
      });
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAdminAPI();
