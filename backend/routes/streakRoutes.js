const express = require('express');
const { query } = require('express-validator');
const {
  getStreak,
  getStreakHistory,
  useFreezeDay,
  getStreakLeaderboard,
  getStreakStats,
  recalculateStreak
} = require('../controllers/streakController');
const { protect, requirePremium, optionalAuth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Validation rules
const streakQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['current', 'longest'])
    .withMessage('Type must be either "current" or "longest"')
];

// Protected routes
router.use(protect);

// User streak routes
router.get('/', asyncHandler(getStreak));
router.get('/history', streakQueryValidation, asyncHandler(getStreakHistory));
router.post('/freeze', requirePremium, asyncHandler(useFreezeDay));
router.post('/recalculate', asyncHandler(recalculateStreak));

// Public routes (with optional auth for user rank)
router.get('/leaderboard', optionalAuth, streakQueryValidation, asyncHandler(getStreakLeaderboard));
router.get('/stats', asyncHandler(getStreakStats));

module.exports = router;
