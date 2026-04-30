const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET / - public, all exercises with filtering and pagination
router.get('/', asyncHandler(async (req, res) => {
  const { category, muscleGroup, search, page = 1, limit = 20 } = req.query;
  
  const where = { isActive: true };
  
  if (category) where.category = category;
  if (muscleGroup) where.muscleGroup = muscleGroup;
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  
  const [exercises, total] = await Promise.all([
    prisma.exerciseLibrary.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' }
    }),
    prisma.exerciseLibrary.count({ where })
  ]);
  
  res.json({
    success: true,
    data: {
      exercises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    }
  });
}));

// GET /:id - public, single exercise detail
router.get('/:id', asyncHandler(async (req, res) => {
  const exercise = await prisma.exerciseLibrary.findUnique({
    where: { id: parseInt(req.params.id) }
  });
  
  if (!exercise) {
    return res.status(404).json({ success: false, message: 'Exercise not found' });
  }
  
  res.json({ success: true, data: exercise });
}));

// GET /custom/mine - protected, user's own custom exercises
router.get('/custom/mine', protect, asyncHandler(async (req, res) => {
  const exercises = await prisma.exerciseLibrary.findMany({
    where: {
      isCustom: true,
      createdBy: req.user.id
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json({ success: true, data: exercises });
}));

// POST /custom - protected, create custom exercise
router.post('/custom', protect, asyncHandler(async (req, res) => {
  const { name, category, muscleGroup, equipment, instructions } = req.body;
  
  if (!name || !category || !muscleGroup) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, category, and muscleGroup are required' 
    });
  }
  
  const exercise = await prisma.exerciseLibrary.create({
    data: {
      name,
      category,
      muscleGroup,
      equipment: equipment || null,
      instructions: instructions || null,
      isCustom: true,
      createdBy: req.user.id,
      isActive: true
    }
  });
  
  res.status(201).json({ success: true, data: exercise });
}));

module.exports = router;
