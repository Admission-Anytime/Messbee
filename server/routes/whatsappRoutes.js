const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect, authorize } = require('../middleware/auth');
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

// Register WhatsApp number (Protected route, Admin only)
router.post('/register', protect, authorize('ADMIN', 'admin'), whatsappController.registerNumber);

// Connect via OAuth Token (Protected route, Admin only)
router.post('/connect-oauth', protect, authorize('ADMIN', 'admin'), whatsappController.connectOAuthToken);

// Embedded Signup Callback (Protected route, Admin only)
router.post('/embedded-signup-callback', protect, authorize('ADMIN', 'admin'), whatsappController.embeddedSignupCallback);

// Connect Manually via Tokens (Protected route, Admin only)
router.post('/connect-manual', protect, authorize('ADMIN', 'admin'), whatsappController.connectManual);

// Deregister WhatsApp number (Protected route, Admin only)
router.post('/deregister', protect, authorize('ADMIN', 'admin'), whatsappController.deregisterNumber);

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

// Get connected WhatsApp Channels (Real DB Data with Local Fallback)
router.get('/channels', protect, async (req, res) => {
  try {
    const Channel = require('../models/Channel');
    const tenantId = req.user.tenantId || req.user._id;
    const channels = await Channel.find({ tenantId });

    // Transform so modal always gets `name` and `phoneNumber` fields
    const transformed = channels.map(ch => ({
      _id:         ch._id,
      name:        ch.name || ch.metadata?.name || 'WhatsApp Business',
      phoneNumber: ch.phoneNumber || ch.activeWhatsappPhoneNumberId,
      status:      ch.metadata?.status || 'CONNECTED',
      wabaId:      ch.metadata?.wabaId
    }));

    res.status(200).json(transformed);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching channels' });
  }
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

// ── DEV-ONLY: Seed Channel for a specific user by email ───────────────────────
// Usage: GET /api/whatsapp/dev-seed-channel?email=rahulyadav0000777@gmail.com&secret=messbee_seed_2026
if (process.env.NODE_ENV !== 'production') {
  router.get('/dev-seed-channel', async (req, res) => {
    try {
      const { email, secret } = req.query;
      if (secret !== 'messbee_seed_2026') {
        return res.status(403).json({ success: false, message: 'Invalid secret' });
      }
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const User    = require('../models/User');
      const Channel = require('../models/Channel');

      const user = await User.findOne({ email });
      if (!user) {
        const allUsers = await User.find({}, { email: 1, name: 1 }).limit(10);
        return res.status(404).json({
          success: false,
          message: `User not found: ${email}`,
          existingUsers: allUsers.map(u => u.email)
        });
      }

      const tenantId      = user.tenantId || user._id;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
      const wabaId        = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const apiVersion    = process.env.WHATSAPP_API_VERSION || 'v18.0';

      // ── Dynamically fetch actual phone number & info from Meta Graph API ──
      let actualPhoneNumber = phoneNumberId; // fallback
      let metaDisplayName   = user.name || 'WhatsApp Business';
      let metaQuality       = 'UNKNOWN';
      let metaStatus        = 'CONNECTED';

      try {
        const axios = require('axios');
        const { data: metaData } = await axios.get(
          `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`,
          {
            params: {
              fields: 'display_phone_number,verified_name,quality_rating,status',
              access_token: accessToken
            },
            timeout: 8000
          }
        );
        if (metaData.display_phone_number) actualPhoneNumber = metaData.display_phone_number;
        if (metaData.verified_name)        metaDisplayName   = metaData.verified_name;
        if (metaData.quality_rating)       metaQuality       = metaData.quality_rating;
        if (metaData.status)               metaStatus        = metaData.status;
        console.log(`[Seed] Meta API response: ${JSON.stringify(metaData)}`);
      } catch (metaErr) {
        console.warn(`[Seed] Meta API fetch failed (using fallback): ${metaErr.message}`);
      }

      const channel = await Channel.findOneAndUpdate(
        { activeWhatsappPhoneNumberId: phoneNumberId },
        {
          tenantId,
          activeWhatsappPhoneNumberId: phoneNumberId,
          metaAccessToken:          accessToken,
          name:                     metaDisplayName,
          phoneNumber:              actualPhoneNumber,   // ✅ Dynamic from Meta
          'metadata.name':          metaDisplayName,
          'metadata.wabaId':        wabaId,
          'metadata.status':        metaStatus,
          'metadata.qualityRating': metaQuality
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: '✅ Channel seeded successfully!',
        user:    { name: user.name, email: user.email, tenantId },
        channel: {
          _id:           channel._id,
          phoneNumberId: channel.activeWhatsappPhoneNumberId,
          phoneNumber:   channel.phoneNumber,
          name:          channel.name,
          status:        channel.metadata?.status,
          qualityRating: channel.metadata?.qualityRating
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = router;
