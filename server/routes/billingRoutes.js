const express = require('express');
const {
  createTransaction,
  getTransactions,
  createRazorpayOrder,
  verifyRazorpayPayment,
  crossVerifyPayment,
  getOrderStatus,
  reconcilePayment,
  razorpayWebhook
} = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook route (public, no auth required)
router.post('/razorpay/webhook', razorpayWebhook);

// Apply protection to all other routes
router.use(protect);

router.route('/transactions').post(createTransaction).get(getTransactions);

// Razorpay integration routes
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify-payment', verifyRazorpayPayment);
router.post('/razorpay/cross-verify', crossVerifyPayment);
router.post('/razorpay/order-status', getOrderStatus);
router.post('/razorpay/reconcile', reconcilePayment);

module.exports = router;
