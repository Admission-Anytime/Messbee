const express = require('express');
const router = express.Router();
const {
  getStatus,
  generateQr,
  disconnect,
  getPairingCode,
  sendBroadcast,
  getAutoResponder,
  updateAutoResponder
} = require('../controllers/qrWhatsappController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', getStatus);
router.post('/generate-qr', generateQr);
router.post('/disconnect', disconnect);
router.post('/pairing-code', getPairingCode);
router.post('/broadcast', sendBroadcast);
router.get('/auto-responder', getAutoResponder);
router.put('/auto-responder', updateAutoResponder);

module.exports = router;
