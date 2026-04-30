require('dotenv').config();

// Test previous workout data endpoint
async function testPreviousWorkout() {
  try {
    console.log('🔍 Testing previous workout data endpoint...');
    
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

    // Test GET /workouts/exercise/3/previous
    console.log('\n🏋️ Testing GET /workouts/exercise/3/previous...');
    const previousResponse = await fetch('http://localhost:5000/api/workouts/exercise/3/previous', { headers });
    
    if (previousResponse.ok) {
      const previousData = await previousResponse.json();
      console.log('✅ Previous workout data endpoint working!');
      
      if (previousData.data) {
        console.log('📊 Previous data found:');
        console.log(`   Reps: ${previousData.data.reps}`);
        console.log(`   Weight: ${previousData.data.weight}`);
        console.log(`   Sets: ${previousData.data.totalSets}`);
        console.log(`   Date: ${previousData.data.workoutDate}`);
      } else {
        console.log('📊 No previous workout data found for exercise 3');
      }
    } else {
      console.log('❌ Previous workout data endpoint failed:', previousResponse.status);
      const errorData = await previousResponse.text();
      console.log('Error details:', errorData);
    }

    // Test with a different exercise ID
    console.log('\n🏋️ Testing GET /workouts/exercise/1/previous...');
    const previousResponse2 = await fetch('http://localhost:5000/api/workouts/exercise/1/previous', { headers });
    
    if (previousResponse2.ok) {
      const previousData2 = await previousResponse2.json();
      console.log('✅ Previous workout data endpoint working for exercise 1!');
      
      if (previousData2.data) {
        console.log('📊 Previous data found:');
        console.log(`   Reps: ${previousData2.data.reps}`);
        console.log(`   Weight: ${previousData2.data.weight}`);
      } else {
        console.log('📊 No previous workout data found for exercise 1');
      }
    } else {
      console.log('❌ Previous workout data endpoint failed:', previousResponse2.status);
    }

    console.log('\n🎉 Previous workout data testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPreviousWorkout();
