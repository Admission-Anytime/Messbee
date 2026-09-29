const express = require('express');
const { handleApiEventTrigger } = require('../controllers/webhook.controller.js');
const whatsappController = require('../controllers/whatsappController.js');

const router = express.Router();

// Webhook verification (GET) — Meta calls this when verifying Callback URL
router.get('/', whatsappController.verifyWebhook);
router.get('/webhook', whatsappController.verifyWebhook);

// Incoming events & messages (POST) — Meta sends messages, button clicks, status updates
router.post('/', whatsappController.handleWebhook);
router.post('/webhook', whatsappController.handleWebhook);

// Allow external API integrations to trigger flows
router.post('/event', handleApiEventTrigger);

module.exports = router;
