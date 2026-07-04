const express = require('express');
const {
  getDashboardAnalytics,
  getMessageAnalytics,
  getCampaignAnalytics,
  getTemplateAnalytics,
  getConversationAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all analytics routes
router.use(protect);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: object
 *                     messages:
 *                       type: object
 *                     campaigns:
 *                       type: object
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * @swagger
 * /api/analytics/messages:
 *   get:
 *     summary: Get message analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Message analytics data
 */
router.get('/messages', getMessageAnalytics);

/**
 * @swagger
 * /api/analytics/campaigns:
 *   get:
 *     summary: Get campaign analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaign analytics data
 */
router.get('/campaigns', getCampaignAnalytics);

/**
 * @swagger
 * /api/analytics/templates:
 *   get:
 *     summary: Get template analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Template analytics data
 */
router.get('/templates', getTemplateAnalytics);

/**
 * @swagger
 * /api/analytics/conversations:
 *   get:
 *     summary: Get conversation analytics grouped by date and category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Conversation analytics data
 */
router.get('/conversations', getConversationAnalytics);

module.exports = router;
