const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding achievements...');

  const achievements = [
    {
      title: 'First Workout',
      description: 'Complete your first workout session',
      icon: 'fitness-center',
      category: 'workout',
      points: 10,
      criteria: { type: 'workout_completed', target: 1 }
    },
    {
      title: 'Workout Warrior',
      description: 'Complete 10 workout sessions',
      icon: 'local-fire-department',
      category: 'workout',
      points: 50,
      criteria: { type: 'workout_completed', target: 10 }
    },
    {
      title: 'Fitness Legend',
      description: 'Complete 100 workout sessions',
      icon: 'emoji-events',
      category: 'workout',
      points: 500,
      criteria: { type: 'workout_completed', target: 100 }
    },
    {
      title: 'Consistency King',
      description: 'Maintain a 7-day workout streak',
      icon: 'stars',
      category: 'streak',
      points: 100,
      criteria: { type: 'streak_milestone', target: 7 }
    },
    {
      title: 'Early Bird',
      description: 'Complete a workout before 8:00 AM',
      icon: 'wb-sunny',
      category: 'general',
      points: 20,
      criteria: { type: 'time_based', before: '08:00' }
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievements.indexOf(achievement) + 1 },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Achievements seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
