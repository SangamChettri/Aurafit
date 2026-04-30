const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  // Accept either 'name' or 'firstName' + 'lastName'
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 25 })
    .withMessage('First name must be between 2 and 25 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 25 })
    .withMessage('Last name must be between 2 and 25 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('goal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'endurance', 'general_fitness'])
    .withMessage('Goal must be one of: weight_loss, muscle_gain, endurance, general_fitness'),
  
  // Custom validation to ensure either name or firstName+lastName is provided
  (req, res, next) => {
    const { name, firstName, lastName } = req.body;
    
    if (!name && (!firstName || !lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'name',
            message: 'Either full name or both first name and last name are required'
          }
        ]
      });
    }
    
    next();
  }
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('goal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'endurance', 'general_fitness'])
    .withMessage('Goal must be one of: weight_loss, muscle_gain, endurance, general_fitness')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Public routes
router.post('/register', registerValidation, asyncHandler(register));
router.post('/login', loginValidation, asyncHandler(login));

// Protected routes
router.get('/me', protect, asyncHandler(getMe));
router.put('/me', protect, updateProfileValidation, asyncHandler(updateProfile));
router.put('/change-password', protect, changePasswordValidation, asyncHandler(changePassword));
router.delete('/me', protect, asyncHandler(deleteAccount));
router.post('/refresh', protect, asyncHandler(refreshToken));
router.post('/logout', protect, asyncHandler(logout));

module.exports = router;
