const qrWhatsappService = require('../services/qrWhatsappService');

/**
 * @desc    Get WhatsApp Web QR session status
 * @route   GET /api/qr-whatsapp/status
 * @access  Private
 */
exports.getStatus = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const result = await qrWhatsappService.getSessionStatus(tenantId);
    res.status(200).json(result);
  } catch (error) {
    console.error('[QrController] getStatus error:', error);
    next(error);
  }
};

/**
 * @desc    Generate new QR code or start session
 * @route   POST /api/qr-whatsapp/generate-qr
 * @access  Private
 */
exports.generateQr = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const result = await qrWhatsappService.startSession(tenantId);
    res.status(200).json(result);
  } catch (error) {
    console.error('[QrController] generateQr error:', error);
    next(error);
  }
};

/**
 * @desc    Disconnect / Unlink WhatsApp Web session
 * @route   POST /api/qr-whatsapp/disconnect
 * @access  Private
 */
exports.disconnect = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const result = await qrWhatsappService.disconnectSession(tenantId);
    res.status(200).json(result);
  } catch (error) {
    console.error('[QrController] disconnect error:', error);
    next(error);
  }
};

/**
 * @desc    Get WhatsApp pairing code via phone number
 * @route   POST /api/qr-whatsapp/pairing-code
 * @access  Private
 */
exports.getPairingCode = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const { phoneNumber } = req.body;
    const result = await qrWhatsappService.requestPairingCode(tenantId, phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error('[QrController] getPairingCode error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send safe throttled batch broadcast
 * @route   POST /api/qr-whatsapp/broadcast
 * @access  Private
 */
exports.sendBroadcast = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const { recipientPhones, messageText, media, intervalSeconds } = req.body;
    const result = await qrWhatsappService.sendBatchBroadcast(tenantId, {
      recipientPhones,
      messageText,
      media,
      intervalSeconds: intervalSeconds || 5
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('[QrController] sendBroadcast error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get auto-responder settings (Welcome & Away messages)
 * @route   GET /api/qr-whatsapp/auto-responder
 * @access  Private
 */
exports.getAutoResponder = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const TenantSettings = require('../models/TenantSettings');
    let settings = await TenantSettings.findOne({ tenantId });
    if (!settings) {
      settings = await TenantSettings.create({ tenantId });
    }
    res.status(200).json({
      success: true,
      data: {
        welcomeMessage: settings.welcomeMessage || { enabled: false, textMessage: 'Welcome! How can we help you today?' },
        awayMessage: settings.awayMessage || {
          enabled: false,
          timezone: 'Asia/Kolkata',
          holidayMode: false,
          textMessage: 'We are currently away and will get back to you soon!',
          workingHours: {
            monday: { isOpen: true, open: '09:00', close: '18:00' },
            tuesday: { isOpen: true, open: '09:00', close: '18:00' },
            wednesday: { isOpen: true, open: '09:00', close: '18:00' },
            thursday: { isOpen: true, open: '09:00', close: '18:00' },
            friday: { isOpen: true, open: '09:00', close: '18:00' },
            saturday: { isOpen: true, open: '09:00', close: '17:00' },
            sunday: { isOpen: false, open: '09:00', close: '17:00' }
          }
        }
      }
    });
  } catch (error) {
    console.error('[QrController] getAutoResponder error:', error);
    next(error);
  }
};

/**
 * @desc    Update auto-responder settings
 * @route   PUT /api/qr-whatsapp/auto-responder
 * @access  Private
 */
exports.updateAutoResponder = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id || req.user.id;
    const { welcomeMessage, awayMessage } = req.body;
    const TenantSettings = require('../models/TenantSettings');
    
    const updateData = {};
    if (welcomeMessage) updateData.welcomeMessage = welcomeMessage;
    if (awayMessage) updateData.awayMessage = awayMessage;

    const updated = await TenantSettings.findOneAndUpdate(
      { tenantId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Auto-responder settings updated successfully',
      data: {
        welcomeMessage: updated.welcomeMessage,
        awayMessage: updated.awayMessage
      }
    });
  } catch (error) {
    console.error('[QrController] updateAutoResponder error:', error);
    next(error);
  }
};
