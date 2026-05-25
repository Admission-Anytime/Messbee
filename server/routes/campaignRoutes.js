const express = require('express');
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStats,
  sendCampaign
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all campaign routes
router.use(protect);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - messageTemplate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               messageTemplate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled, active, paused, completed]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Campaign created successfully
 */
router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get a single campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign details
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 */
router.route('/:id')
  .get(getCampaign)
  .put(updateCampaign)
  .delete(deleteCampaign);

/**
 * @swagger
 * /api/campaigns/{id}/stats:
 *   put:
 *     summary: Update campaign statistics
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sent:
 *                 type: integer
 *               delivered:
 *                 type: integer
 *               read:
 *                 type: integer
 *               replied:
 *                 type: integer
 *               failed:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stats updated successfully
 */
router.put('/:id/stats', updateCampaignStats);

/**
 * @swagger
 * /api/campaigns/{id}/send:
 *   post:
 *     summary: Send a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign started sending successfully
 */
router.post('/:id/send', sendCampaign);

module.exports = router;
