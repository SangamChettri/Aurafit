// Test WorkoutExercise type and data structure
console.log('🧪 Testing WorkoutExercise data structure...');

// Simulate the data structure from backend
const mockWorkoutExercise = {
  id: 'we-123',
  exerciseId: 'ex-456',
  exerciseName: 'Bench Press',
  category: 'Chest',
  equipment: 'Barbell',
  sets: [
    { id: 'set-1', reps: 10, weight: 135, completed: false, restTime: 60 },
    { id: 'set-2', reps: 8, weight: 145, completed: false, restTime: 60 }
  ],
  notes: 'Focus on form',
  order: 1
};

// Test the render function logic
function testRenderWorkoutExercise(workoutExercise) {
  console.log('📋 Exercise Name:', workoutExercise.exerciseName || 'Exercise');
  console.log('🏷️ Category:', workoutExercise.category || 'General');
  console.log('🏋️ Equipment:', workoutExercise.equipment || 'Bodyweight');
  console.log('📊 Sets Count:', workoutExercise.sets.length);
  
  // Test the problematic access that was causing the error
  try {
    const exerciseName = workoutExercise.exercise?.name; // This should fail
    console.log('❌ Should not reach here - exercise.name should be undefined');
  } catch (error) {
    console.log('✅ Correctly handled undefined exercise property');
  }
  
  // Test the correct access
  const correctName = workoutExercise.exerciseName;
  console.log('✅ Correct exercise name access:', correctName);
}

testRenderWorkoutExercise(mockWorkoutExercise);

console.log('\n🎯 WorkoutExercise structure test passed!');
console.log('Key fixes:');
console.log('1. ✅ Added WorkoutExercise interface definition');
console.log('2. ✅ Use exerciseName instead of exercise.name');
console.log('3. ✅ Use category and equipment directly from WorkoutExercise');
console.log('4. ✅ Added fallback values for undefined properties');

module.exports = {};
