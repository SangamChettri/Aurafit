const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get all exercises from library
 * @route   GET /api/exercises
 * @access  Private
 */
const getExercises = asyncHandler(async (req, res) => {
  try {
    const { category, muscleGroup, search } = req.query;

    const where = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }
    
    if (search) {
      where.name = {
        contains: search,
      };
    }

    const exercises = await prisma.exerciseLibrary.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        muscleGroup: true,
        equipment: true,
        instructions: true,
        imageUrl: true,
      }
    });

    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      errors: [{ field: 'general', message: error.message }]
    });
  }
});

/**
 * @desc    Get exercise by ID
 * @route   GET /api/exercises/:id
 * @access  Private
 */
const getExerciseById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercise = await prisma.exerciseLibrary.findUnique({
      where: { 
        id: parseInt(id),
        isActive: true
      }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
        errors: [{ field: 'id', message: 'Exercise not found' }]
      });
    }

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Get exercise by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      errors: [{ field: 'general', message: error.message }]
    });
  }
});

/**
 * @desc    Create new exercise in library (Admin)
 */
const createExercise = asyncHandler(async (req, res) => {
  try {
    const { name, category, muscleGroup, equipment, instructions, imageUrl, isCustom } = req.body;

    const exercise = await prisma.exerciseLibrary.create({
      data: {
        name,
        category,
        muscleGroup,
        equipment,
        instructions,
        imageUrl,
        isCustom: isCustom || false,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create exercise',
      errors: [{ field: 'general', message: error.message }]
    });
  }
});

/**
 * @desc    Update exercise in library (Admin)
 */
const updateExercise = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, muscleGroup, equipment, instructions, imageUrl, isActive } = req.body;

    const exercise = await prisma.exerciseLibrary.update({
      where: { id: parseInt(id) },
      data: {
        name,
        category,
        muscleGroup,
        equipment,
        instructions,
        imageUrl,
        isActive
      }
    });

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(404).json({
      success: false,
      message: 'Failed to update exercise',
      errors: [{ field: 'id', message: 'Exercise not found or invalid data' }]
    });
  }
});

/**
 * @desc    Delete exercise from library (Admin)
 */
const deleteExercise = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exerciseLibrary.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(404).json({
      success: false,
      message: 'Failed to delete exercise',
      errors: [{ field: 'id', message: 'Exercise not found' }]
    });
  }
});

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
