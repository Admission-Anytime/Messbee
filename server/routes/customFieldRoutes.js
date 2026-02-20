const express = require('express');
const {
  getCustomFields,
  getCustomField,
  createCustomField,
  updateCustomField,
  toggleCustomField,
  deleteCustomField,
  bulkDeleteCustomFields
} = require('../controllers/customFieldController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomField:
 *       type: object
 *       required:
 *         - name
 *         - key
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Name of the custom field
 *         description:
 *           type: string
 *           description: Description of the custom field
 *         type:
 *           type: string
 *           enum: [Text, Number, Date]
 *           description: Type of the custom field
 *         key:
 *           type: string
 *           description: Technical key (unique per user)
 *         createdBy:
 *           type: string
 *           description: User who created the field
 *         userId:
 *           type: string
 *           description: Owner of the field
 *         isActive:
 *           type: boolean
 *           description: Whether the field is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/custom-fields:
 *   get:
 *     summary: Get all custom fields for the authenticated user
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, description, or key
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomField'
 *                 pagination:
 *                   type: object
 *   post:
 *     summary: Create a new custom field
 *     tags: [Custom Fields]
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
 *               - key
 *             properties:
 *               name:
 *                 type: string
 *                 example: Order Status
 *               description:
 *                 type: string
 *                 example: Current status of the order
 *               type:
 *                 type: string
 *                 enum: [Text, Number, Date]
 *                 default: Text
 *               key:
 *                 type: string
 *                 example: order_status
 *     responses:
 *       201:
 *         description: Custom field created successfully
 *       400:
 *         description: Validation error or duplicate key
 */
router.route('/')
  .get(getCustomFields)
  .post(createCustomField);

/**
 * @swagger
 * /api/custom-fields/bulk-delete:
 *   post:
 *     summary: Delete multiple custom fields
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
 *     responses:
 *       200:
 *         description: Custom fields deleted successfully
 *       400:
 *         description: Invalid request
 */
router.post('/bulk-delete', bulkDeleteCustomFields);

/**
 * @swagger
 * /api/custom-fields/{id}:
 *   get:
 *     summary: Get a single custom field by ID
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Custom field ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomField'
 *       404:
 *         description: Custom field not found
 *   put:
 *     summary: Update a custom field
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Custom field ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Text, Number, Date]
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Custom field updated successfully
 *       404:
 *         description: Custom field not found
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete a custom field
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Custom field ID
 *     responses:
 *       200:
 *         description: Custom field deleted successfully
 *       404:
 *         description: Custom field not found
 */
router.route('/:id')
  .get(getCustomField)
  .put(updateCustomField)
  .delete(deleteCustomField);

/**
 * @swagger
 * /api/custom-fields/{id}/toggle:
 *   patch:
 *     summary: Toggle custom field active status
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Custom field ID
 *     responses:
 *       200:
 *         description: Custom field status toggled successfully
 *       404:
 *         description: Custom field not found
 */
router.patch('/:id/toggle', toggleCustomField);

module.exports = router;
