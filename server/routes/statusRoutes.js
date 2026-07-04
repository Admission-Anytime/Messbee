const express = require('express');
const router = express.Router();
const { 
    getStatuses, 
    createStatus, 
    updateStatus, 
    deleteStatus,
    getStatusById
} = require('../controllers/statusController');
const { protect } = require('../middleware/auth');

// Protect all status routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Statuses
 *   description: Status management endpoints
 */

/**
 * @swagger
 * /api/statuses:
 *   get:
 *     summary: Get all statuses for the authenticated user
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   color:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   createdBy:
 *                     type: string
 *                   avatar:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', getStatuses);

/**
 * @swagger
 * /api/statuses:
 *   post:
 *     summary: Create a new status
 *     tags: [Statuses]
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
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 default: '#3B82F6'
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Status created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Status limit reached
 */
router.post('/', createStatus);

/**
 * @swagger
 * /api/statuses/{id}:
 *   get:
 *     summary: Get a specific status by ID
 *     tags: [Statuses]
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
 *         description: Status details
 *       404:
 *         description: Status not found
 */
router.get('/:id', getStatusById);

/**
 * @swagger
 * /api/statuses/{id}:
 *   put:
 *     summary: Update a status
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Status not found
 */
router.put('/:id', updateStatus);

/**
 * @swagger
 * /api/statuses/{id}:
 *   delete:
 *     summary: Delete a status
 *     tags: [Statuses]
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
 *         description: Status deleted successfully
 *       404:
 *         description: Status not found
 */
router.delete('/:id', deleteStatus);

module.exports = router;
