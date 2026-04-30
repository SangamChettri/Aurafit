const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExercises() {
  try {
    console.log('🔍 Checking exercise library...');
    
    const exercises = await prisma.exerciseLibrary.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        muscleGroup: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${exercises.length} exercises in library:`);
    
    if (exercises.length === 0) {
      console.log('⚠️  No exercises found in ExerciseLibrary!');
    } else {
      exercises.slice(0, 10).forEach((exercise, index) => {
        console.log(`${index + 1}. ${exercise.name} (${exercise.category} - ${exercise.muscleGroup})`);
      });
      
      if (exercises.length > 10) {
        console.log(`... and ${exercises.length - 10} more exercises`);
      }
    }

    // Check active vs inactive
    const activeCount = exercises.filter(ex => ex.isActive).length;
    const inactiveCount = exercises.filter(ex => !ex.isActive).length;
    
    console.log(`📈 Active exercises: ${activeCount}`);
    console.log(`📈 Inactive exercises: ${inactiveCount}`);

  } catch (error) {
    console.error('❌ Error checking exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExercises();
