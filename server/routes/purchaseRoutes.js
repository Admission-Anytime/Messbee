const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPurchases,
  getPurchase,
  createPurchase
} = require('../controllers/purchaseController');
const { scanInvoice } = require('../controllers/ocrController');

router.use(protect);

router.post('/scan-invoice', upload.single('invoice'), scanInvoice);

router.route('/')
  .get(getPurchases)
  .post(createPurchase);

router.route('/:id')
  .get(getPurchase);

module.exports = router;
