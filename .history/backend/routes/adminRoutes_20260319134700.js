const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

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
        }
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
    // Get all unique exercise names from the Exercise model
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: 'asc' },
      distinct: ['name'],
      select: {
        id: true,
        name: true,
        difficulty: true,
        createdAt: true
      }
    });

    // Transform exercises for admin panel (simulate category/muscleGroup/isActive)
    const transformedExercises = exercises.map((ex, index) => ({
      id: ex.id,
      name: ex.name,
      category: 'Exercise', // Generic category since schema doesn't have it
      muscleGroup: 'General', // Generic muscle group
      difficulty: ex.difficulty || 'intermediate',
      isActive: true, // All exercises are active by default
      createdAt: ex.createdAt
    }));

    res.json({
      success: true,
      data: transformedExercises
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

module.exports = router;
