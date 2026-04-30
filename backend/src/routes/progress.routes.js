const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all progress entries
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const entries = await prisma.progressEntry.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get progress entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress entries',
      error: error.message
    });
  }
});

// Get single progress entry
router.get('/:id', authenticate, async (req, res) => {
  try {
    const entry = await prisma.progressEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get progress entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress entry',
      error: error.message
    });
  }
});

// Create progress entry
router.post('/',
  authenticate,
  [
    body('weight').optional().isFloat({ min: 0 }),
    body('bodyFat').optional().isFloat({ min: 0, max: 100 }),
    body('muscleMass').optional().isFloat({ min: 0 }),
    body('waist').optional().isFloat({ min: 0 }),
    body('chest').optional().isFloat({ min: 0 }),
    body('hips').optional().isFloat({ min: 0 }),
    body('arms').optional().isFloat({ min: 0 }),
    body('thighs').optional().isFloat({ min: 0 }),
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

      const entry = await prisma.progressEntry.create({
        data: {
          userId: req.user.id,
          ...req.body,
          date: req.body.date ? new Date(req.body.date) : new Date()
        }
      });

      res.status(201).json({
        success: true,
        message: 'Progress entry created successfully',
        data: entry
      });
    } catch (error) {
      console.error('Create progress entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create progress entry',
        error: error.message
      });
    }
  }
);

// Update progress entry
router.put('/:id',
  authenticate,
  [
    body('weight').optional().isFloat({ min: 0 }),
    body('bodyFat').optional().isFloat({ min: 0, max: 100 }),
    body('muscleMass').optional().isFloat({ min: 0 }),
    body('waist').optional().isFloat({ min: 0 }),
    body('chest').optional().isFloat({ min: 0 }),
    body('hips').optional().isFloat({ min: 0 }),
    body('arms').optional().isFloat({ min: 0 }),
    body('thighs').optional().isFloat({ min: 0 })
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

      const entry = await prisma.progressEntry.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Progress entry not found'
        });
      }

      const updateData = {};
      const allowedFields = [
        'weight', 'bodyFat', 'muscleMass', 'waist', 'chest',
        'hips', 'arms', 'thighs', 'notes'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedEntry = await prisma.progressEntry.update({
        where: { id: req.params.id },
        data: updateData
      });

      res.json({
        success: true,
        message: 'Progress entry updated successfully',
        data: updatedEntry
      });
    } catch (error) {
      console.error('Update progress entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress entry',
        error: error.message
      });
    }
  }
);

// Delete progress entry
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const entry = await prisma.progressEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    await prisma.progressEntry.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete progress entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete progress entry',
      error: error.message
    });
  }
});

// Get analytics (Premium feature)
router.get('/analytics/summary', authenticate, async (req, res) => {
  try {
    if (req.user.subscriptionStatus !== 'PREMIUM') {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required'
      });
    }

    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const entries = await prisma.progressEntry.findMany({
      where: {
        userId: req.user.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate trends
    const weightTrend = entries.length > 1
      ? entries[entries.length - 1].weight - entries[0].weight
      : 0;

    const latest = entries[entries.length - 1] || {};
    const earliest = entries[0] || {};

    res.json({
      success: true,
      data: {
        period,
        totalEntries: entries.length,
        latest,
        earliest,
        trends: {
          weight: weightTrend,
          bodyFat: latest.bodyFat && earliest.bodyFat
            ? latest.bodyFat - earliest.bodyFat
            : null,
          muscleMass: latest.muscleMass && earliest.muscleMass
            ? latest.muscleMass - earliest.muscleMass
            : null
        },
        entries
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

module.exports = router;
