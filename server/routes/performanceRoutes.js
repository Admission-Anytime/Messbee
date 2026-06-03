const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPerformanceOverview,
  getWABAConfigDetails
} = require('../controllers/performanceController');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/performance/overview
 * @desc    Get real-time performance overview (chats, unread, open, failed, free tier, agents)
 * @query   date=YYYY-MM-DD (optional, defaults to today)
 * @access  Private
 */
router.get('/overview', getPerformanceOverview);

/**
 * @route   GET /api/performance/waba-config
 * @desc    Get the global WhatsApp Business API configuration snapshot
 * @access  Private
 */
router.get('/waba-config', getWABAConfigDetails);

module.exports = router;
