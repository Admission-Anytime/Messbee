const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route('/transactions')
  .post(createTransaction)
  .get(getTransactions);

module.exports = router;
