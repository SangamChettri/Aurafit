const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get water logs
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const logs = await prisma.waterLog.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Calculate daily totals
    const dailyTotals = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += log.amount;
    });

    res.json({
      success: true,
      data: {
        logs,
        dailyTotals
      }
    });
  } catch (error) {
    console.error('Get water logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch water logs',
      error: error.message
    });
  }
});

// Get today's water intake
router.get('/today', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const total = logs.reduce((sum, log) => sum + log.amount, 0);

    // Calculate recommended intake (simplified: 30ml per kg body weight)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { weight: true }
    });

    const recommended = user?.weight ? user.weight * 30 : 2000; // default 2L

    res.json({
      success: true,
      data: {
        total,
        recommended,
        percentage: (total / recommended) * 100,
        logs
      }
    });
  } catch (error) {
    console.error('Get today water error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s water intake',
      error: error.message
    });
  }
});

// Log water intake
router.post('/',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
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

      const { amount, date } = req.body;

      const log = await prisma.waterLog.create({
        data: {
          userId: req.user.id,
          amount: parseFloat(amount),
          date: date ? new Date(date) : new Date()
        }
      });

      res.status(201).json({
        success: true,
        message: 'Water intake logged successfully',
        data: log
      });
    } catch (error) {
      console.error('Log water error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log water intake',
        error: error.message
      });
    }
  }
);

// Delete water log
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const log = await prisma.waterLog.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Water log not found'
      });
    }

    await prisma.waterLog.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Water log deleted successfully'
    });
  } catch (error) {
    console.error('Delete water log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete water log',
      error: error.message
    });
  }
});

module.exports = router;
