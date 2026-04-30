const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get user profile and stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      fitness_goal: true,
      height: true,
      weight: true,
      age: true,
      gender: true,
      activity_level: true,
      createdAt: true,
      is_premium: true,
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get most recent stats
  const [lastMeasurement, workoutStats, achievements] = await Promise.all([
    prisma.bodyMeasurement.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    }),
    prisma.workoutSession.aggregate({
      where: { userId: req.user.id },
      _count: { id: true },
      _sum: { duration: true, caloriesBurned: true }
    }),
    prisma.userAchievement.count({
      where: { userId: req.user.id }
    })
  ]);

  res.json({
    success: true,
    data: {
      user,
      lastMeasurement,
      stats: {
        totalWorkouts: workoutStats._count.id || 0,
        totalHours: Math.round((workoutStats._sum.duration || 0) / 60),
        totalCalories: workoutStats._sum.caloriesBurned || 0,
        achievementCount: achievements
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, age, gender, fitness_goal, activity_level } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name,
      age: parseInt(age),
      gender,
      fitness_goal,
      activity_level
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Get body measurements
 * @route   GET /api/users/measurements
 * @access  Private
 */
const getMeasurements = asyncHandler(async (req, res) => {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' },
    take: 20
  });

  res.json({
    success: true,
    data: { measurements }
  });
});

/**
 * @desc    Add body measurement
 * @route   POST /api/users/measurements
 * @access  Private
 */
const addMeasurement = asyncHandler(async (req, res) => {
  const { weight, height, bodyFat, muscleMass, chest, waist, hips, arms, thighs, notes } = req.body;

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: req.user.id,
      date: new Date(),
      weight,
      height,
      bodyFat,
      muscleMass,
      chest,
      waist,
      hips,
      arms,
      thighs,
      notes
    }
  });

  // Also update user's primary weight/height
  if (weight || height) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(weight && { weight }),
        ...(height && { height })
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Measurement added successfully',
    data: { measurement }
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getMeasurements,
  addMeasurement
};
