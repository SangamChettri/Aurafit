const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /follow/:userId - protected, follow a user
router.post('/follow/:userId', protect, asyncHandler(async (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user.id;
  
  if (followerId === followingId) {
    return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
  }
  
  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId }
    }
  });
  
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already following' });
  }
  
  await prisma.userFollow.create({
    data: { followerId, followingId }
  });
  
  res.status(201).json({ success: true, message: 'User followed' });
}));

// DELETE /follow/:userId - protected, unfollow a user
router.delete('/follow/:userId', protect, asyncHandler(async (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user.id;
  
  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId }
    }
  });
  
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Not following this user' });
  }
  
  await prisma.userFollow.delete({
    where: { followerId_followingId: { followerId, followingId } }
  });
  
  res.json({ success: true, message: 'User unfollowed' });
}));

// GET /follow/followers - protected, get followers
router.get('/follow/followers', protect, asyncHandler(async (req, res) => {
  const follows = await prisma.userFollow.findMany({
    where: { followingId: req.user.id },
    include: {
      follower: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const followers = follows.map(f => f.follower);
  
  res.json({ success: true, data: followers });
}));

// GET /follow/following - protected, get following
router.get('/follow/following', protect, asyncHandler(async (req, res) => {
  const follows = await prisma.userFollow.findMany({
    where: { followerId: req.user.id },
    include: {
      following: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const following = follows.map(f => f.following);
  
  res.json({ success: true, data: following });
}));

// GET /users/search - protected, search users
router.get('/users/search', protect, asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length < 1) {
    return res.json({ success: true, data: [] });
  }
  
  const users = await prisma.user.findMany({
    where: {
      name: { contains: q.trim(), mode: 'insensitive' },
      id: { not: req.user.id }
    },
    select: { id: true, name: true, avatar: true },
    take: 20
  });
  
  res.json({ success: true, data: users });
}));

module.exports = router;
