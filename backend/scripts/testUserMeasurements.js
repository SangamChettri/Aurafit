require('dotenv').config();

// Test user measurements endpoint
async function testUserMeasurements() {
  try {
    console.log('🔍 Testing user measurements endpoint...');
    
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@aurafit.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login error:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('🔑 Got token');

    // Test getting user measurements
    const measurementsResponse = await fetch('http://localhost:5000/api/users/measurements', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📏 Measurements response status:', measurementsResponse.status);
    
    if (measurementsResponse.ok) {
      const measurementsData = await measurementsResponse.json();
      console.log('✅ Measurements endpoint working!');
      console.log('📊 Measurements count:', measurementsData.data.measurements.length);
      
      if (measurementsData.data.measurements.length > 0) {
        console.log('📏 Latest measurement:', measurementsData.data.measurements[0].date);
      }
    } else {
      const errorData = await measurementsResponse.text();
      console.log('❌ Measurements failed:', measurementsResponse.status);
      console.log('Error details:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserMeasurements();
