require('dotenv').config();

// Test previous workout display functionality
async function testPreviousWorkoutDisplay() {
  try {
    console.log('Testing Previous Workout Display Functionality...\n');
    
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
    
    // Test 1: Get all workouts (for workout history)
    console.log('\n1. Testing workout history display...');
    const historyResponse = await fetch('http://localhost:5000/api/workouts?page=1&limit=10&sortBy=date&sortOrder=desc', { headers });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('Workout history fetch successful!');
      console.log(`Total workouts: ${historyData.data.workouts.length}`);
      
      if (historyData.data.workouts.length > 0) {
        console.log('\nRecent workouts:');
        historyData.data.workouts.slice(0, 3).forEach((workout, index) => {
          console.log(`  ${index + 1}. ${workout.name} - ${new Date(workout.date).toLocaleDateString()}`);
          console.log(`     Type: ${workout.type}, Duration: ${workout.duration}min, Exercises: ${workout.exercises.length}`);
        });
        
        // Test 2: Get workout details (for workout detail view)
        const firstWorkoutId = historyData.data.workouts[0].id;
        console.log(`\n2. Testing workout detail view (ID: ${firstWorkoutId})...`);
        
        const detailResponse = await fetch(`http://localhost:5000/api/workouts/${firstWorkoutId}`, { headers });
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          console.log('Workout detail fetch successful!');
          console.log(`Workout: ${detailData.data.name}`);
          console.log(`Date: ${new Date(detailData.data.date).toLocaleDateString()}`);
          console.log(`Type: ${detailData.data.type}`);
          console.log(`Duration: ${detailData.data.duration} minutes`);
          console.log(`Exercises: ${detailData.data.exercises.length}`);
          
          if (detailData.data.exercises.length > 0) {
            console.log('\nExercise details:');
            detailData.data.exercises.slice(0, 2).forEach((exercise, index) => {
              console.log(`  ${index + 1}. ${exercise.exerciseName}`);
              console.log(`     Sets: ${exercise.sets.length}`);
              exercise.sets.slice(0, 2).forEach((set, setIndex) => {
                console.log(`       Set ${setIndex + 1}: ${set.reps} reps @ ${set.weight || 0} lbs`);
              });
            });
          }
          
        } else {
          console.log('Workout detail fetch failed:', detailResponse.status);
        }
        
        // Test 3: Test previous workout data for exercises
        console.log('\n3. Testing previous workout data for exercises...');
        
        if (detailData.data.exercises.length > 0) {
          const firstExerciseId = detailData.data.exercises[0].exerciseId;
          const prevResponse = await fetch(`http://localhost:5000/api/workouts/exercise/${firstExerciseId}/previous`, { headers });
          
          if (prevResponse.ok) {
            const prevData = await prevResponse.json();
            if (prevData.data) {
              console.log(`Previous workout data for exercise ${firstExerciseId}:`);
              console.log(`  Reps: ${prevData.data.reps}, Weight: ${prevData.data.weight}`);
              console.log(`  Total sets: ${prevData.data.totalSets}`);
              console.log(`  Workout date: ${new Date(prevData.data.workoutDate).toLocaleDateString()}`);
            } else {
              console.log('No previous workout data found for this exercise');
            }
          } else {
            console.log('Previous workout data fetch failed:', prevResponse.status);
          }
        }
        
      } else {
        console.log('No workouts found in history');
      }
      
    } else {
      console.log('Workout history fetch failed:', historyResponse.status);
      const errorData = await historyResponse.text();
      console.log('Error:', errorData);
    }
    
    console.log('\nPrevious workout display test complete!');
    console.log('The mobile app should now display:');
    console.log('1. Workout history list with all logged workouts');
    console.log('2. Detailed workout view with exercises and sets');
    console.log('3. Previous workout data when adding new exercises');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPreviousWorkoutDisplay();
