require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Import Prisma
const { prisma, testConnection, disconnect } = require('./config/prisma');

// Import routes
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const progressRoutes = require('./routes/progressRoutes');
const streakRoutes = require('./routes/streakRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const { asyncHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:8081',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'exp://192.168.0.100:8081'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errors: [{ field: 'rateLimit', message: 'Rate limit exceeded' }]
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(hpp());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [{ field: 'route', message: 'Route not found' }]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle specific errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database error',
      errors: [{ field: 'database', message: 'Database operation failed' }]
    });
  }

  if (err.name === 'PrismaClientUnknownRequestError') {
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      errors: [{ field: 'database', message: 'Database connection failed' }]
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || [{ field: 'general', message: 'Internal server error' }]
  });
});

// Scheduled tasks
cron.schedule('0 9 * * *', async () => {
  console.log('🕐 Running daily scheduled tasks at 9 AM');
  
  try {
    // TODO: Implement Prisma-based scheduled tasks
    // Send workout reminders
    // Send progress reminders  
    // Update streaks
    console.log('✅ Scheduled tasks completed');
  } catch (error) {
    console.error('❌ Error in scheduled tasks:', error);
  }
});
        const workoutStats = await Workout.getWorkoutStats(streak.user, 'all');
        
        if (userNotification && userNotification.milestoneNotifications.enabled) {
          const milestoneNotifications = userNotification.checkMilestoneNotifications(
            { currentStreak: streak.currentStreak },
            workoutStats[0] || {}
          );
          
          for (const notification of milestoneNotifications) {
            await userNotification.addNotification(
              notification.type,
              notification.title,
              notification.message,
              notification.metadata
            );
            console.log(`✅ Milestone notification sent to user ${streak.user}: ${notification.title}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking streak milestones:', error);
    }
  });

  // Weekly workout summary every Sunday at 6 PM
  cron.schedule('0 18 * * 0', async () => {
    console.log('📊 Sending weekly workout summaries...');
    try {
      const Notification = require('./models/Notification');
      const Workout = require('./models/Workout');
      
      const users = await require('./models/User').find({ isActive: true });
      
      for (const user of users) {
        const userNotification = await Notification.findOne({ user: user._id });
        
        if (userNotification && userNotification.emailNotifications.weeklySummary.enabled) {
          const weeklyStats = await Workout.getWorkoutStats(user._id, 'week');
          const stats = weeklyStats[0] || { totalWorkouts: 0, totalVolume: 0, totalDuration: 0 };
          
          await userNotification.addNotification(
            'weekly_summary',
            '📊 Your Weekly Summary',
            `This week you completed ${stats.totalWorkouts} workouts with a total volume of ${stats.totalVolume} kg!`,
            { type: 'weekly_summary', stats }
          );
          
          console.log(`✅ Weekly summary sent to user ${user._id}`);
        }
      }
    } catch (error) {
      console.error('❌ Error sending weekly summaries:', error);
    }
  });

  console.log('🕐 Scheduled tasks started successfully');
};

// Start scheduled tasks
startScheduledTasks();

// Start server
const PORT = process.env.PORT || 5000;

// Initialize database first, then start server
initializeAppDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 AuraFit API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API documentation: http://localhost:${PORT}/api`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', err);
    // Don't crash the server, but log the error
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Don't crash the server, but log the error
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('📴 Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('📴 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('📴 Process terminated');
      process.exit(0);
    });
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
