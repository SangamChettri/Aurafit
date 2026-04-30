const { asyncHandler } = require('../middleware/errorMiddleware');
const { prisma } = require('../config/prisma');

/**
 * @desc    Get common constants and metadata used by the frontend
 * @route   GET /api/content/constants
 * @access  Public
 */
const getConstants = asyncHandler(async (req, res) => {
  try {
    // Define categories and muscle groups manually since they're not exported as enums
    const categories = [
      'Barbell',
      'Dumbbell', 
      'Machine',
      'Bodyweight',
      'Cardio',
      'Cable',
      'Other',
      'Kettlebell',
      'Plyometrics',
      'Yoga'
    ];
    
    const muscleGroups = [
      'Chest',
      'Back', 
      'Shoulders',
      'Biceps',
      'Triceps',
      'Legs',
      'Core',
      'FullBody',
      'Cardio'
    ];
    
    // Hardcoded milestones that are now centralized on the backend
    const streakMilestones = [7, 14, 30, 60, 90, 100, 200, 312, 365];
    
    res.json({
      success: true,
      data: {
        categories,
        muscleGroups,
        streakMilestones,
        appVersion: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Constants endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch constants',
      errors: [{ field: 'general', message: error.message }]
    });
  }
});

/**
 * @desc    Get daily inspiration/motivation
 * @route   GET /api/content/inspiration
 * @access  Public
 */
const getDailyInspiration = asyncHandler(async (req, res) => {
  const inspirations = [
    {
      title: 'Stay Motivated',
      text: 'Consistency is key! Even a 15-minute workout can make a difference in your fitness journey.',
      author: 'AuraFit'
    },
    {
      title: 'Push Yourself',
      text: 'The only bad workout is the one that didn\'t happen.',
      author: 'AuraFit'
    },
    {
      title: 'Health is Wealth',
      text: 'Take care of your body. It\'s the only place you have to live.',
      author: 'Jim Rohn'
    }
  ];
  
  // Return a random one or based on the day of the year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const selection = inspirations[dayOfYear % inspirations.length];
  
  res.json({
    success: true,
    data: selection
  });
});

module.exports = {
  getConstants,
  getDailyInspiration
};
