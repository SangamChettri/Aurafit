const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get friends/connections
router.get('/connections', authenticate, async (req, res) => {
  try {
    const connections = await prisma.socialConnection.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'accepted' },
          { connectedUserId: req.user.id, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        connectedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    const friends = connections.map(conn => {
      const friend = conn.userId === req.user.id ? conn.connectedUser : conn.user;
      return {
        ...friend,
        connectionId: conn.id,
        connectedAt: conn.createdAt
      };
    });

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections',
      error: error.message
    });
  }
});

// Send friend request
router.post('/connect/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect to yourself'
      });
    }

    const existingConnection = await prisma.socialConnection.findFirst({
      where: {
        OR: [
          { userId: req.user.id, connectedUserId: userId },
          { userId: userId, connectedUserId: req.user.id }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists'
      });
    }

    const connection = await prisma.socialConnection.create({
      data: {
        userId: req.user.id,
        connectedUserId: userId,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: connection
    });
  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request',
      error: error.message
    });
  }
});

// Accept friend request
router.patch('/accept/:connectionId', authenticate, async (req, res) => {
  try {
    const connection = await prisma.socialConnection.findFirst({
      where: {
        id: req.params.connectionId,
        connectedUserId: req.user.id,
        status: 'pending'
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    const updated = await prisma.socialConnection.update({
      where: { id: req.params.connectionId },
      data: { status: 'accepted' }
    });

    res.json({
      success: true,
      message: 'Friend request accepted',
      data: updated
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection',
      error: error.message
    });
  }
});

// Get activity feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get friends
    const connections = await prisma.socialConnection.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'accepted' },
          { connectedUserId: req.user.id, status: 'accepted' }
        ]
      }
    });

    const friendIds = connections.map(conn =>
      conn.userId === req.user.id ? conn.connectedUserId : conn.userId
    );
    friendIds.push(req.user.id); // Include own posts

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: friendIds },
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
});

// Create post
router.post('/posts',
  authenticate,
  [
    body('content').notEmpty().trim(),
    body('workoutId').optional().isUUID()
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

      const post = await prisma.post.create({
        data: {
          userId: req.user.id,
          ...req.body
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create post',
        error: error.message
      });
    }
  }
);

// Like/Unlike post
router.post('/posts/:postId/like', authenticate, async (req, res) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.postId,
          userId: req.user.id
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.json({
        success: true,
        message: 'Post unliked',
        liked: false
      });
    }

    await prisma.like.create({
      data: {
        postId: req.params.postId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Post liked',
      liked: true
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
});

// Comment on post
router.post('/posts/:postId/comments',
  authenticate,
  [
    body('content').notEmpty().trim()
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

      const comment = await prisma.comment.create({
        data: {
          postId: req.params.postId,
          userId: req.user.id,
          content: req.body.content
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Comment added',
        data: comment
      });
    } catch (error) {
      console.error('Comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  }
);

module.exports = router;
