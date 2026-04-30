require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugWorkouts() {
  try {
    console.log('🔍 Debugging workout data...');
    
    // Check if there are any workouts
    const workouts = await prisma.workout.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${workouts.length} workouts:`);
    
    workouts.forEach((workout, index) => {
      console.log(`\n${index + 1}. Workout: ${workout.name} (ID: ${workout.id})`);
      console.log(`   Date: ${workout.date}`);
      console.log(`   Exercises: ${workout.exercises.length}`);
      
      workout.exercises.forEach((exercise, exIndex) => {
        console.log(`   ${exIndex + 1}. Exercise: ${exercise.exerciseName} (ExerciseLibrary ID: ${exercise.exerciseId})`);
        console.log(`      Sets: ${exercise.sets.length}`);
        
        exercise.sets.forEach((set, setIndex) => {
          console.log(`      ${setIndex + 1}. Set ${set.setNumber}: ${set.reps} reps @ ${set.weight} (Completed: ${set.isCompleted})`);
        });
      });
    });
    
    // Check specific exercise IDs
    console.log('\n🔍 Checking specific exercise IDs...');
    const exercise1Workouts = await prisma.workout.findMany({
      where: {
        exercises: {
          some: {
            exerciseId: 1
          }
        }
      },
      include: {
        exercises: {
          where: {
            exerciseId: 1
          }
        }
      }
    });
    
    console.log(`📊 Workouts with exercise ID 1: ${exercise1Workouts.length}`);
    
    const exercise3Workouts = await prisma.workout.findMany({
      where: {
        exercises: {
          some: {
            exerciseId: 3
          }
        }
      },
      include: {
        exercises: {
          where: {
            exerciseId: 3
          }
        }
      }
    });
    
    console.log(`📊 Workouts with exercise ID 3: ${exercise3Workouts.length}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWorkouts();
