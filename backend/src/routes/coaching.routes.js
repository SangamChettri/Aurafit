const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate, requirePremium, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get coaches (Premium)
router.get('/coaches', authenticate, requirePremium, async (req, res) => {
  try {
    const coaches = await prisma.user.findMany({
      where: {
        role: 'COACH',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        fitnessLevel: true
      }
    });

    res.json({
      success: true,
      data: coaches
    });
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coaches',
      error: error.message
    });
  }
});

// Get coach assignments
router.get('/assignments', authenticate, async (req, res) => {
  try {
    const assignments = await prisma.coachAssignment.findMany({
      where: {
        OR: [
          { clientId: req.user.id },
          { coachId: req.user.id }
        ]
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Request coach assignment (Premium)
router.post('/assignments',
  authenticate,
  requirePremium,
  [
    body('coachId').notEmpty().isUUID()
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

      const coach = await prisma.user.findFirst({
        where: {
          id: req.body.coachId,
          role: 'COACH'
        }
      });

      if (!coach) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found'
        });
      }

      const assignment = await prisma.coachAssignment.create({
        data: {
          coachId: req.body.coachId,
          clientId: req.user.id,
          status: 'active'
        },
        include: {
          coach: {
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
        message: 'Coach assignment created',
        data: assignment
      });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create assignment',
        error: error.message
      });
    }
  }
);

// Get messages
router.get('/messages/:userId', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send message
router.post('/messages',
  authenticate,
  [
    body('receiverId').notEmpty().isUUID(),
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

      const message = await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId: req.body.receiverId,
          content: req.body.content
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          },
          receiver: {
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
        message: 'Message sent',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }
);

module.exports = router;
