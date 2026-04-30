require('dotenv').config();

// Test workout API endpoints
async function testWorkoutAPI() {
  try {
    console.log('🔍 Testing Workout API endpoints...');
    
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
    const token = loginData.data.token;
    console.log('🔑 Got token');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test GET /workouts
    console.log('\n💪 Testing GET /workouts...');
    const workoutsResponse = await fetch('http://localhost:5000/api/workouts', { headers });
    
    if (workoutsResponse.ok) {
      const workoutsData = await workoutsResponse.json();
      console.log('✅ GET workouts working!');
      console.log('📊 Workout count:', workoutsData.data?.workouts?.length || 0);
    } else {
      console.log('❌ GET workouts failed:', workoutsResponse.status);
      const errorData = await workoutsResponse.text();
      console.log('Error details:', errorData);
    }

    // Test GET /workouts/stats
    console.log('\n📈 Testing GET /workouts/stats...');
    const statsResponse = await fetch('http://localhost:5000/api/workouts/stats', { headers });
    
    if (statsResponse.ok) {
      console.log('✅ GET workout stats working!');
    } else {
      console.log('❌ GET workout stats failed:', statsResponse.status);
    }

    // Test GET /workouts/personal-bests
    console.log('\n🏆 Testing GET /workouts/personal-bests...');
    const bestsResponse = await fetch('http://localhost:5000/api/workouts/personal-bests', { headers });
    
    if (bestsResponse.ok) {
      console.log('✅ GET personal bests working!');
    } else {
      console.log('❌ GET personal bests failed:', bestsResponse.status);
    }

    console.log('\n🎉 Workout API testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkoutAPI();
