const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getNameParts = (name = '') => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
};

const calculateWorkoutVolume = (workout) => {
  if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
    return workout.exercises.reduce((total, exercise) => (
      total + (exercise.sets || []).reduce((setTotal, set) => {
        const weight = Number(set.weight);
        const reps = Number(set.reps);

        if (
          set.weight === null ||
          set.weight === undefined ||
          !Number.isFinite(weight) ||
          weight <= 0 ||
          !Number.isFinite(reps) ||
          reps <= 0
        ) {
          return setTotal;
        }

        return setTotal + weight * reps;
      }, 0)
    ), 0);
  }

  if (
    workout.totalVolume !== null &&
    workout.totalVolume !== undefined &&
    Number(workout.totalVolume) > 0
  ) {
    return Number(workout.totalVolume);
  }

  return 0;
};

const getMonthDateRange = (monthParam, yearParam) => {
  const now = new Date();
  const parsedMonth = Number.parseInt(monthParam, 10);
  const parsedYear = Number.parseInt(yearParam, 10);

  const month = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
    ? parsedMonth
    : now.getMonth() + 1;
  const year = Number.isInteger(parsedYear) && parsedYear >= 1970
    ? parsedYear
    : now.getFullYear();

  const startOfMonth = new Date(year, month - 1, 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(year, month, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
};

const calculateStreaks = (workoutDays) => {
  if (!workoutDays.length) {
    return { current: 0, best: 0 };
  }

  const uniqueDates = workoutDays
    .map((day) => day.date)
    .sort((a, b) => b.localeCompare(a));

  let best = 0;
  let running = 0;
  let previousDate = null;

  uniqueDates.forEach((dateKey) => {
    const currentDate = new Date(`${dateKey}T00:00:00.000Z`);

    if (!previousDate) {
      running = 1;
    } else {
      const diffInDays = Math.round((previousDate.getTime() - currentDate.getTime()) / 86400000);
      running = diffInDays === 1 ? running + 1 : 1;
    }

    best = Math.max(best, running);
    previousDate = currentDate;
  });

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  let current = 0;
  if (uniqueDates[0] === todayKey || uniqueDates[0] === yesterdayKey) {
    current = 1;
    let checkDate = new Date(`${uniqueDates[0]}T00:00:00.000Z`);

    for (let index = 1; index < uniqueDates.length; index += 1) {
      checkDate.setDate(checkDate.getDate() - 1);
      const expectedDate = checkDate.toISOString().split('T')[0];

      if (uniqueDates[index] !== expectedDate) {
        break;
      }

      current += 1;
    }
  }

  return { current, best };
};

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

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { startOfMonth, endOfMonth } = getMonthDateRange(req.query.month, req.query.year);

  const [lastMeasurement, workoutStats, achievements, allWorkouts, workoutsWithSets, weeklyWorkouts, monthlyWorkouts] = await Promise.all([
    prisma.bodyMeasurement.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    }),
    prisma.workout.aggregate({
      where: { userId: req.user.id },
      _count: { id: true }
    }),
    prisma.userAchievement.count({
      where: { userId: req.user.id }
    }),
    prisma.workout.findMany({
      where: { userId: req.user.id },
      select: {
        date: true,
        duration: true,
      },
      orderBy: { date: 'desc' }
    }),
    prisma.workout.findMany({
      where: { userId: req.user.id },
      select: {
        totalVolume: true,
        exercises: {
          select: {
            sets: {
              select: {
                weight: true,
                reps: true,
                isCompleted: true,
              }
            }
          }
        }
      }
    }),
    prisma.workout.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      select: {
        date: true,
        duration: true,
        totalVolume: true,
        exercises: {
          select: {
            sets: {
              select: {
                weight: true,
                reps: true,
                isCompleted: true,
              }
            }
          }
        }
      }
    }),
    prisma.workout.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        totalVolume: true,
        exercises: {
          select: {
            sets: {
              select: {
                weight: true,
                reps: true,
                isCompleted: true,
              }
            }
          }
        }
      }
    })
  ]);

  const workoutDayMap = new Map();
  allWorkouts.forEach((workout) => {
    const dateKey = workout.date.toISOString().split('T')[0];
    const existing = workoutDayMap.get(dateKey);

    if (existing) {
      existing.workoutCount += 1;
      existing.totalDuration += workout.duration || 0;
      return;
    }

    workoutDayMap.set(dateKey, {
      date: dateKey,
      workoutCount: 1,
      totalDuration: workout.duration || 0,
    });
  });

  const workoutDays = Array.from(workoutDayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const computedTotalVolume = workoutsWithSets.reduce((sum, workout) => sum + calculateWorkoutVolume(workout), 0);
  const monthlyTotalVolume = monthlyWorkouts.reduce((sum, workout) => sum + calculateWorkoutVolume(workout), 0);
  const roundedMonthlyVolumeKg = Math.round(monthlyTotalVolume * 10) / 10;
  const weeklyWeightData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayLabel, index) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + index);
    const currentDateKey = currentDate.toISOString().split('T')[0];

    const totalWeight = weeklyWorkouts.reduce((sum, workout) => {
      const workoutDateKey = workout.date.toISOString().split('T')[0];
      if (workoutDateKey !== currentDateKey) {
        return sum;
      }

      return sum + calculateWorkoutVolume(workout);
    }, 0);

    return {
      day: dayLabel,
      totalWeight: Math.round(totalWeight * 100) / 100,
    };
  });

  const streak = calculateStreaks(workoutDays);
  const { firstName, lastName } = getNameParts(user.name);

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        firstName,
        lastName,
      },
      lastMeasurement,
      stats: {
        totalWorkouts: workoutStats._count.id || 0,
        totalVolume: Math.round(computedTotalVolume * 100) / 100,
        workoutsCount: monthlyWorkouts.length,
        totalVolumeKg: roundedMonthlyVolumeKg,
        monthlyVolumeKg: roundedMonthlyVolumeKg,
        achievementCount: achievements,
        currentStreak: streak.current,
        personalBestStreak: streak.best,
      },
      workoutDays,
      weeklyWeightData,
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
