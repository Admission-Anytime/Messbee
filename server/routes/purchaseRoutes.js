const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPurchases,
  getPurchase,
  createPurchase
} = require('../controllers/purchaseController');

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(createPurchase);

router.route('/:id')
  .get(getPurchase);

module.exports = router;
