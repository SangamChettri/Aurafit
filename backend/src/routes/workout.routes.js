const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all workouts for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type) {
      where.type = type;
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        sets: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        },
        cardioSessions: true
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workouts',
      error: error.message
    });
  }
});

// Get single workout
router.get('/:id', authenticate, async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        sets: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        },
        cardioSessions: true
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout',
      error: error.message
    });
  }
});

// Create workout
router.post('/',
  authenticate,
  [
    body('name').optional().trim(),
    body('type').isIn(['STRENGTH', 'CARDIO', 'MIXED', 'HIIT', 'YOGA']),
    body('duration').optional().isInt({ min: 0 }),
    body('calories').optional().isFloat({ min: 0 }),
    body('notes').optional().trim(),
    body('date').optional().isISO8601()
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

      const { name, type, duration, calories, notes, date, sets, cardioSessions } = req.body;

      const workout = await prisma.workout.create({
        data: {
          userId: req.user.id,
          name,
          type,
          duration,
          calories,
          notes,
          date: date ? new Date(date) : new Date(),
          sets: sets ? {
            create: sets.map((set, index) => ({
              exerciseId: set.exerciseId,
              sets: set.sets,
              reps: set.reps,
              weight: set.weight,
              duration: set.duration,
              restTime: set.restTime,
              notes: set.notes,
              order: index
            }))
          } : undefined,
          cardioSessions: cardioSessions ? {
            create: cardioSessions
          } : undefined
        },
        include: {
          sets: {
            include: {
              exercise: true
            }
          },
          cardioSessions: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Workout created successfully',
        data: workout
      });
    } catch (error) {
      console.error('Create workout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create workout',
        error: error.message
      });
    }
  }
);

// Update workout
router.put('/:id',
  authenticate,
  [
    body('name').optional().trim(),
    body('type').optional().isIn(['STRENGTH', 'CARDIO', 'MIXED', 'HIIT', 'YOGA']),
    body('duration').optional().isInt({ min: 0 }),
    body('calories').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
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

      const workout = await prisma.workout.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      const updateData = {};
      const allowedFields = ['name', 'type', 'duration', 'calories', 'notes'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedWorkout = await prisma.workout.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          sets: {
            include: {
              exercise: true
            }
          },
          cardioSessions: true
        }
      });

      res.json({
        success: true,
        message: 'Workout updated successfully',
        data: updatedWorkout
      });
    } catch (error) {
      console.error('Update workout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update workout',
        error: error.message
      });
    }
  }
);

// Delete workout
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await prisma.workout.delete({
      where: { id: req.params.id }
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
      error: error.message
    });
  }
});

// Add set to workout
router.post('/:id/sets',
  authenticate,
  [
    body('exerciseId').notEmpty(),
    body('sets').isInt({ min: 1 }),
    body('reps').optional().isInt({ min: 1 }),
    body('weight').optional().isFloat({ min: 0 }),
    body('duration').optional().isInt({ min: 0 }),
    body('restTime').optional().isInt({ min: 0 })
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

      const workout = await prisma.workout.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      const { exerciseId, sets, reps, weight, duration, restTime, notes, order } = req.body;

      const workoutSet = await prisma.workoutSet.create({
        data: {
          workoutId: req.params.id,
          exerciseId,
          sets,
          reps,
          weight,
          duration,
          restTime,
          notes,
          order: order || 0
        },
        include: {
          exercise: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Set added successfully',
        data: workoutSet
      });
    } catch (error) {
      console.error('Add set error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add set',
        error: error.message
      });
    }
  }
);

// Add cardio session
router.post('/:id/cardio',
  authenticate,
  [
    body('type').notEmpty().trim(),
    body('duration').isInt({ min: 1 }),
    body('distance').optional().isFloat({ min: 0 }),
    body('calories').optional().isFloat({ min: 0 })
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

      const workout = await prisma.workout.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      const { type, duration, distance, calories, avgHeartRate, maxHeartRate, pace, notes } = req.body;

      const cardioSession = await prisma.cardioSession.create({
        data: {
          workoutId: req.params.id,
          type,
          duration,
          distance,
          calories,
          avgHeartRate,
          maxHeartRate,
          pace,
          notes
        }
      });

      res.status(201).json({
        success: true,
        message: 'Cardio session added successfully',
        data: cardioSession
      });
    } catch (error) {
      console.error('Add cardio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add cardio session',
        error: error.message
      });
    }
  }
);

module.exports = router;
