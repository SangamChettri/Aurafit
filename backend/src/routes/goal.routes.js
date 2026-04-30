const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all goals
router.get('/', authenticate, async (req, res) => {
  try {
    const { isCompleted } = req.query;
    const where = { userId: req.user.id };

    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
});

// Get single goal
router.get('/:id', authenticate, async (req, res) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error.message
    });
  }
});

// Create goal
router.post('/',
  authenticate,
  [
    body('type').isIn(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'ENDURANCE', 'FLEXIBILITY']),
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('targetValue').optional().isFloat({ min: 0 }),
    body('unit').optional().trim(),
    body('targetDate').optional().isISO8601()
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

      const goal = await prisma.goal.create({
        data: {
          userId: req.user.id,
          ...req.body,
          targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal
      });
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create goal',
        error: error.message
      });
    }
  }
);

// Update goal
router.put('/:id',
  authenticate,
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('targetValue').optional().isFloat({ min: 0 }),
    body('currentValue').optional().isFloat({ min: 0 }),
    body('unit').optional().trim(),
    body('targetDate').optional().isISO8601()
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

      const goal = await prisma.goal.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      const updateData = {};
      const allowedFields = [
        'title', 'description', 'targetValue', 'currentValue',
        'unit', 'targetDate'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Check if goal should be marked as completed
      if (updateData.currentValue !== undefined && updateData.targetValue !== undefined) {
        if (updateData.currentValue >= updateData.targetValue && !goal.isCompleted) {
          updateData.isCompleted = true;
          updateData.completedAt = new Date();
        }
      }

      const updatedGoal = await prisma.goal.update({
        where: { id: req.params.id },
        data: updateData
      });

      res.json({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goal',
        error: error.message
      });
    }
  }
);

// Delete goal
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await prisma.goal.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
});

// Mark goal as completed
router.patch('/:id/complete', authenticate, async (req, res) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Goal marked as completed',
      data: updatedGoal
    });
  } catch (error) {
    console.error('Complete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete goal',
      error: error.message
    });
  }
});

module.exports = router;
