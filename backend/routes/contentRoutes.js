const express = require('express');
const router = express.Router();
const { getConstants, getDailyInspiration } = require('../controllers/contentController');

/**
 * @route   GET /api/content/constants
 * @desc    Get app-wide constants
 * @access  Public
 */
router.get('/constants', getConstants);

/**
 * @route   GET /api/content/inspiration
 * @desc    Get daily motivation
 * @access  Public
 */
router.get('/inspiration', getDailyInspiration);

module.exports = router;
