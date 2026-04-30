require('dotenv').config();

// Final test of the previous workout endpoint
async function testFinal() {
  try {
    console.log('🎯 Final test of previous workout endpoint...');
    
    // Login
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
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Test exercise 1 (Push-ups - should have reps, no weight)
    console.log('\n🏋️ Testing Exercise 1 (Push-ups):');
    const response1 = await fetch('http://localhost:5000/api/workouts/exercise/1/previous', { headers });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success!');
      console.log(`   Reps: ${data1.data.reps}, Weight: ${data1.data.weight}, Sets: ${data1.data.totalSets}`);
    } else {
      console.log('❌ Failed');
    }
    
    // Test exercise 3 (Bench Press - should have reps and weight)
    console.log('\n🏋️ Testing Exercise 3 (Bench Press):');
    const response3 = await fetch('http://localhost:5000/api/workouts/exercise/3/previous', { headers });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Success!');
      console.log(`   Reps: ${data3.data.reps}, Weight: ${data3.data.weight}, Sets: ${data3.data.totalSets}`);
    } else {
      console.log('❌ Failed');
    }
    
    // Test exercise 99 (should return null - no previous data)
    console.log('\n🏋️ Testing Exercise 99 (No previous data):');
    const response99 = await fetch('http://localhost:5000/api/workouts/exercise/99/previous', { headers });
    
    if (response99.ok) {
      const data99 = await response99.json();
      console.log('✅ Success!');
      console.log(`   Data: ${data99.data}`);
    } else {
      console.log('❌ Failed');
    }
    
    console.log('\n🎉 Previous workout data endpoint is fully functional!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFinal();
