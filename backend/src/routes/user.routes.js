const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

const getNameParts = (name = '') => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
};

const groupWorkoutDays = (workouts) => {
  const grouped = new Map();

  workouts.forEach((workout) => {
    const dateKey = workout.date.toISOString().split('T')[0];
    const existing = grouped.get(dateKey);

    if (existing) {
      existing.workoutCount += 1;
      existing.totalDuration += workout.duration || 0;
      return;
    }

    grouped.set(dateKey, {
      date: dateKey,
      workoutCount: 1,
      totalDuration: workout.duration || 0,
    });
  });

  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
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

  uniqueDates.forEach((dateString) => {
    const currentDate = new Date(`${dateString}T00:00:00.000Z`);

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

const calculateWorkoutVolume = (workout) => {
  if (workout.totalVolume !== null && workout.totalVolume !== undefined) {
    return Number(workout.totalVolume);
  }

  return workout.exercises.reduce((total, exercise) => (
    total + exercise.sets.reduce((setTotal, set) => {
      if (!set.weight || !set.reps) {
        return setTotal;
      }

      return setTotal + Number(set.weight) * Number(set.reps);
    }, 0)
  ), 0);
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [user, allWorkouts, weeklyWorkouts, lastMeasurement] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          age: true,
          gender: true,
          height: true,
          weight: true,
          fitness_goal: true,
          activity_level: true,
          is_premium: true,
          premium_expires: true,
          createdAt: true,
          updatedAt: true,
        }
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
        where: {
          userId: req.user.id,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        },
        select: {
          date: true,
          totalVolume: true,
          duration: true,
          exercises: {
            select: {
              sets: {
                select: {
                  weight: true,
                  reps: true,
                }
              }
            }
          }
        }
      }),
      prisma.bodyMeasurement.findFirst({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' }
      })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const workoutDays = groupWorkoutDays(allWorkouts);
    const streak = calculateStreaks(workoutDays);

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

    const totalMinutes = allWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const { firstName, lastName } = getNameParts(user.name);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          firstName,
          lastName,
        },
        stats: {
          totalWorkouts: allWorkouts.length,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
          currentStreak: streak.current,
          personalBestStreak: streak.best,
        },
        lastMeasurement,
        workoutDays,
        weeklyWeightData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 1 }),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('age').optional().isInt({ min: 1, max: 150 }),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('height').optional().isFloat({ min: 0 }),
    body('weight').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const updateData = {};

      if (req.body.name !== undefined) {
        updateData.name = req.body.name.trim();
      } else if (req.body.firstName !== undefined || req.body.lastName !== undefined) {
        const firstName = (req.body.firstName || '').trim();
        const lastName = (req.body.lastName || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          updateData.name = fullName;
        }
      }

      ['age', 'gender', 'height', 'weight'].forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const user = await prisma.user.update({
        where: {
          id: req.user.id
        },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          age: true,
          gender: true,
          height: true,
          weight: true,
          is_premium: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const { firstName, lastName } = getNameParts(user.name);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...user,
          firstName,
          lastName,
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
);

// Upload profile image
router.post('/profile/image',
  authenticate,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: imageUrl },
        select: {
          id: true,
          avatar: true
        }
      });

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: user
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  }
);

module.exports = router;
