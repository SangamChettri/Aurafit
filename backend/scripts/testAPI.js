require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🔍 Testing ExerciseLibrary API query...');
    
    // Test the same query that the admin endpoint uses
    const { page = 1, limit = 20, category, muscleGroup, isCustom } = {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    // if (category) where.category = category;
    // if (muscleGroup) where.muscleGroup = muscleGroup;
    // if (isCustom !== undefined) where.isCustom = isCustom === 'true';

    const [exercises, total] = await Promise.all([
      prisma.exerciseLibrary.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take
      }),
      prisma.exerciseLibrary.count({ where })
    ]);

    console.log(`✅ Found ${exercises.length} exercises (total: ${total})`);
    
    const response = {
      success: true,
      data: {
        exercises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / take)
        }
      }
    };

    console.log('📦 API Response structure:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
