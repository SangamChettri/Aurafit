const { validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
// const { checkAndAwardAchievements } = require('./achievementController');

const getWorkoutVolume = (workout) => {
  if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
    return workout.exercises.reduce((total, exercise) => (
      total + (exercise.sets || []).reduce((setTotal, set) => {
        const isCompleted = set.isCompleted !== undefined ? set.isCompleted !== false : true;

        if (!isCompleted || !set.weight || !set.reps) {
          return setTotal;
        }

        return setTotal + Number(set.weight) * Number(set.reps);
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

/**
 * @desc    Create a new workout session
 * @route   POST /api/workouts
 * @access  Private
 */
const createWorkout = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const { name, type, date, duration, notes, difficulty, exercises } = req.body;

  try {
    // Map frontend uppercase type to backend lowercase enum
    const normalizedType = type ? type.toLowerCase() : 'other';
    
    // Calculate total volume for the workout
    let calculatedVolume = 0;
    if (exercises && Array.isArray(exercises)) {
      exercises.forEach(exercise => {
        if (exercise.sets && Array.isArray(exercise.sets)) {
          exercise.sets.forEach(set => {
            const isCompleted = set.completed !== undefined ? set.completed !== false : true;
            if (isCompleted) {
              const weight = parseFloat(set.weight) || 0;
              const reps = parseInt(set.reps) || 0;
              calculatedVolume += (weight * reps);
            }
          });
        }
      });
    }

    // We'll use the consolidated Workout model
    const session = await prisma.workout.create({
      data: {
        userId: req.user.id,
        name: name || `Workout ${new Date().toLocaleDateString()}`,
        date: new Date(date || new Date()),
        endTime: duration ? new Date(new Date(date || new Date()).getTime() + duration * 60000) : null,
        duration: duration || 0,
        notes,
        totalVolume: calculatedVolume,
        exercises: exercises ? {
          create: exercises.map((exercise, index) => ({
            exerciseId: parseInt(exercise.exerciseId) || 1,
            exerciseName: exercise.exerciseName || exercise.exercise?.name || 'Exercise',
            order: index,
            sets: {
              create: exercise.sets ? exercise.sets.map((set, setIndex) => ({
                setNumber: setIndex + 1,
                weight: set.weight,
                reps: set.reps,
                restTime: set.restTime,
                isCompleted: set.completed !== undefined ? set.completed !== false : true
              })) : []
            }
          }))
        } : undefined
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    /* 
    // Check and award achievements automatically
    try {
      await checkAndAwardAchievements(req.user.id, 'workout_completed');
    } catch (e) {
      console.error('Error in achievement auto-trigger:', e);
    }
    */

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workout',
      errors: [{ field: 'general', message: error.message || 'Internal server error' }]
    });
  }
});

/**
 * @desc    Get all workouts for a user
 * @route   GET /api/workouts
 * @access  Private
 */
const getWorkouts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [sessions, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          exercises: {
            include: {
              sets: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.workout.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        workouts: sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workouts',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Get workout by ID
 * @route   GET /api/workouts/:id
 * @access  Private
 */
const getWorkoutById = asyncHandler(async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
        errors: [{ field: 'workout', message: 'Workout not found' }]
      });
    }

    res.json({
      success: true,
      data: { workout }
    });

  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Update workout
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
const updateWorkout = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const { name, type, date, duration, notes, difficulty, completed } = req.body;

  try {
    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    });

    if (!existingWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
        errors: [{ field: 'workout', message: 'Workout not found' }]
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (req.body.isPublic !== undefined) updateData.isPublic = req.body.isPublic;

    const workout = await prisma.workout.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: { workout }
    });

  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workout',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Delete workout
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
const deleteWorkout = asyncHandler(async (req, res) => {
  try {
    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    });

    if (!existingWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
        errors: [{ field: 'workout', message: 'Workout not found' }]
      });
    }

    await prisma.workout.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });

  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workout',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Get workout statistics
 * @route   GET /api/workouts/stats
 * @access  Private
 */
const getWorkoutStats = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const sessions = await prisma.workout.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate
        }
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      }
    });

    const stats = {
      totalWorkouts: sessions.length,
      totalDuration: sessions.reduce((sum, session) => sum + (session.duration || 0), 0),
      workoutsByType: {},
      averageDuration: 0,
      personalRecords: []
    };

    // Note: session title or template type could be used for 'type'
    // For now we'll count all as workouts
    sessions.forEach(session => {
      const type = 'strength'; // Default for now
      stats.workoutsByType[type] = (stats.workoutsByType[type] || 0) + 1;
    });

    if (stats.totalWorkouts > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / stats.totalWorkouts);
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout statistics',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Get volume history for charts
 * @route   GET /api/workouts/volume-history
 * @access  Private
 */
const getVolumeHistory = asyncHandler(async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        exercises: {
          include: {
            sets: true
          }
        }
      },
      orderBy: {
        date: 'asc',
      }
    });

    const history = workouts
      .map((workout) => ({
        date: workout.date,
        totalVolume: getWorkoutVolume(workout),
        name: workout.name
      }))
      .filter((workout) => workout.totalVolume > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get volume history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volume history',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
  getVolumeHistory,
};
