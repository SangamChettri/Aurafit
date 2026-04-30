const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('./errorMiddleware');

// Debug JWT_SECRET on module load
console.log('🔧 Auth Middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED' : 'NOT LOADED');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      errors: [{ field: 'token', message: 'No token provided' }]
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_premium: true,
        premium_expires: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        errors: [{ field: 'token', message: 'User not found' }]
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been disabled',
        errors: [{ field: 'account', message: 'Account disabled' }]
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errors: [{ field: 'token', message: 'Invalid token' }]
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        errors: [{ field: 'token', message: 'Token expired' }]
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      errors: [{ field: 'token', message: 'Authentication failed' }]
    });
  }
});

/**
 * Optional authentication - Doesn't fail if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          is_premium: true,
          premium_expires: true
        }
      });

      if (user && user.is_active) {
        req.user = user;
      }
    } catch (error) {
      // Optional auth - don't fail if token is invalid
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
});

/**
 * Check if user has specific role (for future role-based access)
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'auth', message: 'Authentication required' }]
      });
    }

    // Fetch user role from database
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
          errors: [{ field: 'auth', message: 'User not found' }]
        });
      }

      const userRole = user.role;
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          errors: [{ field: 'authorization', message: 'Insufficient permissions' }]
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        errors: [{ field: 'general', message: 'Internal server error' }]
      });
    }
  };
};

/**
 * Check if user is premium
 */
const requirePremium = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: [{ field: 'auth', message: 'Authentication required' }]
    });
  }

  if (!req.user.is_premium || (req.user.premium_expires && new Date(req.user.premium_expires) < new Date())) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      errors: [{ field: 'subscription', message: 'Premium subscription required' }]
    });
  }

  next();
});

/**
 * Rate limiting for authenticated users
 */
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? `user_${req.user.id}` : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v[0] < windowStart) {
        requests.delete(k);
      }
    }

    // Check current requests
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.',
        errors: [{ field: 'rateLimit', message: message || 'Too many requests' }]
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requirePremium,
  createRateLimit,
};
