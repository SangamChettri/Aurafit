/**
 * Global error handling middleware
 * Catches and processes all errors in the application
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      code: 'INVALID_ID'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    error = {
      message: 'Validation failed',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      errors
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Syntax errors (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      message: 'Invalid JSON in request body',
      statusCode: 400,
      code: 'INVALID_JSON'
    };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      message: 'Database connection error. Please try again later.',
      statusCode: 503,
      code: 'DATABASE_ERROR'
    };
  }

  // Rate limiting errors
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 400,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 400,
      code: 'TOO_MANY_FILES'
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'Internal server error';

  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(isDevelopment && { stack: err.stack }),
      ...(error.errors && { errors: error.errors }),
      ...(error.field && { field: error.field }),
      ...(error.retryAfter && { retryAfter: error.retryAfter })
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
};

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to automatically catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 * Formats express-validator errors
 */
const validationErrorHandler = (req, res, next) => {
  const errors = req.validationErrors();
  
  if (errors) {
    const formattedErrors = errors.map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: formattedErrors
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Request logging middleware
 * Logs all incoming requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Log successful requests (2xx) as info, others as warn
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Request:', logData);
    } else {
      console.warn('⚠️ Request:', logData);
    }
  });

  next();
};

/**
 * Performance monitoring middleware
 * Monitors slow requests and database queries
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 2 seconds)
    if (duration > 2000) {
      console.warn('🐌 Slow request detected:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

/**
 * Security headers middleware
 * Adds security headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent caching for sensitive routes
  if (req.url.includes('/auth/') || req.url.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Health check endpoint middleware
 */
const healthCheck = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  };

  // Check database connection (if mongoose is available)
  try {
    const mongoose = require('mongoose');
    health.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (error) {
    health.database = 'unknown';
  }

  res.status(200).json({
    success: true,
    data: health
  });
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validationErrorHandler,
  requestLogger,
  performanceMonitor,
  securityHeaders,
  healthCheck
};
