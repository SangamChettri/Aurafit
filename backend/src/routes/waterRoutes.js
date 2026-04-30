const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET / - protected, get water logs with date range
router.get('/', protect, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const where = { userId: req.user.id };
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  
  const logs = await prisma.waterLog.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  
  // Calculate daily totals
  const dailyTotals = {};
  for (const log of logs) {
    const dateStr = log.date.toISOString().split('T')[0];
    dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + Number(log.amount);
  }
  
  res.json({ success: true, data: { logs, dailyTotals } });
}));

// GET /today - protected, get today's water logs
router.get('/today', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [logs, user] = await Promise.all([
    prisma.waterLog.findMany({
      where: {
        userId: req.user.id,
        date: { gte: today, lt: tomorrow }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findUnique({
      where: { id: req.user.id },
      select: { weight: true }
    })
  ]);
  
  const total = logs.reduce((sum, log) => sum + Number(log.amount), 0);
  const weight = user?.weight ? Number(user.weight) : null;
  const recommended = weight ? Math.round(weight * 30) : 2000;
  const percentage = Math.min(Math.round((total / recommended) * 100), 100);
  
  res.json({
    success: true,
    data: { total, recommended, percentage, logs }
  });
}));

// POST / - protected, create water log
router.post('/', protect, asyncHandler(async (req, res) => {
  const { amount, date } = req.body;
  
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
  }
  
  const log = await prisma.waterLog.create({
    data: {
      userId: req.user.id,
      amount: Number(amount),
      date: date ? new Date(date) : new Date()
    }
  });
  
  res.status(201).json({ success: true, data: log });
}));

// DELETE /:id - protected, delete water log
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const logId = parseInt(req.params.id);
  
  const existing = await prisma.waterLog.findFirst({
    where: { id: logId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Water log not found' });
  }
  
  await prisma.waterLog.delete({ where: { id: logId } });
  
  res.json({ success: true, message: 'Water log deleted' });
}));

module.exports = router;
