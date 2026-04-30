const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Streak utility function
const recalculateStreak = async (userId) => {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    select: { startTime: true },
    orderBy: { startTime: 'desc' }
  });

  const uniqueDates = [...new Set(
    sessions.map(s => s.startTime.toISOString().split('T')[0])
  )];

  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    let checkDate = uniqueDates[0];
    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === checkDate) {
        currentStreak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i - 1]);
    const prev = new Date(uniqueDates[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak, uniqueDates.length > 0 ? 1 : 0);

  await prisma.streak.upsert({
    where: { userId },
    update: {
      currentStreak,
      longestStreak,
      lastWorkoutDate: uniqueDates[0] ? new Date(uniqueDates[0]) : null
    },
    create: {
      userId,
      currentStreak,
      longestStreak,
      lastWorkoutDate: uniqueDates[0] ? new Date(uniqueDates[0]) : null
    }
  });

  return { currentStreak, longestStreak };
};

// GET / - protected, user's sessions paginated
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;

  const where = { userId: req.user.id };

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where,
      skip,
      take,
      orderBy: { startTime: 'desc' },
      include: {
        exercises: {
          include: { sets: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    }),
    prisma.workoutSession.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    }
  });
}));

// GET /calendar - protected, dates with sessions
router.get('/calendar', protect, asyncHandler(async (req, res) => {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.user.id },
    select: { startTime: true }
  });

  const dates = [...new Set(
    sessions.map(s => s.startTime.toISOString().split('T')[0])
  )];

  res.json({ success: true, data: dates });
}));

// GET /stats - protected, session statistics
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allSessions, thisWeekSessions, thisMonthSessions, streakData] = await Promise.all([
    prisma.workoutSession.findMany({ where: { userId: req.user.id } }),
    prisma.workoutSession.findMany({
      where: { userId: req.user.id, startTime: { gte: last7Days } }
    }),
    prisma.workoutSession.findMany({
      where: { userId: req.user.id, startTime: { gte: last30Days } }
    }),
    prisma.streak.findUnique({ where: { userId: req.user.id } })
  ]);

  const totalSessions = allSessions.length;
  const totalVolume = allSessions.reduce((sum, s) => sum + Number(s.totalVolume || 0), 0);
  const totalSets = allSessions.reduce((sum, s) => sum + Number(s.totalSets || 0), 0);
  const totalReps = allSessions.reduce((sum, s) => sum + Number(s.totalReps || 0), 0);
  const hoursTotal = allSessions.reduce((sum, s) => sum + Number(s.duration || 0), 0) / 60;

  // Build weekly data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const daySessions = thisWeekSessions.filter(s => {
      const sDate = new Date(s.startTime);
      return sDate.toDateString() === d.toDateString();
    });
    weeklyData.push({
      date: days[d.getDay()],
      count: daySessions.length,
      volume: daySessions.reduce((sum, s) => sum + Number(s.totalVolume || 0), 0)
    });
  }

  res.json({
    success: true,
    data: {
      totalSessions,
      totalVolume,
      totalSets,
      totalReps,
      hoursTotal: Math.round(hoursTotal * 10) / 10,
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      workoutsThisWeek: thisWeekSessions.length,
      workoutsThisMonth: thisMonthSessions.length,
      weeklyData
    }
  });
}));

// GET /feed - protected, public sessions from followed users
router.get('/feed', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const following = await prisma.userFollow.findMany({
    where: { followerId: req.user.id },
    select: { followingId: true }
  });

  const followingIds = following.map(f => f.followingId);

  if (followingIds.length === 0) {
    return res.json({ success: true, data: { sessions: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where: {
        isPublic: true,
        userId: { in: followingIds }
      },
      skip,
      take,
      orderBy: { startTime: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        exercises: { select: { exerciseName: true } },
        _count: { select: { likes: true } }
      }
    }),
    prisma.workoutSession.count({
      where: { isPublic: true, userId: { in: followingIds } }
    })
  ]);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    }
  });
}));

// GET /:id - protected, single session detail
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      exercises: {
        include: { sets: { orderBy: { setNumber: 'asc' } } },
        orderBy: { order: 'asc' }
      },
      likes: { include: { user: { select: { id: true, name: true } } } },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  res.json({ success: true, data: session });
}));

// POST / - protected, create session (most complex)
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    title, startTime, endTime, templateId, notes, isPublic, exercises
  } = req.body;

  if (!title || !startTime) {
    return res.status(400).json({ success: false, message: 'Title and startTime are required' });
  }

  // Calculate duration
  const duration = endTime
    ? Math.round((new Date(endTime) - new Date(startTime)) / 60000)
    : null;

  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;

  // Calculate totals and PRs
  const exerciseData = [];
  for (const ex of exercises || []) {
    const sets = [];
    for (const set of ex.sets || []) {
      const isCompleted = set.isCompleted !== false;
      if (isCompleted) {
        totalSets++;
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
          totalReps += set.reps;
        } else if (set.reps) {
          totalReps += set.reps;
        }
      }
      sets.push({
        setNumber: set.setNumber,
        type: set.type || 'Normal',
        weight: set.weight || null,
        reps: set.reps || null,
        duration: set.duration || null,
        distance: set.distance || null,
        rpe: set.rpe || null,
        isCompleted,
        isPR: false
      });
    }
    exerciseData.push({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      order: ex.order || 0,
      sets
    });
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: req.user.id,
      templateId: templateId || null,
      title,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration,
      notes: notes || null,
      isPublic: isPublic || false,
      totalVolume: totalVolume || null,
      totalSets: totalSets || null,
      totalReps: totalReps || null
    }
  });

  // Create exercises and sets with PR detection
  for (const ex of exerciseData) {
    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        sessionId: session.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        order: ex.order
      }
    });

    for (const set of ex.sets) {
      let isPR = false;

      // PR Detection for completed sets with weight and reps
      if (set.isCompleted && set.weight && set.reps) {
        const existingPR = await prisma.personalRecord.findFirst({
          where: {
            userId: req.user.id,
            exerciseName: ex.exerciseName
          },
          orderBy: { weight: 'desc' }
        });

        if (!existingPR || set.weight > existingPR.weight) {
          isPR = true;
          await prisma.personalRecord.create({
            data: {
              userId: req.user.id,
              exerciseName: ex.exerciseName,
              weight: set.weight,
              reps: set.reps,
              date: new Date(),
              workoutId: session.id
            }
          });
        }
      }

      await prisma.exerciseSet.create({
        data: {
          workoutExerciseId: workoutExercise.id,
          setNumber: set.setNumber,
          type: set.type,
          weight: set.weight,
          reps: set.reps,
          duration: set.duration,
          distance: set.distance,
          rpe: set.rpe,
          isCompleted: set.isCompleted,
          isPR
        }
      });
    }
  }

  // Update streak
  await recalculateStreak(req.user.id);

  // Return created session with relations
  const createdSession = await prisma.workoutSession.findUnique({
    where: { id: session.id },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: 'asc' } } },
        orderBy: { order: 'asc' }
      }
    }
  });

  res.status(201).json({ success: true, data: createdSession });
}));

// PUT /:id - protected, update session
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { title, notes, isPublic } = req.body;
  const sessionId = parseInt(req.params.id);

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: req.user.id }
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const session = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      title: title !== undefined ? title : undefined,
      notes: notes !== undefined ? notes : undefined,
      isPublic: isPublic !== undefined ? isPublic : undefined
    }
  });

  res.json({ success: true, data: session });
}));

// DELETE /:id - protected, delete session
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.id);

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: req.user.id }
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  await prisma.workoutSession.delete({ where: { id: sessionId } });
  await recalculateStreak(req.user.id);

  res.json({ success: true, message: 'Session deleted' });
}));

// POST /:id/like - protected, toggle like
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.id);

  const existing = await prisma.sessionLike.findUnique({
    where: {
      sessionId_userId: { sessionId, userId: req.user.id }
    }
  });

  let liked;
  if (existing) {
    await prisma.sessionLike.delete({
      where: { sessionId_userId: { sessionId, userId: req.user.id } }
    });
    liked = false;
  } else {
    await prisma.sessionLike.create({
      data: { sessionId, userId: req.user.id }
    });
    liked = true;
  }

  const likeCount = await prisma.sessionLike.count({ where: { sessionId } });

  res.json({ success: true, data: { liked, likeCount } });
}));

// POST /:id/comment - protected, add comment
router.post('/:id/comment', protect, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const comment = await prisma.sessionComment.create({
    data: {
      sessionId,
      userId: req.user.id,
      text: text.trim()
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  });

  res.status(201).json({ success: true, data: comment });
}));

module.exports = router;
