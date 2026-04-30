const express = require('express');
const { 
  getExercises, 
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Public exercise library endpoints (no authentication required)
router.get('/', asyncHandler(getExercises));
router.get('/:id', asyncHandler(getExerciseById));

// Admin-only management endpoints (require authentication)
router.use(protect); // Apply auth middleware only to management routes
router.post('/', asyncHandler(createExercise));
router.put('/:id', asyncHandler(updateExercise));
router.delete('/:id', asyncHandler(deleteExercise));

module.exports = router;
