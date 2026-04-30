const express = require('express');
const { body, query } = require('express-validator');
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationHistory,
  markNotificationsAsRead,
  addDeviceToken,
  removeDeviceToken,
  sendTestNotification,
  getNotificationStats,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Validation rules
const updatePreferencesValidation = [
  body('dailyReminder.time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Daily reminder time must be in HH:MM format'),
  body('dailyReminder.enabled')
    .optional()
    .isBoolean()
    .withMessage('Daily reminder enabled must be a boolean'),
  body('milestoneNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Milestone notifications enabled must be a boolean'),
  body('achievementNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Achievement notifications enabled must be a boolean'),
  body('pushNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Push notifications enabled must be a boolean'),
  body('emailNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Email notifications enabled must be a boolean')
];

const notificationHistoryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['daily_reminder', 'streak_milestone', 'volume_milestone', 'workout_count_milestone', 'personal_best', 'achievement'])
    .withMessage('Type must be a valid notification type'),
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('UnreadOnly must be a boolean'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const deviceTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Device token is required'),
  body('platform')
    .isIn(['ios', 'android'])
    .withMessage('Platform must be either ios or android')
];

const testNotificationValidation = [
  body('type')
    .optional()
    .isIn(['info', 'success', 'warning', 'error'])
    .withMessage('Type must be one of: info, success, warning, error'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
];

// All routes are protected
router.use(protect);

// Notification preferences routes
router.get('/preferences', asyncHandler(getNotificationPreferences));
router.put('/preferences', updatePreferencesValidation, asyncHandler(updateNotificationPreferences));

// Notification history and management routes
router.get('/history', notificationHistoryValidation, asyncHandler(getNotificationHistory));
router.put('/read', asyncHandler(markNotificationsAsRead));
router.delete('/clear', asyncHandler(clearAllNotifications));

// Device token management routes
router.post('/device-token', deviceTokenValidation, asyncHandler(addDeviceToken));
router.delete('/device-token', asyncHandler(removeDeviceToken));

// Test and statistics routes
router.post('/test', testNotificationValidation, asyncHandler(sendTestNotification));
router.get('/stats', asyncHandler(getNotificationStats));

module.exports = router;
