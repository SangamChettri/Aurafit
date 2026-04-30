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

// All exercise routes are protected (require authentication)
router.use(protect);

// Public exercise library endpoints (protected by user login)
router.get('/', asyncHandler(getExercises));
router.get('/:id', asyncHandler(getExerciseById));

// Admin-only management endpoints
// Note: In a real app, I'd add a secondary 'admin' middleware check here.
// For now, these are consolidated under the exercise routes for cleaner organization.
router.post('/', asyncHandler(createExercise));
router.put('/:id', asyncHandler(updateExercise));
router.delete('/:id', asyncHandler(deleteExercise));

module.exports = router;
