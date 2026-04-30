const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET / - protected, user's goals
router.get('/', protect, asyncHandler(async (req, res) => {
  const { isCompleted } = req.query;
  
  const where = { userId: req.user.id };
  
  if (isCompleted !== undefined) {
    where.isCompleted = isCompleted === 'true';
  }
  
  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  
  res.json({ success: true, data: goals });
}));

// POST / - protected, create goal
router.post('/', protect, asyncHandler(async (req, res) => {
  const { type, title, description, targetValue, currentValue, unit, targetDate } = req.body;
  
  if (!type || !title) {
    return res.status(400).json({ success: false, message: 'Type and title are required' });
  }
  
  // Validate GoalType
  const validTypes = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'ENDURANCE', 'FLEXIBILITY'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid goal type' });
  }
  
  const goal = await prisma.goal.create({
    data: {
      userId: req.user.id,
      type,
      title,
      description: description || null,
      targetValue: targetValue || null,
      currentValue: currentValue || null,
      unit: unit || null,
      targetDate: targetDate ? new Date(targetDate) : null
    }
  });
  
  res.status(201).json({ success: true, data: goal });
}));

// PUT /:id - protected, update goal
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const goalId = parseInt(req.params.id);
  const { title, description, targetValue, currentValue, unit, targetDate } = req.body;
  
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  
  // Check for auto-completion
  let isCompleted = undefined;
  let completedAt = undefined;
  
  const newCurrentValue = currentValue !== undefined ? currentValue : existing.currentValue;
  const newTargetValue = targetValue !== undefined ? targetValue : existing.targetValue;
  
  if (newCurrentValue && newTargetValue && 
      Number(newCurrentValue) >= Number(newTargetValue) && 
      !existing.isCompleted) {
    isCompleted = true;
    completedAt = new Date();
  }
  
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: title !== undefined ? title : undefined,
      description: description !== undefined ? description : undefined,
      targetValue: targetValue !== undefined ? targetValue : undefined,
      currentValue: currentValue !== undefined ? currentValue : undefined,
      unit: unit !== undefined ? unit : undefined,
      targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : undefined,
      isCompleted,
      completedAt
    }
  });
  
  res.json({ success: true, data: goal });
}));

// DELETE /:id - protected, delete goal
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const goalId = parseInt(req.params.id);
  
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  
  await prisma.goal.delete({ where: { id: goalId } });
  
  res.json({ success: true, message: 'Goal deleted' });
}));

// PATCH /:id/complete - protected, mark goal complete
router.patch('/:id/complete', protect, asyncHandler(async (req, res) => {
  const goalId = parseInt(req.params.id);
  
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      isCompleted: true,
      completedAt: new Date()
    }
  });
  
  res.json({ success: true, data: goal });
}));

module.exports = router;
