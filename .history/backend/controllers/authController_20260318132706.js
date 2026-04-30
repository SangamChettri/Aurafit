const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        fitness_goal: goal || 'general_fitness',
      }
    });

    console.log('✅ User created successfully:', user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

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
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided',
        errors: [{ field: 'general', message: 'Invalid data format' }]
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
  console.log('🔍 Login request body:', req.body);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Login validation errors:', errors.array());
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

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    console.log('❌ Missing login fields:', { email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      errors: [
        ...(email ? [] : [{ field: 'email', message: 'Email is required' }]),
        ...(password ? [] : [{ field: 'password', message: 'Password is required' }])
      ]
    });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'general', message: 'Invalid email or password' }]
      });
    }

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ Account disabled:', email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been disabled',
        errors: [{ field: 'general', message: 'Your account has been disabled' }]
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'general', message: 'Invalid email or password' }]
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    console.log('✅ Login successful:', email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        fitness_goal: true,
        height: true,
        weight: true,
        age: true,
        gender: true,
        activity_level: true,
        email_verified: true,
        is_active: true,
        is_premium: true,
        premium_expires: true,
        last_login: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'user', message: 'User not found' }]
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const { name, avatar, goal, height, weight, age, gender, activity_level } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'user', message: 'User not found' }]
      });
    }

    // Update allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (goal !== undefined) updateData.fitness_goal = goal;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (activity_level !== undefined) updateData.activity_level = activity_level;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        fitness_goal: true,
        height: true,
        weight: true,
        age: true,
        gender: true,
        activity_level: true,
        email_verified: true,
        is_active: true,
        is_premium: true,
        premium_expires: true,
        last_login: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'user', message: 'User not found' }]
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'user', message: 'User not found' }]
      });
    }

    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errors: [{ field: 'token', message: 'Invalid token' }]
      });
    }

    // Generate new token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
      }
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      errors: [{ field: 'general', message: 'Internal server error' }]
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
