const express = require('express');
const { body, query } = require('express-validator');
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
  body('exercises.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Exercise name is required'),
  body('exercises.*.sets')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Sets must be between 1 and 50'),
  body('exercises.*.reps')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Reps must be between 1 and 200'),
  body('exercises.*.weight')
    .optional()
    .isFloat({ min: 0, max: 2000 })
    .withMessage('Weight must be between 0 and 2000'),
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
    .isIn(['STRENGTH', 'CARDIO', 'MIXED', 'HIIT', 'YOGA'])
    .withMessage('Type must be one of: STRENGTH, CARDIO, MIXED, HIIT, YOGA'),
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

// Individual workout routes
router.get('/:id', asyncHandler(getWorkoutById));
router.put('/:id', updateWorkoutValidation, asyncHandler(updateWorkout));
router.delete('/:id', asyncHandler(deleteWorkout));
router.post('/:id/duplicate', asyncHandler(duplicateWorkout));

module.exports = router;
