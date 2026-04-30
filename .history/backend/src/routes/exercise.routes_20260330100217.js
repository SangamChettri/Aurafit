const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const { category, muscleGroup, equipment, search } = req.query;
    const where = { isActive: true };

    if (category) where.category = category;
    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (equipment) where.equipment = equipment;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message
    });
  }
});

// Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      error: error.message
    });
  }
});

// Create exercise (Admin/Coach only)
router.post('/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'COACH'),
  [
    body('name').notEmpty().trim(),
    body('category').isIn(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'SPORTS']),
    body('muscleGroup').optional().trim(),
    body('equipment').optional().trim(),
    body('difficulty').optional().trim(),
    body('description').optional().trim(),
    body('instructions').optional().trim()
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

      const exercise = await prisma.exercise.create({
        data: req.body
      });

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        data: exercise
      });
    } catch (error) {
      console.error('Create exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create exercise',
        error: error.message
      });
    }
  }
);

// Update exercise (Admin/Coach only)
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'COACH'),
  async (req, res) => {
    try {
      const exercise = await prisma.exercise.findUnique({
        where: { id: req.params.id }
      });

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      const updateData = {};
      const allowedFields = [
        'name', 'category', 'muscleGroup', 'equipment', 'difficulty',
        'description', 'instructions', 'imageUrl', 'videoUrl', 'isActive'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedExercise = await prisma.exercise.update({
        where: { id: req.params.id },
        data: updateData
      });

      res.json({
        success: true,
        message: 'Exercise updated successfully',
        data: updatedExercise
      });
    } catch (error) {
      console.error('Update exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update exercise',
        error: error.message
      });
    }
  }
);

// Delete exercise (Admin only)
router.delete('/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const exercise = await prisma.exercise.findUnique({
        where: { id: req.params.id }
      });

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      await prisma.exercise.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      console.error('Delete exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete exercise',
        error: error.message
      });
    }
  }
);

module.exports = router;
