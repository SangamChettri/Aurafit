require('dotenv').config();

// Test user profile endpoint
async function testUserProfile() {
  try {
    console.log('🔍 Testing user profile endpoint...');
    
    // First, login as a regular user (not admin)
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@aurafit.com', // Using admin since we know it exists
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

    // Test getting user profile
    const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('👤 Profile response status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile endpoint working!');
      console.log('👤 User:', profileData.data.user.name);
      console.log('📧 Email:', profileData.data.user.email);
      console.log('🏋️ Total workouts:', profileData.data.stats.totalWorkouts);
      console.log('🏆 Achievements:', profileData.data.stats.achievementCount);
    } else {
      const errorData = await profileResponse.text();
      console.log('❌ Profile failed:', profileResponse.status);
      console.log('Error details:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserProfile();
