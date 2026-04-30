require('dotenv').config();

// Test all mobile app API endpoints
async function testMobileAPI() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('🔍 Testing Mobile App API Endpoints...\n');
    
    // Test 1: Content endpoints
    console.log('📋 1. Testing Content Endpoints:');
    
    const constantsResponse = await fetch(`${baseUrl}/content/constants`);
    console.log(`   Constants: ${constantsResponse.ok ? '✅' : '❌'} (${constantsResponse.status})`);
    
    const inspirationResponse = await fetch(`${baseUrl}/content/inspiration`);
    console.log(`   Inspiration: ${inspirationResponse.ok ? '✅' : '❌'} (${inspirationResponse.status})`);
    
    // Test 2: Exercise endpoints
    console.log('\n🏋️ 2. Testing Exercise Endpoints:');
    
    const exercisesResponse = await fetch(`${baseUrl}/exercises`);
    console.log(`   All Exercises: ${exercisesResponse.ok ? '✅' : '❌'} (${exercisesResponse.status})`);
    
    const searchResponse = await fetch(`${baseUrl}/exercises?search=bench`);
    console.log(`   Search Exercises: ${searchResponse.ok ? '✅' : '❌'} (${searchResponse.status})`);
    
    const singleExerciseResponse = await fetch(`${baseUrl}/exercises/1`);
    console.log(`   Single Exercise: ${singleExerciseResponse.ok ? '✅' : '❌'} (${singleExerciseResponse.status})`);
    
    // Test 3: Exercise library endpoints
    console.log('\n📚 3. Testing Exercise Library Endpoints:');
    
    const libraryResponse = await fetch(`${baseUrl}/admin/exercise-library`);
    console.log(`   Exercise Library: ${libraryResponse.ok ? '✅' : '❌'} (${libraryResponse.status})`);
    
    // Test 4: Auth endpoints (without login)
    console.log('\n🔐 4. Testing Auth Endpoints:');
    
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aurafit.com', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.data.token;
      console.log(`   Login: ✅ (${loginResponse.status})`);
      
      // Test protected endpoints with token
      console.log('\n👤 5. Testing Protected Endpoints:');
      
      const profileResponse = await fetch(`${baseUrl}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   User Profile: ${profileResponse.ok ? '✅' : '❌'} (${profileResponse.status})`);
      
      const measurementsResponse = await fetch(`${baseUrl}/users/measurements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   User Measurements: ${measurementsResponse.ok ? '✅' : '❌'} (${measurementsResponse.status})`);
      
    } else {
      console.log(`   Login: ❌ (${loginResponse.status})`);
    }
    
    console.log('\n🎉 Mobile API testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMobileAPI();
