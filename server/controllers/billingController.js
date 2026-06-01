const Transaction = require('../models/Transaction');
const User = require('../models/User');
const razorpayService = require('../services/razorpayService');

// @desc    Create a new transaction
// @route   POST /api/billing/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { desc, amount, status, wccAmount } = req.body;

    // Generate a unique transaction ID like TXN-49281948
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const transaction = await Transaction.create({
      user: req.user.id,
      transactionId,
      desc,
      amount,
      status: status || 'Paid'
    });

    // Automatically update user WCC credits if this is a top-up or campaign launch
    // Handle cases where user.credits might be null (which breaks $inc)
    const userDoc = await User.findById(req.user.id);
    const currentCredits = userDoc.credits ? Number(userDoc.credits) : 0;

    if (desc && desc.toLowerCase().includes("wcc top-up credit") && wccAmount) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { credits: currentCredits + Number(wccAmount) }
      });
    } else if (desc && (desc.toLowerCase().includes("campaign launch") || desc.toLowerCase().includes("campaign resend"))) {
      // Amount is negative for campaigns
      await User.findByIdAndUpdate(req.user.id, {
        $set: { credits: currentCredits + Number(amount) }
      });
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/billing/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// RAZORPAY INTEGRATION METHODS
// ============================================================

/**
 * @desc    Create Razorpay order for payment
 * @route   POST /api/billing/razorpay/create-order
 * @access  Private
 * @body    {
 *   scenario: 'subscription' | 'credit_topup' | 'campaign_cost',
 *   amount: number (in rupees),
 *   planType?: string (for subscription),
 *   billingCycle?: string (for subscription),
 *   topupAmount?: number (for credit topup),
 *   campaignId?: string (for campaign cost)
 * }
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { scenario, amount, planType, billingCycle, topupAmount, campaignId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!scenario || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Scenario and amount are required'
      });
    }

    // Generate unique transaction ID (receipt)
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Create order with Razorpay
    const orderResult = await razorpayService.createOrder(
      amount,
      'INR',
      transactionId,
      {
        scenario,
        planType,
        billingCycle,
        topupAmount,
        campaignId,
        userId
      }
    );

    // Create transaction in DB with Processing status
    const transaction = await Transaction.create({
      user: userId,
      transactionId,
      desc: `${scenario} - Razorpay Order ${orderResult.orderId}`,
      amount,
      status: 'Processing',
      razorpayOrderId: orderResult.orderId,
      metadata: {
        scenario,
        planType,
        billingCycle,
        topupAmount,
        campaignId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        transactionId,
        orderId: orderResult.orderId,
        amount: orderResult.amount / 100, // Convert paisa to rupees for display
        currency: orderResult.currency,
        keyId: process.env.RAZORPAY_KEY_ID // Client needs this for checkout
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment and update transaction
 * @route   POST /api/billing/razorpay/verify-payment
 * @access  Private
 * @body    {
 *   orderId: string,
 *   paymentId: string,
 *   signature: string,
 *   transactionId: string
 * }
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, transactionId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!orderId || !paymentId || !signature || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, Signature, and Transaction ID are required'
      });
    }

    // Verify signature
    const isSignatureValid = razorpayService.verifySignature(orderId, paymentId, signature);
    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find and update transaction
    let transaction = await Transaction.findOne({
      transactionId,
      user: userId,
      razorpayOrderId: orderId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Fetch payment details from Razorpay to verify
    const paymentDetails = await razorpayService.getPaymentDetails(paymentId);

    // Update transaction with payment details
    transaction.razorpayPaymentId = paymentId;
    transaction.razorpaySignature = signature;
    transaction.status = 'Paid';
    transaction.metadata.paymentMethod = paymentDetails.method;
    await transaction.save();

    // Update user credits based on transaction scenario
    const userDoc = await User.findById(userId);
    const currentCredits = userDoc.credits ? Number(userDoc.credits) : 0;

    const { scenario, topupAmount, billingCycle, planType } = transaction.metadata;

    if (scenario === 'credit_topup' && topupAmount) {
      // Add credits for top-up
      await User.findByIdAndUpdate(userId, {
        $set: { credits: currentCredits + Number(topupAmount) }
      });
    } else if (scenario === 'subscription') {
      // Update subscription plan and end date
      const daysToAdd = billingCycle === 'quarterly' ? 90 : billingCycle === 'yearly' ? 365 : 30;
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + daysToAdd);

      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: planType || 'basic',
        subscriptionEndDate: newEndDate
      });
    } else if (scenario === 'campaign_cost') {
      // Deduct credits for campaign
      await User.findByIdAndUpdate(userId, {
        $set: { credits: currentCredits + Number(transaction.amount) }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and transaction updated successfully',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        paymentId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/billing/razorpay/webhook
 * @access  Public (but signature verified)
 */
exports.razorpayWebhook = async (req, res, next) => {
  try {
    // Get raw body and signature for verification
    const webhookBody = req.rawBody || JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Verify webhook signature
    const isSignatureValid = razorpayService.verifyWebhookSignature(
      webhookBody,
      webhookSignature
    );

    if (!isSignatureValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const data = req.body.data;

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
      case 'payment.captured':
        await handlePaymentAuthorized(data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data);
        break;

      case 'subscription.charged_successfully':
        await handleSubscriptionCharged(data);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(data);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    // Still respond with 200 to prevent Razorpay from retrying
    console.error('Webhook processing error:', error);
    res.status(200).json({
      success: false,
      message: 'Webhook processed with errors'
    });
  }
};

/**
 * Handle payment.authorized or payment.captured event
 */
async function handlePaymentAuthorized(data) {
  const payment = data.payment;
  const notes = payment.notes || {};
  const transactionId = notes.transactionId || payment.receipt;

  if (!transactionId) {
    console.warn('No transaction ID found in payment notes');
    return;
  }

  // Find and update transaction
  const transaction = await Transaction.findOne({
    transactionId: transactionId
  });

  if (!transaction) {
    console.warn(`Transaction not found: ${transactionId}`);
    return;
  }

  // Update transaction
  transaction.razorpayPaymentId = payment.id;
  transaction.status = 'Paid';
  transaction.metadata.paymentMethod = payment.method;
  await transaction.save();

  // Update user credits
  const user = await User.findById(transaction.user);
  if (!user) return;

  const currentCredits = user.credits ? Number(user.credits) : 0;
  const { scenario, topupAmount, billingCycle, planType } = transaction.metadata;

  if (scenario === 'credit_topup' && topupAmount) {
    await User.findByIdAndUpdate(transaction.user, {
      $set: { credits: currentCredits + Number(topupAmount) }
    });
  } else if (scenario === 'subscription') {
    const daysToAdd =
      billingCycle === 'quarterly'
        ? 90
        : billingCycle === 'yearly'
        ? 365
        : 30;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    await User.findByIdAndUpdate(transaction.user, {
      subscriptionPlan: planType || 'basic',
      subscriptionEndDate: newEndDate
    });
  } else if (scenario === 'campaign_cost') {
    await User.findByIdAndUpdate(transaction.user, {
      $set: { credits: currentCredits + Number(transaction.amount) }
    });
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(data) {
  const payment = data.payment;
  const notes = payment.notes || {};
  const transactionId = notes.transactionId || payment.receipt;

  if (!transactionId) {
    console.warn('No transaction ID found in payment notes');
    return;
  }

  // Find and update transaction
  const transaction = await Transaction.findOne({
    transactionId: transactionId
  });

  if (!transaction) {
    console.warn(`Transaction not found: ${transactionId}`);
    return;
  }

  // Update transaction status to Failed
  transaction.status = 'Failed';
  transaction.razorpayPaymentId = payment.id;
  transaction.metadata.failureReason = payment.description || 'Payment failed';
  await transaction.save();

  console.log(`Payment failed for transaction: ${transactionId}`);
}

/**
 * Handle subscription.charged_successfully event (for recurring billing)
 */
async function handleSubscriptionCharged(data) {
  const subscription = data.subscription;
  const payment = data.payment;
  const notes = subscription.notes || {};

  if (!notes.userId) {
    console.warn('No user ID found in subscription notes');
    return;
  }

  // Create a new transaction for the subscription charge
  const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const transaction = await Transaction.create({
    user: notes.userId,
    transactionId,
    desc: `Subscription recurring charge - ${subscription.plan_id}`,
    amount: payment.amount / 100, // Convert paisa to rupees
    status: 'Paid',
    razorpayPaymentId: payment.id,
    razorpayOrderId: payment.order_id,
    metadata: {
      scenario: 'subscription',
      subscriptionId: subscription.id,
      paymentMethod: payment.method
    }
  });

  console.log(
    `Subscription charged successfully for user: ${notes.userId}, transaction: ${transactionId}`
  );
}

/**
 * Handle subscription.halted event
 */
async function handleSubscriptionHalted(data) {
  const subscription = data.subscription;
  const notes = subscription.notes || {};

  if (!notes.userId) {
    console.warn('No user ID found in subscription notes');
    return;
  }

  // Update user subscription status
  await User.findByIdAndUpdate(notes.userId, {
    subscriptionPlan: 'free'
  });

  console.log(`Subscription halted for user: ${notes.userId}`);
}
