const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// Connect via OAuth Token (Protected route)
router.post('/connect-oauth', protect, whatsappController.connectOAuthToken);

// Connect Manually via Tokens (Protected route)
router.post('/connect-manual', protect, whatsappController.connectManual);

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

/**
 * @swagger
 * /api/whatsapp/templates/upload-media:
 *   post:
 *     summary: Upload media for WhatsApp template header
 *     description: Uploads an image, video, or document to be used as a header in a WhatsApp template. Returns the public URL of the uploaded file.
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The media file to upload (image, video, or document)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: number
 *                     url:
 *                       type: string
 *                       description: The public URL of the uploaded file
 *       400:
 *         description: No file uploaded or invalid format
 *       500:
 *         description: Server error
 */
// Upload media for template header (image/video/document) — must come BEFORE /:templateId routes
router.post('/templates/upload-media', protect, upload.single('file'), whatsappController.uploadTemplateMedia);
router.post('/templates/upload-media-by-url', protect, whatsappController.uploadTemplateMediaByUrl);

// Get connected WhatsApp Channels (Mock)
router.get('/channels', protect, (req, res) => {
  res.status(200).json([
    { 
      _id: '609b55b6c00d4334b07e7821', 
      name: 'Main WhatsApp Business', 
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '+1234567890' 
    }
  ]);
});

// Get WhatsApp message templates (Protected route)
router.get('/templates', protect, whatsappController.getTemplates);

// Create a new template (Protected route)
router.post('/templates', protect, whatsappController.createTemplate);

// Get template details (Protected route)
router.get('/templates/:templateId', protect, whatsappController.getTemplateDetails);

// Test send a template (Protected route)
router.post('/test-template', protect, whatsappController.testSendTemplate);

// Update template (Protected route)
router.put('/templates/:templateId', protect, whatsappController.updateTemplate);

// Delete template (Protected route)
router.delete('/templates/:templateId', protect, whatsappController.deleteTemplate);

/**
 * Temporary Testing Routes
 * These routes are for development/testing purposes only
 */

// Temporary test path for WhatsApp API testing (Protected route)
router.post('/test-temp-path', protect, whatsappController.testTempPath);

// Get recent API call logs (Protected route)
router.get('/logs/recent', protect, whatsappController.getRecentAPILogs);

module.exports = router;
