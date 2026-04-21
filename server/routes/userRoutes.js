const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateSubscription
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

/**
 * @swagger
 * /api/users/subscription:
 *   put:
 *     summary: Update user subscription
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *               subscriptionEndDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */
router.put('/subscription', protect, updateSubscription);

module.exports = router;
