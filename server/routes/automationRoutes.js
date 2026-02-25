const express = require('express');
const {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation
} = require('../controllers/automationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all automation routes
router.use(protect);

/**
 * @swagger
 * /api/automation:
 *   get:
 *     summary: Get all automations
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of automations
 *   post:
 *     summary: Create a new automation
 *     tags: [Automation]
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
 *               - trigger
 *               - actions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               trigger:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [keyword, time, event, webhook]
 *                   value:
 *                     type: object
 *               actions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Automation created successfully
 */
router.route('/')
  .get(getAutomations)
  .post(createAutomation);

/**
 * @swagger
 * /api/automation/{id}:
 *   get:
 *     summary: Get a single automation
 *     tags: [Automation]
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
 *         description: Automation details
 *   put:
 *     summary: Update an automation
 *     tags: [Automation]
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
 *         description: Automation updated successfully
 *   delete:
 *     summary: Delete an automation
 *     tags: [Automation]
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
 *         description: Automation deleted successfully
 */
router.route('/:id')
  .get(getAutomation)
  .put(updateAutomation)
  .delete(deleteAutomation);

/**
 * @swagger
 * /api/automation/{id}/toggle:
 *   put:
 *     summary: Toggle automation active status
 *     tags: [Automation]
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
 *         description: Automation status toggled
 */
router.put('/:id/toggle', toggleAutomation);

module.exports = router;
