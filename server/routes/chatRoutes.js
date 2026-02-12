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

router.get('/conversations', getConversations);

router.route('/:contactId/messages')
  .get(getMessages)
  .post(sendMessage);

router.put('/:contactId/read', markAsRead);

module.exports = router;
