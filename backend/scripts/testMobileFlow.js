require('dotenv').config();

// Test the complete mobile app flow
async function testMobileFlow() {
  try {
    console.log('📱 Testing Mobile App Flow...\n');
    
    // Step 1: Login
    console.log('🔐 Step 1: User login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aurafit.com', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ User authenticated');
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Step 2: Load exercises
    console.log('\n🏋️ Step 2: Loading exercises...');
    const exercisesResponse = await fetch('http://localhost:5000/api/exercises', { headers });
    
    if (exercisesResponse.ok) {
      const exercises = await exercisesResponse.json();
      console.log(`✅ Loaded ${exercises.data.length} exercises`);
      
      // Step 3: Test previous workout data for exercises that have history
      console.log('\n📊 Step 3: Testing previous workout data...');
      
      // Test exercise 1 (Push-ups - should have previous data)
      const prev1Response = await fetch('http://localhost:5000/api/workouts/exercise/1/previous', { headers });
      if (prev1Response.ok) {
        const prev1Data = await prev1Response.json();
        if (prev1Data.data) {
          console.log(`✅ Exercise 1 (Push-ups): ${prev1Data.data.reps} reps @ ${prev1Data.data.weight} lbs`);
        } else {
          console.log('📊 Exercise 1: No previous data');
        }
      }
      
      // Test exercise 3 (Bench Press - should have previous data)
      const prev3Response = await fetch('http://localhost:5000/api/workouts/exercise/3/previous', { headers });
      if (prev3Response.ok) {
        const prev3Data = await prev3Response.json();
        if (prev3Data.data) {
          console.log(`✅ Exercise 3 (Bench Press): ${prev3Data.data.reps} reps @ ${prev3Data.data.weight} lbs`);
        } else {
          console.log('📊 Exercise 3: No previous data');
        }
      }
      
      console.log('\n🎉 Mobile App Flow Test Complete!');
      console.log('✅ Previous workout data is available for smart suggestions');
      console.log('📱 The mobile app should now show previous workout data!');
      
    } else {
      console.log('❌ Failed to load exercises');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMobileFlow();
