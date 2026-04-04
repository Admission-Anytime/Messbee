const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect } = require('../middleware/auth');

/**
 * WhatsApp Business API Routes
 */

// Webhook verification (GET) - WhatsApp will call this to verify your webhook
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook handler (POST) - Receive messages and status updates from WhatsApp
router.post('/webhook', whatsappController.handleWebhook);

// Test WhatsApp API connection (Protected route)
router.get('/test-connection', protect, whatsappController.testConnection);

// Register WhatsApp number (Protected route)
router.post('/register', protect, whatsappController.registerNumber);

// Deregister WhatsApp number (Protected route)
router.post('/deregister', protect, whatsappController.deregisterNumber);

// Check message delivery status (Protected route)
router.get('/message-status/:messageId', protect, whatsappController.getMessageStatus);

// Send WhatsApp message from dashboard (Protected route)
router.post('/send', protect, whatsappController.sendWhatsAppMessage);

// Send template message (Protected route)
router.post('/send-template', protect, whatsappController.sendTemplateMessage);

// Debug: Test send to a number and return full WhatsApp API error (Protected route)
router.post('/debug-send', protect, async (req, res) => {
  const { to, message = 'Test message from Messbee debug' } = req.body;
  const whatsappService = require('../services/whatsappService');
  const { normalizePhoneNumber } = require('../utils/phoneHelper');
  const normalized = normalizePhoneNumber(to);
  console.log(`🔍 DEBUG SEND: Original="${to}" → Normalized="${normalized}"`);
  const result = await whatsappService.sendTextMessage(normalized, message);
  console.log('🔍 DEBUG SEND RESULT:', JSON.stringify(result, null, 2));
  res.json({
    input: to,
    normalized,
    result
  });
});

module.exports = router;
