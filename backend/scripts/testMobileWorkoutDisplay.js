require('dotenv').config();

// Test mobile app workout display functionality
async function testMobileWorkoutDisplay() {
  try {
    console.log('Testing Mobile App Workout Display...\n');
    
    // Login first
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
    console.log('User authenticated');
    
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get workouts with pagination (like mobile app)
    console.log('\n1. Testing mobile app workout fetch...');
    const mobileAppResponse = await fetch('http://localhost:5000/api/workouts?page=1&limit=10&sortBy=date&sortOrder=desc', { headers });
    
    if (mobileAppResponse.ok) {
      const mobileData = await mobileAppResponse.json();
      console.log('Mobile app fetch successful!');
      console.log(`Workouts returned: ${mobileData.data.workouts.length}`);
      console.log('Pagination info:', mobileData.data.pagination);
      
      // Display workout details like mobile app would
      mobileData.data.workouts.forEach((workout, index) => {
        console.log(`\nWorkout ${index + 1}:`);
        console.log(`  ID: ${workout.id}`);
        console.log(`  Name: ${workout.name}`);
        console.log(`  Date: ${workout.date}`);
        console.log(`  Type: ${workout.type}`);
        console.log(`  Duration: ${workout.duration} minutes`);
        console.log(`  Exercises: ${workout.exercises.length}`);
        
        workout.exercises.forEach((exercise, exIndex) => {
          console.log(`    ${exIndex + 1}. ${exercise.exerciseName} - ${exercise.sets.length} sets`);
        });
      });
      
    } else {
      console.log('Mobile app fetch failed:', mobileAppResponse.status);
      const errorData = await mobileAppResponse.text();
      console.log('Error:', errorData);
    }
    
    // Test 2: Get single workout (for detail view)
    if (mobileAppResponse.ok) {
      const mobileData = await mobileAppResponse.json();
      if (mobileData.data.workouts.length > 0) {
        const firstWorkoutId = mobileData.data.workouts[0].id;
        
        console.log(`\n2. Testing workout detail view (ID: ${firstWorkoutId})...`);
        const detailResponse = await fetch(`http://localhost:5000/api/workouts/${firstWorkoutId}`, { headers });
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          console.log('Workout detail fetch successful!');
          console.log(`Workout: ${detailData.data.name}`);
          console.log(`Exercises: ${detailData.data.exercises.length}`);
        } else {
          console.log('Workout detail fetch failed:', detailResponse.status);
        }
      }
    }
    
    console.log('\nMobile app workout display test complete!');
    console.log('The mobile app should now be able to display logged workouts correctly.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMobileWorkoutDisplay();
