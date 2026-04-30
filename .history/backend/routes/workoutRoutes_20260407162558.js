const express = require('express');
const { body, query } = require('express-validator');
const { prisma } = require('../config/prisma');
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
  getPersonalBests,
  duplicateWorkout
} = require('../controllers/workoutController');
const { protect, verifyOwnership } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Validation rules
const createWorkoutValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workout name is required')
    .isLength({ max: 100 })
    .withMessage('Workout name cannot exceed 100 characters'),
  body('type')
    .optional()
    .custom((value) => {
      const allowed = ['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'sports', 'other'];
      if (value && !allowed.includes(value.toLowerCase())) {
        throw new Error('Type must be one of: strength, cardio, hiit, yoga, pilates, crossfit, sports, other');
      }
      return true;
    }),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('exercises')
    .optional()
    .isArray()
    .withMessage('Exercises must be an array'),
  body('exercises.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Exercise name is required'),
  body('exercises.*.sets')
    .optional()
    .isArray()
    .withMessage('Sets must be an array'),
  body('exercises.*.sets.*.reps')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reps must be a non-negative integer'),
  body('exercises.*.sets.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  body('duration')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('Duration must be between 0 and 480 minutes'),
  body('calories')
    .optional()
    .isInt({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateWorkoutValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Workout name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Workout name cannot exceed 100 characters'),
  body('type')
    .optional()
    .isIn(['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'sports', 'other'])
    .withMessage('Type must be one of: strength, cardio, hiit, yoga, pilates, crossfit, sports, other'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('exercises')
    .optional()
    .isArray()
    .withMessage('Exercises must be an array'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('calories')
    .optional()
    .isInt({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const getWorkoutsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('type')
    .optional()
    .isIn(['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'sports', 'other'])
    .withMessage('Type must be one of: strength, cardio, hiit, yoga, pilates, crossfit, sports, other'),
  query('sortBy')
    .optional()
    .isIn(['date', 'name', 'totalVolume', 'duration'])
    .withMessage('Sort by must be one of: date, name, totalVolume, duration'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// All routes are protected
router.use(protect);

// Workout CRUD routes
router.post('/', createWorkoutValidation, asyncHandler(createWorkout));
router.get('/', getWorkoutsValidation, asyncHandler(getWorkouts));
router.get('/stats', asyncHandler(getWorkoutStats));
router.get('/personal-bests', asyncHandler(getPersonalBests));

// Get previous workout data for a specific exercise (must be before /:id)
router.get('/exercise/:exerciseId/previous', async (req, res) => {
  try {
    console.log('🚀 ROUTE HIT!');
    const { exerciseId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Looking for previous workout data - ExerciseID: ${exerciseId}, UserID: ${userId}`);

    // Find the most recent workout that contains this exercise
    const mostRecentWorkout = await prisma.workout.findFirst({
      where: {
        userId: userId,
        exercises: {
          some: {
            exerciseId: parseInt(exerciseId)
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        exercises: {
          where: {
            exerciseId: parseInt(exerciseId)
          },
          include: {
            sets: {
              orderBy: {
                setNumber: 'asc'
              }
            }
          }
        }
      }
    });

    console.log(`📊 Found workout: ${mostRecentWorkout ? 'YES' : 'NO'}`);

    if (!mostRecentWorkout || !mostRecentWorkout.exercises.length) {
      console.log('📊 No previous workout data found');
      return res.json({
        success: true,
        data: null
      });
    }

    // Get the exercise data from the most recent workout
    const exerciseData = mostRecentWorkout.exercises[0];
    console.log(`🏋️ Exercise data: ${exerciseData.exerciseName}, Sets: ${exerciseData.sets.length}`);
    
    // Calculate average reps and weight from the last workout
    const sets = exerciseData.sets;
    const completedSets = sets.filter(set => set.isCompleted);
    console.log(`✅ Completed sets: ${completedSets.length}`);
    
    if (completedSets.length === 0) {
      console.log('📊 No completed sets found');
      return res.json({
        success: true,
        data: null
      });
    }

    const avgReps = Math.round(completedSets.reduce((sum, set) => sum + (set.reps || 0), 0) / completedSets.length);
    const avgWeight = Math.round(Number(completedSets.reduce((sum, set) => sum + (set.weight || 0), 0)) / completedSets.length);

    console.log(`📈 Averages - Reps: ${avgReps}, Weight: ${avgWeight}`);

    res.json({
      success: true,
      data: {
        reps: avgReps,
        weight: avgWeight,
        workoutDate: mostRecentWorkout.date,
        totalSets: completedSets.length
      }
    });

  } catch (error) {
    console.error('❌ Get previous workout data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch previous workout data'
    });
  }
});

// Individual workout routes
router.get('/:id', asyncHandler(getWorkoutById));
router.put('/:id', updateWorkoutValidation, asyncHandler(updateWorkout));
router.delete('/:id', asyncHandler(deleteWorkout));
router.post('/:id/duplicate', asyncHandler(duplicateWorkout));

module.exports = router;
