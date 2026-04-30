const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getTransaction } = require('../config/database');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  console.log('🔍 Register request body:', req.body);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
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

  // Handle both name formats
  let { name, firstName, lastName, email, password, goal } = req.body;
  
  // Combine firstName + lastName if name not provided
  if (!name && firstName && lastName) {
    name = `${firstName} ${lastName}`;
    console.log('🔧 Combined firstName + lastName:', name);
  }
  
  // Validate required fields
  if (!name || !email || !password) {
    console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      errors: [
        ...(name ? [] : [{ field: 'name', message: 'Name is required' }]),
        ...(email ? [] : [{ field: 'email', message: 'Email is required' }]),
        ...(password ? [] : [{ field: 'password', message: 'Password is required' }])
      ]
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }

    // Create new user with transaction
    const transaction = await getTransaction();
    
    try {
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        goal: goal || 'general_fitness',
      }, { transaction });

      console.log('✅ User created successfully:', user.id);

      // Generate JWT token
      const token = generateToken(user.id);

      // Update last login
      await User.updateLastLogin(user.id);

      await transaction.commit();

      // Remove password from response
      const userResponse = user.toJSON();

      console.log('✅ Registration completed for:', email);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token,
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Transaction rolled back:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      errors: [{ field: 'general', message: error.message }]
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.array()
      }
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your account has been disabled'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Update last login
    await User.updateLastLogin(user.id);

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to login',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'email_verification_token', 'password_reset_token', 'password_reset_expires'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to fetch profile',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.array()
      }
    });
  }

  const { name, avatar, goal, height, weight, age, gender, activity_level } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (goal !== undefined) updateData.goal = goal;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (activity_level !== undefined) updateData.activity_level = activity_level;

    await user.update(updateData);

    const updatedUser = user.toJSON();

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to update profile',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.array()
      }
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACCOUNT_DELETION_FAILED',
        message: 'Failed to delete account',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Refresh JWT token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
const refreshToken = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

    // Generate new token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_REFRESH_FAILED',
        message: 'Failed to refresh token',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT setup, logout is handled on the client side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  refreshToken,
  logout,
  generateToken,
};
