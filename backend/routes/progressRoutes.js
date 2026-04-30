const express = require('express');
const { query } = require('express-validator');
const {
  getProgressSummary,
  getWeeklyProgress,
  getMonthlyProgress,
  getVolumeTrend,
  getExerciseProgress,
  getMeasurements
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Validation rules
const progressQueryValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Period must be one of: week, month, quarter, year'),
  query('weeks')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Weeks must be between 1 and 52'),
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Months must be between 1 and 24'),
  query('exercise')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Exercise name cannot be empty if provided'),
  query('metric')
    .optional()
    .isIn(['weight', 'reps', 'volume', 'sets'])
    .withMessage('Metric must be one of: weight, reps, volume, sets')
];

// All routes are protected
router.use(protect);

// Progress overview routes
router.get('/summary', asyncHandler(getProgressSummary));
router.get('/weekly', progressQueryValidation, asyncHandler(getWeeklyProgress));
router.get('/monthly', progressQueryValidation, asyncHandler(getMonthlyProgress));
router.get('/volume-trend', progressQueryValidation, asyncHandler(getVolumeTrend));
router.get('/measurements', asyncHandler(getMeasurements));

// Exercise-specific progress
router.get('/exercise/:exerciseName', progressQueryValidation, asyncHandler(getExerciseProgress));

module.exports = router;
