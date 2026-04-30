const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET / - protected, all user's measurements
router.get('/', protect, asyncHandler(async (req, res) => {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' }
  });
  
  res.json({ success: true, data: measurements });
}));

// GET /latest - protected, most recent measurement
router.get('/latest', protect, asyncHandler(async (req, res) => {
  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' }
  });
  
  if (!measurement) {
    return res.status(404).json({ success: false, message: 'No measurements found' });
  }
  
  res.json({ success: true, data: measurement });
}));

// POST / - protected, create measurement with auto BMI
router.post('/', protect, asyncHandler(async (req, res) => {
  const { date, weight, bodyFat, muscleMass, height, chest, waist, hips, arms, thighs, notes } = req.body;
  
  // Calculate BMI if weight and height provided
  let bmi = null;
  if (weight && height) {
    const heightInMeters = Number(height) / 100;
    bmi = Number(weight) / (heightInMeters * heightInMeters);
    bmi = Math.round(bmi * 10) / 10;
  }
  
  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: req.user.id,
      date: date ? new Date(date) : new Date(),
      weight: weight || null,
      bodyFat: bodyFat || null,
      muscleMass: muscleMass || null,
      bmi,
      height: height || null,
      chest: chest || null,
      waist: waist || null,
      hips: hips || null,
      arms: arms || null,
      thighs: thighs || null,
      notes: notes || null
    }
  });
  
  res.status(201).json({ success: true, data: measurement });
}));

// PUT /:id - protected, update measurement
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const measurementId = parseInt(req.params.id);
  const { weight, height, bodyFat, muscleMass, chest, waist, hips, arms, thighs, notes } = req.body;
  
  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id: measurementId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Measurement not found' });
  }
  
  // Calculate new BMI if weight or height changed
  let bmi = undefined;
  const newWeight = weight !== undefined ? weight : existing.weight;
  const newHeight = height !== undefined ? height : existing.height;
  
  if (newWeight && newHeight) {
    const heightInMeters = Number(newHeight) / 100;
    bmi = Number(newWeight) / (heightInMeters * heightInMeters);
    bmi = Math.round(bmi * 10) / 10;
  }
  
  const measurement = await prisma.bodyMeasurement.update({
    where: { id: measurementId },
    data: {
      weight: weight !== undefined ? weight : undefined,
      bodyFat: bodyFat !== undefined ? bodyFat : undefined,
      muscleMass: muscleMass !== undefined ? muscleMass : undefined,
      bmi,
      height: height !== undefined ? height : undefined,
      chest: chest !== undefined ? chest : undefined,
      waist: waist !== undefined ? waist : undefined,
      hips: hips !== undefined ? hips : undefined,
      arms: arms !== undefined ? arms : undefined,
      thighs: thighs !== undefined ? thighs : undefined,
      notes: notes !== undefined ? notes : undefined
    }
  });
  
  res.json({ success: true, data: measurement });
}));

// DELETE /:id - protected, delete measurement
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const measurementId = parseInt(req.params.id);
  
  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id: measurementId, userId: req.user.id }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Measurement not found' });
  }
  
  await prisma.bodyMeasurement.delete({ where: { id: measurementId } });
  
  res.json({ success: true, message: 'Measurement deleted' });
}));

module.exports = router;
