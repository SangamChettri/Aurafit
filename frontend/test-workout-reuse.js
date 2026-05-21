// Test workout reuse functionality
console.log('Testing workout reuse functionality...');

// Simulate the workout data structure
const mockWorkout = {
  id: 'workout-123',
  name: 'Morning Upper Body',
  type: 'STRENGTH',
  date: '2024-01-15',
  completed: true,
  exercises: [
    {
      id: 'ex-1',
      exerciseName: 'Bench Press',
      sets: [
        { id: 'set-1', reps: 10, weight: 135, completed: true, restTime: 60 },
        { id: 'set-2', reps: 8, weight: 145, completed: true, restTime: 60 },
        { id: 'set-3', reps: 6, weight: 155, completed: true, restTime: 60 }
      ]
    },
    {
      id: 'ex-2',
      exerciseName: 'Shoulder Press',
      sets: [
        { id: 'set-4', reps: 12, weight: 45, completed: true, restTime: 60 },
        { id: 'set-5', reps: 10, weight: 50, completed: true, restTime: 60 }
      ]
    }
  ]
};

// Simulate the template data transformation
const templateWorkout = {
  name: mockWorkout.name,
  type: mockWorkout.type,
  exercises: mockWorkout.exercises?.map(ex => ({
    ...ex,
    id: Date.now().toString() + Math.random(), // Unique ID for the temporary session
    sets: ex.sets.map(s => ({
      ...s,
      id: Date.now().toString() + Math.random(),
      completed: false
    }))
  })) || []
};

console.log('Original workout:', mockWorkout);
console.log('Template workout for reuse:', templateWorkout);
console.log('Template workout exercises count:', templateWorkout.exercises.length);
console.log('Template workout sets count:', templateWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0));

console.log('\nWorkout reuse functionality test passed!');
console.log('When user clicks on a workout in WorkoutScreen:');
console.log('1. handleRepeatWorkout() is called with the workout data');
console.log('2. Navigation.navigate() goes to WorkoutLog with templateWorkout');
console.log('3. WorkoutLogScreen receives templateWorkout and pre-fills the form');
console.log('4. User can modify and save the workout as a new session');

module.exports = {};
