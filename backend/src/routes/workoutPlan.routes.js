const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate, requirePremium } = require('../middleware/auth.middleware');

const router = express.Router();

// Get workout plans
router.get('/', authenticate, async (req, res) => {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isAI: true, isActive: true }
        ]
      },
      include: {
        planDays: {
          orderBy: { dayNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plans',
      error: error.message
    });
  }
});

// Get single workout plan
router.get('/:id', authenticate, async (req, res) => {
  try {
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { isAI: true, isActive: true }
        ]
      },
      include: {
        planDays: {
          orderBy: { dayNumber: 'asc' }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plan',
      error: error.message
    });
  }
});

// Generate AI workout plan (Premium)
router.post('/generate',
  authenticate,
  requirePremium,
  [
    body('name').notEmpty().trim(),
    body('duration').isInt({ min: 1, max: 52 }),
    body('fitnessLevel').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
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

      const { name, duration, fitnessLevel, goalType } = req.body;

      // Placeholder AI workout plan generation
      // In production, this would use AI/ML algorithms
      const planDays = [];
      for (let i = 1; i <= duration * 7; i++) {
        const isRestDay = i % 7 === 0; // Rest day every 7 days
        planDays.push({
          dayNumber: i,
          isRestDay,
          exercises: isRestDay ? '[]' : JSON.stringify([
            { name: 'Push-ups', sets: 3, reps: 10 },
            { name: 'Squats', sets: 3, reps: 15 }
          ]),
          notes: isRestDay ? 'Rest day' : null
        });
      }

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: req.user.id,
          name,
          duration,
          isAI: true,
          planDays: {
            create: planDays
          }
        },
        include: {
          planDays: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Workout plan generated successfully',
        data: plan
      });
    } catch (error) {
      console.error('Generate workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate workout plan',
        error: error.message
      });
    }
  }
);

// Create custom workout plan
router.post('/',
  authenticate,
  [
    body('name').notEmpty().trim(),
    body('duration').isInt({ min: 1, max: 52 }),
    body('description').optional().trim()
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

      const { name, duration, description, planDays } = req.body;

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: req.user.id,
          name,
          duration,
          description,
          isAI: false,
          planDays: planDays ? {
            create: planDays.map(day => ({
              dayNumber: day.dayNumber,
              isRestDay: day.isRestDay || false,
              exercises: typeof day.exercises === 'string' ? day.exercises : JSON.stringify(day.exercises),
              notes: day.notes || null
            }))
          } : undefined
        },
        include: {
          planDays: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Workout plan created successfully',
        data: plan
      });
    } catch (error) {
      console.error('Create workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create workout plan',
        error: error.message
      });
    }
  }
);

module.exports = router;
