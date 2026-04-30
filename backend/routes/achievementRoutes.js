const express = require('express');
const {
  getAchievements,
  markAchievementAsSeen
} = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected
router.use(protect);

router.get('/', getAchievements);
router.put('/:id/seen', markAchievementAsSeen);

module.exports = router;
