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
