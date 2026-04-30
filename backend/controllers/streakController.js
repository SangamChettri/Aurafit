const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get user streak
 * @route   GET /api/streaks
 * @access  Private
 */
const getStreak = asyncHandler(async (req, res) => {
  try {
    let streak = await prisma.streak.findUnique({
      where: { userId: req.user.id }
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId: req.user.id,
          currentStreak: 0,
          longestStreak: 0
        }
      });
    }

    res.json({
      success: true,
      data: { streak }
    });

  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
});

module.exports = {
  getStreak,
};
