const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET / - protected, all user's templates with exercises
router.get('/', protect, asyncHandler(async (req, res) => {
  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: req.user.id },
    include: {
      exercises: {
        include: {
          exercise: true
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json({ success: true, data: templates });
}));

// GET /:id - protected, single template with exercises
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id
    },
    include: {
      exercises: {
        include: {
          exercise: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  
  res.json({ success: true, data: template });
}));

// POST / - protected, create template
router.post('/', protect, asyncHandler(async (req, res) => {
  const { name, description, exercises } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  
  const template = await prisma.workoutTemplate.create({
    data: {
      userId: req.user.id,
      name,
      description: description || null,
      exercises: {
        create: exercises?.map(ex => ({
          exerciseId: ex.exerciseId,
          order: ex.order || 0,
          targetSets: ex.targetSets || null,
          targetReps: ex.targetReps || null,
          targetWeight: ex.targetWeight || null,
          restSeconds: ex.restSeconds || null
        })) || []
      }
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  res.status(201).json({ success: true, data: template });
}));

// PUT /:id - protected, update template
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { name, description, exercises } = req.body;
  const templateId = parseInt(req.params.id);
  
  const existing = await prisma.workoutTemplate.findFirst({
    where: { id: templateId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  
  // Delete existing exercises if new exercises array provided
  if (exercises !== undefined) {
    await prisma.templateExercise.deleteMany({
      where: { templateId }
    });
  }
  
  const template = await prisma.workoutTemplate.update({
    where: { id: templateId },
    data: {
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
      exercises: exercises !== undefined ? {
        create: exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          order: ex.order || 0,
          targetSets: ex.targetSets || null,
          targetReps: ex.targetReps || null,
          targetWeight: ex.targetWeight || null,
          restSeconds: ex.restSeconds || null
        }))
      } : undefined
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  res.json({ success: true, data: template });
}));

// DELETE /:id - protected, delete template
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const templateId = parseInt(req.params.id);
  
  const existing = await prisma.workoutTemplate.findFirst({
    where: { id: templateId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  
  await prisma.workoutTemplate.delete({ where: { id: templateId } });
  
  res.json({ success: true, message: 'Template deleted' });
}));

module.exports = router;
