const express = require('express');
const {
  getDashboardAnalytics,
  getMessageAnalytics,
  getCampaignAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/dashboard', getDashboardAnalytics);
router.get('/messages', getMessageAnalytics);
router.get('/campaigns', getCampaignAnalytics);

module.exports = router;
