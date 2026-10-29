const express = require('express');
const router = express.Router();
const {
  getStatus,
  generateQr,
  disconnect
} = require('../controllers/qrWhatsappController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', getStatus);
router.post('/generate-qr', generateQr);
router.post('/disconnect', disconnect);

module.exports = router;
