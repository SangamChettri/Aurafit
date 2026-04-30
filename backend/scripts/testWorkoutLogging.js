require('dotenv').config();

// Test workout logging and display
async function testWorkoutLogging() {
  try {
    console.log('Testing Workout Logging and Display...\n');
    
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
    
    // Step 1: Get current workouts
    console.log('\n1. Getting current workouts...');
    const getCurrentResponse = await fetch('http://localhost:5000/api/workouts', { headers });
    
    if (getCurrentResponse.ok) {
      const currentData = await getCurrentResponse.json();
      console.log(`Current workouts: ${currentData.data.workouts.length}`);
      currentData.data.workouts.forEach((workout, index) => {
        console.log(`  ${index + 1}. ${workout.name} (${workout.date}) - ${workout.exercises.length} exercises`);
      });
    } else {
      console.log('Failed to get current workouts:', getCurrentResponse.status);
    }
    
    // Step 2: Create a new workout
    console.log('\n2. Creating a new workout...');
    const newWorkout = {
      name: 'Test Workout from Script',
      type: 'STRENGTH',
      date: new Date().toISOString(),
      duration: 45,
      notes: 'Test workout created via API',
      exercises: [
        {
          exerciseId: 1, // Push-ups
          exercise: { name: 'Push-ups' },
          sets: [
            { reps: 12, weight: 0 },
            { reps: 10, weight: 0 }
          ]
        },
        {
          exerciseId: 2, // Squats
          exercise: { name: 'Squats' },
          sets: [
            { reps: 15, weight: 50 },
            { reps: 12, weight: 50 }
          ]
        }
      ]
    };
    
    const createResponse = await fetch('http://localhost:5000/api/workouts', {
      method: 'POST',
      headers,
      body: JSON.stringify(newWorkout)
    });
    
    if (createResponse.ok) {
      const createdData = await createResponse.json();
      console.log('Workout created successfully!');
      console.log(`Workout ID: ${createdData.data.id}`);
      console.log(`Name: ${createdData.data.name}`);
    } else {
      const errorData = await createResponse.text();
      console.log('Failed to create workout:', createResponse.status);
      console.log('Error:', errorData);
    }
    
    // Step 3: Get workouts again to verify
    console.log('\n3. Verifying workout was saved...');
    const verifyResponse = await fetch('http://localhost:5000/api/workouts', { headers });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log(`Total workouts after creation: ${verifyData.data.workouts.length}`);
      
      const latestWorkout = verifyData.data.workouts[0];
      if (latestWorkout && latestWorkout.name === 'Test Workout from Script') {
        console.log('New workout found and displayed correctly!');
        console.log(`Name: ${latestWorkout.name}`);
        console.log(`Date: ${latestWorkout.date}`);
        console.log(`Exercises: ${latestWorkout.exercises.length}`);
        
        latestWorkout.exercises.forEach((exercise, index) => {
          console.log(`  Exercise ${index + 1}: ${exercise.exerciseName} - ${exercise.sets.length} sets`);
        });
      } else {
        console.log('New workout not found in the list');
      }
    } else {
      console.log('Failed to verify workouts:', verifyResponse.status);
    }
    
    console.log('\nWorkout logging test complete!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWorkoutLogging();
