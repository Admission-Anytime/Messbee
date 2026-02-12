const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/chats/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations with last message and unread count
 */
router.get('/conversations', getConversations);

/**
 * @swagger
 * /api/chats/{contactId}/messages:
 *   get:
 *     summary: Get messages for a contact
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
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
 *                     $ref: '#/components/schemas/Message'
 *   post:
 *     summary: Send a message to a contact
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
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
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, document, audio, video]
 *               mediaUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.route('/:contactId/messages')
  .get(getMessages)
  .post(sendMessage);

/**
 * @swagger
 * /api/chats/{contactId}/read:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/:contactId/read', markAsRead);

module.exports = router;
