const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function init() {
  try {
    console.log('🚀 Initializing database with dummy data...');

    // 1. Create Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aurafit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    let admin;
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      admin = existingAdmin;
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          fitness_goal: 'general_fitness',
          activity_level: 'moderate',
          email_verified: true,
          is_active: true,
          is_premium: true,
          role: 'super_admin'
        }
      });
      console.log('✅ Admin user created:', admin.email);
      console.log('   Password:', adminPassword);
    }

    // 2. Seed Exercise Library if empty
    console.log('📚 Seeding exercise library...');
    const exerciseLibraryData = [
      { name: 'Push-ups', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'None' },
      { name: 'Squats', category: 'Bodyweight', muscleGroup: 'Legs', equipment: 'None' },
      { name: 'Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Bench, Barbell' },
      { name: 'Plank', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'None' },
      { name: 'Running', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
      { name: 'Burpees', category: 'Bodyweight', muscleGroup: 'FullBody', equipment: 'None' },
      { name: 'Mountain Climbers', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'None' },
      { name: 'Jump Squats', category: 'Bodyweight', muscleGroup: 'Legs', equipment: 'None' },
      { name: 'High Knees', category: 'Bodyweight', muscleGroup: 'Cardio', equipment: 'None' },
      { name: 'Sun Salutation', category: 'Yoga', muscleGroup: 'FullBody', equipment: 'Mat' },
      { name: 'Warrior Pose', category: 'Yoga', muscleGroup: 'Legs', equipment: 'Mat' },
      { name: 'Tree Pose', category: 'Yoga', muscleGroup: 'Core', equipment: 'Mat' },
      { name: 'Deadlifts', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
      { name: 'Box Jumps', category: 'Plyometrics', muscleGroup: 'Legs', equipment: 'Box' },
      { name: 'Kettlebell Swings', category: 'Kettlebell', muscleGroup: 'FullBody', equipment: 'Kettlebell' }
    ];

    for (const ex of exerciseLibraryData) {
      await prisma.exerciseLibrary.upsert({
        where: { id: exerciseLibraryData.indexOf(ex) + 1 }, // Simplistic for seeding
        update: {},
        create: {
          ...ex,
          isActive: true
        }
      });
    }

    // 3. Create Sample Workouts with Exercises
    const sampleWorkouts = [
      {
        name: 'Morning Strength Routine',
        type: 'strength',
        date: new Date('2026-03-19'),
        duration: 45,
        notes: 'Focus on compound movements',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12, weight: null, duration: null, restTime: 60 },
          { name: 'Squats', sets: 4, reps: 10, weight: 50.00, duration: null, restTime: 90 },
          { name: 'Bench Press', sets: 3, reps: 8, weight: 60.00, duration: null, restTime: 120 },
          { name: 'Plank', sets: 3, reps: null, weight: null, duration: 60, restTime: 30 }
        ]
      },
      {
        name: 'Cardio Blast',
        type: 'cardio',
        date: new Date('2026-03-18'),
        duration: 30,
        notes: 'High intensity cardio session',
        exercises: [
          { name: 'Running', sets: 1, reps: null, weight: null, duration: 1800, distance: 5.00, restTime: null }
        ]
      },
      {
        name: 'HIIT Challenge',
        type: 'hiit',
        date: new Date('2026-03-17'),
        duration: 25,
        notes: 'Full body HIIT workout',
        exercises: [
          { name: 'Burpees', sets: 4, reps: 15, weight: null, duration: null, restTime: 30 },
          { name: 'Mountain Climbers', sets: 4, reps: 20, weight: null, duration: null, restTime: 30 },
          { name: 'Jump Squats', sets: 4, reps: 12, weight: null, duration: null, restTime: 30 },
          { name: 'High Knees', sets: 4, reps: 30, weight: null, duration: null, restTime: 30 }
        ]
      },
      {
        name: 'Yoga Flow',
        type: 'yoga',
        date: new Date('2026-03-16'),
        duration: 60,
        notes: 'Relaxing yoga session',
        exercises: [
          { name: 'Sun Salutation', sets: 5, reps: null, weight: null, duration: 300, restTime: 30 },
          { name: 'Warrior Pose', sets: 3, reps: null, weight: null, duration: 120, restTime: 20 },
          { name: 'Tree Pose', sets: 3, reps: null, weight: null, duration: 90, restTime: 20 }
        ]
      },
      {
        name: 'CrossFit WOD',
        type: 'crossfit',
        date: new Date('2026-03-15'),
        duration: 40,
        notes: 'CrossFit workout of the day',
        exercises: [
          { name: 'Deadlifts', sets: 5, reps: 5, weight: 80.00, duration: null, restTime: 180 },
          { name: 'Box Jumps', sets: 4, reps: 10, weight: null, duration: null, restTime: 60 },
          { name: 'Kettlebell Swings', sets: 4, reps: 15, weight: 16.00, duration: null, restTime: 60 }
        ]
      }
    ];

    console.log('💪 Creating sample workouts and exercises...');
    let workoutCount = 0;

    const libraryExercises = await prisma.exerciseLibrary.findMany();

    for (const workoutData of sampleWorkouts) {
      const { exercises, type, ...workoutInfo } = workoutData;
      
      const existingWorkout = await prisma.workout.findFirst({
        where: {
          userId: admin.id,
          name: workoutInfo.name,
          date: workoutInfo.date
        }
      });

      if (!existingWorkout) {
        await prisma.workout.create({
          data: {
            userId: admin.id,
            ...workoutInfo,
            exercises: {
              create: exercises.map((ex, idx) => {
                const libEx = libraryExercises.find(l => l.name === ex.name);
                return {
                  exerciseId: libEx ? libEx.id : 1,
                  exerciseName: ex.name,
                  order: idx,
                  sets: {
                    create: Array.from({ length: ex.sets || 1 }).map((_, sIdx) => ({
                      setNumber: sIdx + 1,
                      weight: ex.weight,
                      reps: ex.reps,
                      duration: ex.duration,
                      distance: ex.distance,
                      restTime: ex.restTime,
                      isCompleted: true
                    }))
                  }
                };
              })
            }
          }
        });
        workoutCount++;
      }
    }
    console.log(`✅ Created ${workoutCount} sample workouts with exercises and sets`);

    // 3. Create Sample Progress Entries
    const sampleProgress = [
      { date: new Date('2026-03-19'), weight: 75.5, bodyFat: 18.2, measurements: { chest: 100, waist: 82, hips: 95 }, notes: 'Feeling strong today' },
      { date: new Date('2026-03-12'), weight: 76.0, bodyFat: 18.5, measurements: { chest: 99, waist: 83, hips: 96 }, notes: 'Good progress this week' },
      { date: new Date('2026-03-05'), weight: 76.8, bodyFat: 19.0, measurements: { chest: 98, waist: 84, hips: 97 }, notes: 'Starting the fitness journey' }
    ];

    console.log('📊 Creating sample progress entries...');
    let progressCount = 0;

    for (const progressData of sampleProgress) {
      const existingProgress = await prisma.progress.findFirst({
        where: {
          userId: admin.id,
          date: progressData.date
        }
      });

      if (!existingProgress) {
        await prisma.progress.create({
          data: {
            userId: admin.id,
            ...progressData
          }
        });
        progressCount++;
      }
    }
    console.log(`✅ Created ${progressCount} progress entries`);

    // 4. Create Streak Record
    const existingStreak = await prisma.streak.findUnique({
      where: { userId: admin.id }
    });

    if (!existingStreak) {
      await prisma.streak.create({
        data: {
          userId: admin.id,
          currentStreak: 5,
          longestStreak: 12,
          lastWorkoutDate: new Date('2026-03-19'),
          freezeDaysUsed: 0,
          freezeDaysAvailable: 3
        }
      });
      console.log('✅ Created streak record (5 day current streak)');
    } else {
      console.log('✅ Streak record already exists');
    }

    // 5. Create Personal Records
    const sampleRecords = [
      { exerciseName: 'Bench Press', weight: 80.00, reps: 5, date: new Date('2026-03-15') },
      { exerciseName: 'Squats', weight: 100.00, reps: 8, date: new Date('2026-03-10') },
      { exerciseName: 'Deadlifts', weight: 120.00, reps: 5, date: new Date('2026-03-08') },
      { exerciseName: 'Running', distance: 10.00, duration: 3000, date: new Date('2026-03-12') }
    ];

    console.log('🏆 Creating personal records...');
    let recordCount = 0;

    for (const record of sampleRecords) {
      const existingRecord = await prisma.personalRecord.findFirst({
        where: {
          userId: admin.id,
          exerciseName: record.exerciseName
        }
      });

      if (!existingRecord) {
        await prisma.personalRecord.create({
          data: {
            userId: admin.id,
            ...record
          }
        });
        recordCount++;
      }
    }
    console.log(`✅ Created ${recordCount} personal records`);

    // 6. Create User Settings
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: admin.id }
    });

    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          userId: admin.id,
          notificationsEnabled: true,
          dailyReminderTime: '08:00:00',
          weeklyReportDay: 'monday',
          units: 'metric',
          privacyLevel: 'private',
          achievementNotifications: true,
          streakNotifications: true,
          progressNotifications: true
        }
      });
      console.log('✅ Created user settings');
    } else {
      console.log('✅ User settings already exist');
    }

    // 7. Create Sample Notifications
    const sampleNotifications = [
      { type: 'welcome', title: 'Welcome to AuraFit!', message: 'Start your fitness journey today!', isRead: true },
      { type: 'streak', title: '5 Day Streak!', message: 'Keep up the great work!', isRead: false },
      { type: 'workout', title: 'Workout Reminder', message: 'Time for your scheduled workout!', isRead: false },
      { type: 'achievement', title: 'New Personal Record!', message: 'You beat your bench press record!', isRead: false }
    ];

    console.log('🔔 Creating sample notifications...');
    let notificationCount = 0;

    for (const notification of sampleNotifications) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: admin.id,
          title: notification.title
        }
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            ...notification
          }
        });
        notificationCount++;
      }
    }
    console.log(`✅ Created ${notificationCount} notifications`);

    console.log('\n✨ Database initialization complete!');
    console.log('\nAdmin Login Details:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

init();
