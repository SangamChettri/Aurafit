const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Public exercise library endpoint (must be before admin middleware)
router.get('/exercise-library', asyncHandler(async (req, res) => {
  try {
    const { category, muscleGroup } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;
    if (muscleGroup) where.muscleGroup = muscleGroup;

    const exercises = await prisma.exerciseLibrary.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        muscleGroup: true,
        equipment: true,
        instructions: true
      }
    });

    res.json({ success: true, data: exercises });
  } catch (error) {
    console.error('Get exercise library error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
  }
}));

// All admin routes require authentication and admin/super_admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Helper function to log admin actions
const logAdminAction = async (adminId, action, resource, resourceId = null, details = null, req = null) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId: resourceId ? String(resourceId) : null,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req?.ip || req?.headers['x-forwarded-for'] || null,
        userAgent: req?.headers['user-agent'] || null
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Helper to transform user data for admin panel (real-world naming convention)
const transformUserForAdmin = (user) => {
  // Split name into firstName and lastName (real-world handling)
  const nameParts = user.name ? user.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    subscriptionStatus: user.is_premium ? 'PREMIUM' : 'FREE',
    isActive: user.is_active,
    fitnessGoal: user.fitness_goal,
    activityLevel: user.activity_level,
    emailVerified: user.email_verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin/Super Admin)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  try {
    const [
      totalUsers,
      premiumUsers,
      activeUsers,
      totalWorkouts,
      totalProgress,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_premium: true } }),
      prisma.user.count({ where: { is_active: true } }),
      prisma.workout.count(),
      prisma.progress.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          is_premium: true,
          is_active: true,
          createdAt: true
        }
      })
    ]);

    // Transform recent users for admin panel
    const transformedRecentUsers = recentUsers.map(transformUserForAdmin);

    res.json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        activeUsers,
        totalWorkouts,
        totalGoals: totalProgress, // Using progress as goals equivalent
        recentUsers: transformedRecentUsers
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
}));

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin/Super Admin)
 */
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search too long')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      const { page = 1, limit = 20, search } = req.query;
      const where = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            is_premium: true,
            is_active: true,
            fitness_goal: true,
            activity_level: true,
            email_verified: true,
            createdAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      // Transform users for admin panel
      const transformedUsers = users.map(transformUserForAdmin);

      res.json({
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        errors: [{ field: 'general', message: 'Internal server error' }]
      });
    }
  })
);

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin/Super Admin)
 */
router.get('/users/:id', asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        errors: [{ field: 'id', message: 'Invalid user ID' }]
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            workouts: true,
            progress: true,
            personalRecords: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        },
        bodyMeasurements: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'user', message: 'User not found' }]
      });
    }

    // Transform user for admin panel
    const transformedUser = transformUserForAdmin(user);

    res.json({
      success: true,
      data: {
        ...transformedUser,
        stats: {
          totalWorkouts: user._count.workouts,
          totalProgress: user._count.progress,
          totalPersonalRecords: user._count.personalRecords
        },
        achievements: user.achievements.map(ua => ({
          id: ua.achievement.id,
          title: ua.achievement.title,
          earnedAt: ua.earnedAt
        })),
        measurements: user.bodyMeasurements
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
}));

/**
 * @desc    Update user (only is_active allowed)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin/Super Admin)
 */
router.put('/users/:id',
  [
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: [{ field: 'id', message: 'Invalid user ID' }]
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: [{ field: 'user', message: 'User not found' }]
        });
      }

      // Only allow updating is_active
      const updateData = {};
      if (req.body.isActive !== undefined) {
        updateData.is_active = req.body.isActive;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update',
          errors: [{ field: 'general', message: 'Only isActive can be updated' }]
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Log admin action
      await logAdminAction(
        req.user.id,
        'UPDATE_USER',
        'User',
        userId,
        { isActive: req.body.isActive },
        req
      );

      // Transform for response
      const transformedUser = transformUserForAdmin(updatedUser);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: transformedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        errors: [{ field: 'general', message: 'Internal server error' }]
      });
    }
  })
);

/**
 * @desc    Get exercises
 * @route   GET /api/admin/exercises
 * @access  Private (Admin/Super Admin)
 */
router.get('/exercises', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get unique exercise names with pagination
    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        orderBy: { exerciseName: 'asc' },
        distinct: ['exerciseName'],
        skip,
        take,
        select: {
          workoutId: true,
          exerciseName: true,
          createdAt: true
        }
      }),
      // For total count of distinct names, we need a separate query or count
      prisma.exercise.groupBy({
        by: ['exerciseName'],
        _count: { exerciseName: true }
      }).then(groups => groups.length)
    ]);

    // Transform exercises for admin panel
    const transformedExercises = exercises.map((ex, index) => ({
      id: `${ex.workoutId}-${index}`,
      name: ex.exerciseName,
      category: 'Exercise',
      muscleGroup: 'General',
      difficulty: 'intermediate',
      isActive: true,
      createdAt: ex.createdAt
    }));

    res.json({
      success: true,
      data: {
        exercises: transformedExercises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / take)
        }
      }
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      errors: [{ field: 'general', message: 'Internal server error' }]
    });
  }
}));

/**
 * @desc    Get all exercise library entries
 * @route   GET /api/admin/exercise-library/manage
 * @access  Private (Admin/Super Admin)
 */
router.get('/exercise-library/manage', asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Admin exercise-library endpoint called');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 User:', req.user);
    
    const { page = 1, limit = 20, category, muscleGroup, isCustom } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (category) where.category = category;
    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (isCustom !== undefined) where.isCustom = isCustom === 'true';

    console.log('🔍 Where clause:', where);

    const [exercises, total] = await Promise.all([
      prisma.exerciseLibrary.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take
      }),
      prisma.exerciseLibrary.count({ where })
    ]);

    console.log(`✅ Found ${exercises.length} exercises (total: ${total})`);

    res.json({ 
      success: true, 
      data: {
        exercises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get exercise library error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
  }
}));

/**
 * @desc    Create new global exercise
 * @route   POST /api/admin/exercise-library
 * @access  Private (Admin/Super Admin)
 */
router.post('/exercise-library',
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty(),
    body('muscleGroup').notEmpty()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, category, muscleGroup, equipment, instructions, imageUrl } = req.body;

    const exercise = await prisma.exerciseLibrary.create({
      data: {
        name,
        category,
        muscleGroup,
        equipment: equipment || null,
        instructions: instructions || null,
        imageUrl: imageUrl || null,
        isCustom: false,
        createdBy: null,
        isActive: true
      }
    });

    await logAdminAction(req.user.id, 'CREATE', 'ExerciseLibrary', exercise.id, { name }, req);

    res.status(201).json({ success: true, data: exercise });
  })
);

/**
 * @desc    Update exercise
 * @route   PUT /api/admin/exercise-library/:id
 * @access  Private (Admin/Super Admin)
 */
router.put('/exercise-library/:id', asyncHandler(async (req, res) => {
  const exerciseId = parseInt(req.params.id);

  const existing = await prisma.exerciseLibrary.findUnique({ where: { id: exerciseId } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Exercise not found' });
  }

  const { name, category, muscleGroup, equipment, instructions, imageUrl, isActive } = req.body;

  const exercise = await prisma.exerciseLibrary.update({
    where: { id: exerciseId },
    data: {
      name: name !== undefined ? name : undefined,
      category: category !== undefined ? category : undefined,
      muscleGroup: muscleGroup !== undefined ? muscleGroup : undefined,
      equipment: equipment !== undefined ? equipment : undefined,
      instructions: instructions !== undefined ? instructions : undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    }
  });

  await logAdminAction(req.user.id, 'UPDATE', 'ExerciseLibrary', exerciseId, { name: exercise.name }, req);

  res.json({ success: true, data: exercise });
}));

/**
 * @desc    Soft delete exercise (set isActive: false)
 * @route   DELETE /api/admin/exercise-library/:id
 * @access  Private (Admin/Super Admin)
 */
router.delete('/exercise-library/:id', asyncHandler(async (req, res) => {
  const exerciseId = parseInt(req.params.id);

  const existing = await prisma.exerciseLibrary.findUnique({ where: { id: exerciseId } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Exercise not found' });
  }

  const exercise = await prisma.exerciseLibrary.update({
    where: { id: exerciseId },
    data: { isActive: false }
  });

  await logAdminAction(req.user.id, 'DELETE', 'ExerciseLibrary', exerciseId, { name: existing.name }, req);

  res.json({ success: true, message: 'Exercise deactivated', data: exercise });
}));

/**
 * @desc    Get admin logs
 * @route   GET /api/admin/logs
 * @access  Private (Super Admin only)
 */
router.get('/logs',
  authorize('super_admin'), // Only super admin can view logs
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      const { page = 1, limit = 50 } = req.query;

      const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.adminLog.count()
      ]);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch logs',
        errors: [{ field: 'general', message: 'Internal server error' }]
      });
    }
  })
);

// ===== NEW HEVY FEATURE ADMIN ENDPOINTS =====

/**
 * @desc    Get all workout sessions across users
 * @route   GET /api/admin/sessions
 * @access  Private (Admin/Super Admin)
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, startDate, endDate } = req.query;

    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [sessions, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: {
            select: { exercises: true, likes: true }
          }
        }
      }),
      prisma.workout.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
}));



/**
 * @desc    Get all body measurements
 * @route   GET /api/admin/measurements
 * @access  Private (Admin/Super Admin)
 */
router.get('/measurements', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [measurements, total] = await Promise.all([
      prisma.bodyMeasurement.findMany({
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.bodyMeasurement.count()
    ]);

    res.json({
      success: true,
      data: {
        measurements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch measurements' });
  }
}));

/**
 * @desc    Get all personal records
 * @route   GET /api/admin/personal-records
 * @access  Private (Admin/Super Admin)
 */
router.get('/personal-records', asyncHandler(async (req, res) => {
  try {
    const records = await prisma.personalRecord.findMany({
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get personal records error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal records' });
  }
}));

/**
 * @desc    Get platform stats
 * @route   GET /api/admin/platform-stats
 * @access  Private (Admin/Super Admin)
 */
router.get('/platform-stats', asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      workoutsToday,
      workoutsThisWeek,
      workoutsThisMonth,
      exerciseCounts,
      userSessionCounts,
      streakData,
      totalExercises,
      totalSessions,
      totalMeasurements
    ] = await Promise.all([
      prisma.workout.count({
        where: { date: { gte: today } }
      }),
      prisma.workout.count({
        where: { date: { gte: last7Days } }
      }),
      prisma.workout.count({
        where: { date: { gte: last30Days } }
      }),
      prisma.exercise.groupBy({
        by: ['exerciseName'],
        _count: { exerciseName: true },
        orderBy: { _count: { exerciseName: 'desc' } },
        take: 1
      }),
      prisma.workout.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 1
      }),
      prisma.streak.findMany({
        select: { currentStreak: true }
      }),
      prisma.exerciseLibrary.count({ where: { isActive: true } }),
      prisma.workout.count(),
      prisma.bodyMeasurement.count()
    ]);

    // Calculate average streak
    const avgStreak = streakData.length > 0
      ? Math.round(streakData.reduce((sum, s) => sum + s.currentStreak, 0) / streakData.length)
      : 0;

    // Get most active user details
    let mostActiveUser = null;
    if (userSessionCounts.length > 0) {
      const topUser = await prisma.user.findUnique({
        where: { id: userSessionCounts[0].userId },
        select: { name: true, email: true }
      });
      mostActiveUser = {
        name: topUser?.name || 'Unknown',
        email: topUser?.email || '',
        sessionCount: userSessionCounts[0]._count.userId
      };
    }

    res.json({
      success: true,
      data: {
        workoutsToday,
        workoutsThisWeek,
        workoutsThisMonth,
        mostPopularExercise: exerciseCounts.length > 0
          ? { name: exerciseCounts[0].exerciseName, count: exerciseCounts[0]._count.exerciseName }
          : { name: 'N/A', count: 0 },
        mostActiveUser: mostActiveUser || { name: 'N/A', email: '', sessionCount: 0 },
        averageCurrentStreak: avgStreak,
        totalExercisesInLibrary: totalExercises,
        totalWorkouts,
        totalBodyMeasurements: totalMeasurements
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform stats' });
  }
}));

// ===== ACHIEVEMENT MANAGEMENT =====

/**
 * @desc    Get all achievements (Admin)
 * @route   GET /api/admin/achievements
 */
router.get('/achievements', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [achievements, total] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.achievement.count()
  ]);

  res.json({
    success: true,
    data: {
      achievements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    }
  });
}));

/**
 * @desc    Create achievement
 * @route   POST /api/admin/achievements
 */
router.post('/achievements', asyncHandler(async (req, res) => {
  const { title, description, icon, category, points, criteria } = req.body;
  const achievement = await prisma.achievement.create({
    data: { title, description, icon, category, points, criteria }
  });
  await logAdminAction(req.user.id, 'CREATE', 'Achievement', achievement.id, { title }, req);
  res.status(201).json({ success: true, data: achievement });
}));

/**
 * @desc    Update achievement
 * @route   PUT /api/admin/achievements/:id
 */
router.put('/achievements/:id', asyncHandler(async (req, res) => {
  const { title, description, icon, category, points, criteria, isActive } = req.body;
  const achievement = await prisma.achievement.update({
    where: { id: parseInt(req.params.id) },
    data: { title, description, icon, category, points, criteria, isActive }
  });
  await logAdminAction(req.user.id, 'UPDATE', 'Achievement', achievement.id, { title }, req);
  res.json({ success: true, data: achievement });
}));

/**
 * @desc    Delete achievement
 * @route   DELETE /api/admin/achievements/:id
 */
router.delete('/achievements/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.achievement.delete({ where: { id } });
  await logAdminAction(req.user.id, 'DELETE', 'Achievement', id, null, req);
  res.json({ success: true, message: 'Achievement deleted' });
}));

module.exports = router;
