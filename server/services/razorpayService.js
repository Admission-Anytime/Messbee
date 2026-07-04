const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paisa (multiply by 100 for rupees)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID (transaction ID)
 * @param {object} notes - Additional metadata
 * @returns {Promise<object>} Order details from Razorpay
 */
exports.createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paisa
      currency,
      receipt,
      notes,
      payment_capture: 1 // Auto-capture payment
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from payment response
 * @returns {boolean} True if signature is valid
 */
exports.verifySignature = (orderId, paymentId, signature) => {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
};

/**
 * Verify webhook signature
 * @param {string} webhookBody - Raw webhook body as string
 * @param {string} webhookSignature - X-Razorpay-Signature header value
 * @returns {boolean} True if webhook signature is valid
 */
exports.verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
exports.getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      notes: payment.notes
    };
  } catch (error) {
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

/**
 * Create a recurring subscription plan
 * @param {number} amount - Amount in paisa
 * @param {string} period - Billing period (monthly, quarterly, yearly)
 * @param {string} planName - Plan name/description
 * @returns {Promise<object>} Plan details
 */
exports.createSubscriptionPlan = async (amount, period, planName) => {
  try {
    // Convert billing period to months
    const periodMap = {
      monthly: 'monthly',
      quarterly: 'quarterly',
      yearly: 'yearly'
    };

    const plan = await razorpay.plans.create({
      period: periodMap[period] || 'monthly',
      interval: 1,
      amount: Math.round(amount * 100), // Convert to paisa
      currency: 'INR',
      description: planName
    });

    return {
      success: true,
      planId: plan.id,
      amount: plan.amount,
      period: plan.period,
      interval: plan.interval
    };
  } catch (error) {
    throw new Error(`Failed to create subscription plan: ${error.message}`);
  }
};

/**
 * Create a recurring subscription for a customer
 * @param {string} customerId - Razorpay customer ID
 * @param {string} planId - Razorpay plan ID
 * @param {number} quantity - Number of units
 * @param {object} notes - Additional metadata
 * @returns {Promise<object>} Subscription details
 */
exports.createSubscription = async (customerId, planId, quantity = 1, notes = {}) => {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity,
      total_count: 12, // Max billing cycles
      notes
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      customerId: subscription.customer_id,
      planId: subscription.plan_id,
      status: subscription.status
    };
  } catch (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

/**
 * Create a customer in Razorpay
 * @param {string} email - Customer email
 * @param {string} contact - Customer phone number
 * @param {string} name - Customer name
 * @returns {Promise<object>} Customer details
 */
exports.createCustomer = async (email, contact, name) => {
  try {
    const customer = await razorpay.customers.create({
      email,
      contact,
      name
    });

    return {
      success: true,
      customerId: customer.id,
      email: customer.email,
      contact: customer.contact,
      name: customer.name
    };
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<object>} Order details
 */
exports.getOrderDetails = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
      created_at: order.created_at
    };
  } catch (error) {
    throw new Error(`Failed to fetch order details: ${error.message}`);
  }
};

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in rupees (optional, full refund if not provided)
 * @returns {Promise<object>} Refund details
 */
exports.refundPayment = async (paymentId, amount = null) => {
  try {
    const refundData = amount ? { amount: Math.round(amount * 100) } : {};
    const refund = await razorpay.payments.refund(paymentId, refundData);

    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status
    };
  } catch (error) {
    throw new Error(`Failed to refund payment: ${error.message}`);
  }
};

/**
 * Cross-verify payment by querying Razorpay directly (server-side verification)
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Complete verified payment details
 */
exports.crossVerifyPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status, // 'captured', 'failed', 'refunded', etc.
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      fee: payment.fee,
      tax: payment.tax,
      captured: payment.captured,
      description: payment.description,
      notes: payment.notes,
      acquirerData: payment.acquirer_data,
      createdAt: payment.created_at
    };
  } catch (error) {
    throw new Error(`Cross-verification failed: ${error.message}`);
  }
};
