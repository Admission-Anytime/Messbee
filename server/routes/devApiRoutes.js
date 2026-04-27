const express = require('express');
const router = express.Router();
const {
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getWebhookConfig,
  saveWebhookConfig,
  toggleWebhookEvent
} = require('../controllers/devApiController');

const { protect } = require('../middleware/auth');

// Protect all dev API routes
router.use(protect);

// API Keys routes
router.route('/keys')
  .get(getApiKeys)
  .post(createApiKey);

router.route('/keys/:id')
  .delete(deleteApiKey);

// Webhook routes
router.route('/webhook')
  .get(getWebhookConfig)
  .post(saveWebhookConfig);

router.route('/webhook/events/:eventId')
  .patch(toggleWebhookEvent);

module.exports = router;
