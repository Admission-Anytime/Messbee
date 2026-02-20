const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
// Uncomment when you have auth middleware
// const { protect } = require('../middleware/auth');

/**
 * WhatsApp Business API Routes
 */

// Webhook verification (GET) - WhatsApp will call this to verify your webhook
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook handler (POST) - Receive messages and status updates from WhatsApp
router.post('/webhook', whatsappController.handleWebhook);

// Send WhatsApp message from dashboard (Protected route)
// router.post('/send', protect, whatsappController.sendWhatsAppMessage);
router.post('/send', whatsappController.sendWhatsAppMessage);

// Send template message (Protected route)
// router.post('/send-template', protect, whatsappController.sendTemplateMessage);
router.post('/send-template', whatsappController.sendTemplateMessage);

module.exports = router;
