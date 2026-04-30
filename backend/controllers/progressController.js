const { validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create progress entry
 * @route   POST /api/progress
 * @access  Private
 */
const createProgress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const { date, weight, bodyFat, measurements, photos, notes } = req.body;

  try {
    const progress = await prisma.progress.create({
      data: {
        userId: req.user.id,
        date: new Date(date),
        weight,
        bodyFat,
        measurements,
        photos,
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: 'Progress entry created successfully',
      data: { progress }
    });

  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create progress entry',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

/**
 * @desc    Get progress entries
 * @route   GET /api/progress
 * @access  Private
 */
const getProgress = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [progress, total] = await Promise.all([
      prisma.progress.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.progress.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        progress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress entries',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

module.exports = {
  createProgress,
  getProgress,
};
