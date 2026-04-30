const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Get subscription status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscriptionStatus: true,
        subscriptionExpiresAt: true
      }
    });

    res.json({
      success: true,
      data: {
        status: user.subscriptionStatus,
        expiresAt: user.subscriptionExpiresAt,
        isActive: user.subscriptionStatus === 'PREMIUM' &&
          (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > new Date())
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status',
      error: error.message
    });
  }
});

// Upgrade to premium (Placeholder)
router.post('/upgrade',
  authenticate,
  [
    body('plan').isIn(['monthly', 'yearly']),
    body('paymentMethod').optional().trim()
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

      // Placeholder: In production, this would integrate with payment gateway
      const expiresAt = new Date();
      if (req.body.plan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          subscriptionStatus: 'PREMIUM',
          subscriptionExpiresAt: expiresAt
        },
        select: {
          subscriptionStatus: true,
          subscriptionExpiresAt: true
        }
      });

      res.json({
        success: true,
        message: 'Subscription upgraded (placeholder - no payment processed)',
        data: user
      });
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade subscription',
        error: error.message
      });
    }
  }
);

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscriptionStatus: 'FREE',
        subscriptionExpiresAt: null
      },
      select: {
        subscriptionStatus: true,
        subscriptionExpiresAt: true
      }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled',
      data: user
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

module.exports = router;
