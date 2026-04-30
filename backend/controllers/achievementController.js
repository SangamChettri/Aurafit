const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get all achievements and user progress
 * @route   GET /api/achievements
 * @access  Private
 */
const getAchievements = asyncHandler(async (req, res) => {
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { points: 'asc' }
    }),
    prisma.userAchievement.findMany({
      where: { userId: req.user.id }
    })
  ]);

  const earnedIds = userAchievements.map(ua => ua.achievementId);

  const formattedAchievements = allAchievements.map(achievement => ({
    ...achievement,
    earned: earnedIds.includes(achievement.id),
    earnedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.earnedAt || null,
    isNew: userAchievements.find(ua => ua.achievementId === achievement.id)?.isNew || false
  }));

  res.json({
    success: true,
    data: { achievements: formattedAchievements }
  });
});

/**
 * @desc    Mark achievement as seen (notification handled)
 * @route   PUT /api/achievements/:id/seen
 * @access  Private
 */
const markAchievementAsSeen = asyncHandler(async (req, res) => {
  await prisma.userAchievement.updateMany({
    where: {
      userId: req.user.id,
      achievementId: parseInt(req.params.id)
    },
    data: { isNew: false }
  });

  res.json({
    success: true,
    message: 'Achievement marked as seen'
  });
});

/**
 * Helper to check and award achievements based on triggers
 * @param {number} userId 
 * @param {string} triggerType 'workout_completed', 'streak_milestone', etc.
 */
const checkAndAwardAchievements = async (userId, triggerType) => {
  try {
    console.log(`🏆 Checking achievements for User ${userId}, Trigger: ${triggerType}`);
    
    // Get all achievements for this trigger type
    const potentialAchievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        criteria: {
          path: ['type'],
          equals: triggerType
        }
      }
    });

    // Get already earned achievements to avoid duplicates
    const alreadyEarned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    });
    const earnedIds = alreadyEarned.map(ua => ua.achievementId);

    const newAwards = [];

    for (const achievement of potentialAchievements) {
      if (earnedIds.includes(achievement.id)) continue;

      const criteria = achievement.criteria;
      let isEligible = false;

      // Logic based on trigger type
      if (triggerType === 'workout_completed') {
        const workoutCount = await prisma.workoutSession.count({ where: { userId } });
        if (criteria.target && workoutCount >= criteria.target) {
          isEligible = true;
        }
      } else if (triggerType === 'streak_milestone') {
        const streak = await prisma.streak.findUnique({ where: { userId } });
        if (streak && criteria.target && streak.currentStreak >= criteria.target) {
          isEligible = true;
        }
      }

      if (isEligible) {
        newAwards.push({
          userId,
          achievementId: achievement.id,
        });
      }
    }

    if (newAwards.length > 0) {
      await prisma.userAchievement.createMany({
        data: newAwards,
        skipDuplicates: true
      });
      console.log(`🎉 Awarded ${newAwards.length} new achievements to User ${userId}`);
    }

    return newAwards;
  } catch (error) {
    console.error('❌ Error awarding achievements:', error);
    return [];
  }
};

module.exports = {
  getAchievements,
  markAchievementAsSeen,
  checkAndAwardAchievements
};
