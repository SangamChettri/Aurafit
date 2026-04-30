const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const exercises = [
  // Chest
  { name: 'Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Dumbbell Press', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { name: 'Incline Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Decline Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Chest Flyes', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { name: 'Push-ups', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { name: 'Dips', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Parallel Bars' },
  
  // Back
  { name: 'Deadlifts', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Pull-ups', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Pull-up Bar' },
  { name: 'Lat Pulldowns', category: 'Cable', muscleGroup: 'Back', equipment: 'Cable Machine' },
  { name: 'Bent Over Rows', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Dumbbell Rows', category: 'Dumbbell', muscleGroup: 'Back', equipment: 'Dumbbells' },
  { name: 'T-Bar Rows', category: 'Barbell', muscleGroup: 'Back', equipment: 'T-Bar' },
  { name: 'Face Pulls', category: 'Cable', muscleGroup: 'Back', equipment: 'Cable Machine' },
  
  // Shoulders
  { name: 'Overhead Press', category: 'Barbell', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Lateral Raises', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Front Raises', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Reverse Pec Dec', category: 'Machine', muscleGroup: 'Shoulders', equipment: 'Machine' },
  { name: 'Shrugs', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  
  // Arms
  { name: 'Bicep Curls', category: 'Dumbbell', muscleGroup: 'Biceps', equipment: 'Dumbbells' },
  { name: 'Hammer Curls', category: 'Dumbbell', muscleGroup: 'Biceps', equipment: 'Dumbbells' },
  { name: 'Preacher Curls', category: 'Barbell', muscleGroup: 'Biceps', equipment: 'EZ Bar' },
  { name: 'Tricep Pushdowns', category: 'Cable', muscleGroup: 'Triceps', equipment: 'Cable Machine' },
  { name: 'Skull Crushers', category: 'Barbell', muscleGroup: 'Triceps', equipment: 'EZ Bar' },
  { name: 'Tricep Dips', category: 'Bodyweight', muscleGroup: 'Triceps', equipment: 'Bench' },
  { name: 'Concentration Curls', category: 'Dumbbell', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  
  // Legs
  { name: 'Squats', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
  { name: 'Leg Press', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Lunges', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbells' },
  { name: 'Leg Extensions', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Leg Curls', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Calf Raises', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
  { name: 'Bulgarian Split Squats', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbells' },
  { name: 'Romanian Deadlifts', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
  
  // Core
  { name: 'Plank', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { name: 'Crunches', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { name: 'Russian Twists', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { name: 'Leg Raises', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { name: 'Mountain Climbers', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
  
  // Cardio
  { name: 'Running', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
  { name: 'Cycling', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Stationary Bike' },
  { name: 'Rowing', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Rowing Machine' },
  { name: 'Jumping Jacks', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
  { name: 'Burpees', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bodyweight' }
];

async function seedExercises() {
  try {
    console.log('🌱 Starting to seed exercises...');
    
    // Get existing exercises to avoid duplicates
    const existingExercises = await prisma.exerciseLibrary.findMany({
      select: { name: true }
    });
    const existingNames = new Set(existingExercises.map(ex => ex.name));
    
    console.log(`� Found ${existingExercises.length} existing exercises`);
    
    // Insert only new exercises
    let addedCount = 0;
    for (const exercise of exercises) {
      if (!existingNames.has(exercise.name)) {
        await prisma.exerciseLibrary.create({
          data: {
            ...exercise,
            isCustom: false,
            isActive: true,
            instructions: `Perform ${exercise.name} with proper form and technique.`
          }
        });
        addedCount++;
        console.log(`➕ Added: ${exercise.name}`);
      } else {
        console.log(`⏭️  Skipped (already exists): ${exercise.name}`);
      }
    }
    
    console.log(`✅ Successfully added ${addedCount} new exercises`);
    console.log(`📊 Total exercises in library: ${existingExercises.length + addedCount}`);
    console.log('🎉 Exercise library is ready!');
    
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises();
