const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get wearable syncs
router.get('/syncs', authenticate, async (req, res) => {
  try {
    const syncs = await prisma.wearableSync.findMany({
      where: { userId: req.user.id },
      orderBy: { syncedAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: syncs
    });
  } catch (error) {
    console.error('Get syncs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch syncs',
      error: error.message
    });
  }
});

// Get last sync
router.get('/last-sync', authenticate, async (req, res) => {
  try {
    const lastSync = await prisma.wearableSync.findFirst({
      where: { userId: req.user.id },
      orderBy: { syncedAt: 'desc' }
    });

    res.json({
      success: true,
      data: lastSync || null
    });
  } catch (error) {
    console.error('Get last sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch last sync',
      error: error.message
    });
  }
});

// Connect wearable (Placeholder)
router.post('/connect',
  authenticate,
  [
    body('deviceType').isIn(['apple', 'fitbit', 'garmin']),
    body('accessToken').optional().trim()
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

      // Placeholder: In production, this would integrate with actual wearable APIs
      res.json({
        success: true,
        message: 'Wearable connection initiated (placeholder)',
        data: {
          deviceType: req.body.deviceType,
          status: 'connected',
          connectedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Connect wearable error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to connect wearable',
        error: error.message
      });
    }
  }
);

// Sync wearable data (Placeholder)
router.post('/sync',
  authenticate,
  [
    body('deviceType').isIn(['apple', 'fitbit', 'garmin']),
    body('steps').optional().isInt({ min: 0 }),
    body('heartRate').optional().isInt({ min: 0 }),
    body('calories').optional().isFloat({ min: 0 }),
    body('distance').optional().isFloat({ min: 0 }),
    body('sleepHours').optional().isFloat({ min: 0, max: 24 })
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

      // Placeholder: In production, this would fetch from actual wearable APIs
      const sync = await prisma.wearableSync.create({
        data: {
          userId: req.user.id,
          deviceType: req.body.deviceType,
          steps: req.body.steps || null,
          heartRate: req.body.heartRate || null,
          calories: req.body.calories || null,
          distance: req.body.distance || null,
          sleepHours: req.body.sleepHours || null,
          syncedAt: new Date()
        }
      });

      res.status(201).json({
        success: true,
        message: 'Wearable data synced (placeholder)',
        data: sync
      });
    } catch (error) {
      console.error('Sync wearable error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync wearable data',
        error: error.message
      });
    }
  }
);

module.exports = router;
