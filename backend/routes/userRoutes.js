const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getMeasurements,
  addMeasurement
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/measurements', getMeasurements);
router.post('/measurements', addMeasurement);

module.exports = router;
