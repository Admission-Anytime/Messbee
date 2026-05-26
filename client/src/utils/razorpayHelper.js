import axios from 'axios';

/**
 * Razorpay Payment Integration Helper for Client-Side
 * 
 * This utility module provides helper functions for integrating Razorpay
 * payments into your React components.
 * 
 * Usage:
 * import { initiatePayment } from './razorpayHelper';
 * 
 * // In your component
 * const handlePayment = async () => {
 *   await initiatePayment('subscription', 5000, { planType: 'professional' });
 * };
 */

/**
 * Initiate a payment flow with Razorpay
 * 
 * @param {string} scenario - Payment scenario: 'subscription', 'credit_topup', 'campaign_cost'
 * @param {number} amount - Amount in INR (rupees)
 * @param {object} options - Additional options
 * @param {function} onSuccess - Callback on successful payment
 * @param {function} onFailure - Callback on failed payment
 * @returns {Promise<object>} Payment result
 */
export const initiatePayment = async (
  scenario,
  amount,
  options = {},
  onSuccess,
  onFailure
) => {
  try {
    // Step 1: Create order on backend
    const createOrderResponse = await axios.post('/billing/razorpay/create-order', {
      scenario,
      amount,
      ...options
    });

    const { orderId, keyId, transactionId } = createOrderResponse.data.data;

    // Step 2: Create Razorpay checkout options
    const razorpayOptions = {
      key: keyId,
      amount: amount * 100, // Convert to paisa
      currency: 'INR',
      name: 'MessBee',
      description: options.description || `${scenario} - ₹${amount}`,
      order_id: orderId,
      handler: async (response) => {
        try {
          // Step 3: Verify payment signature
          const verifyResponse = await axios.post(
            '/billing/razorpay/verify-payment',
            {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              transactionId
            }
          );

          if (verifyResponse.data.success) {
            if (onSuccess) {
              onSuccess(verifyResponse.data.data);
            }
            return {
              success: true,
              data: verifyResponse.data.data
            };
          }
        } catch (error) {
          if (onFailure) {
            onFailure(error);
          }
          throw error;
        }
      },
      prefill: options.prefill || {},
      theme: {
        color: '#10B981' // Emerald green
      },
      modal: {
        ondismiss: () => {
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      }
    };

    // Step 4: Open Razorpay checkout modal
    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    console.error('Payment initialization error:', error);
    if (onFailure) {
      onFailure(error);
    }
    throw error;
  }
};

/**
 * Initiate a subscription payment
 * 
 * @param {string} planType - 'basic', 'professional', 'enterprise'
 * @param {string} billingCycle - 'quarterly' or 'yearly'
 * @param {number} totalDue - Total amount after discount
 * @param {object} userDetails - { name, email, phone }
 * @returns {Promise<object>}
 */
export const initiateSubscriptionPayment = async (
  planType,
  billingCycle,
  totalDue,
  userDetails = {}
) => {
  return initiatePayment(
    'subscription',
    totalDue,
    {
      planType: planType.toLowerCase(),
      billingCycle,
      description: `${planType} Plan - ${billingCycle}`,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone
      }
    }
  );
};

/**
 * Initiate a credit top-up payment
 * 
 * @param {number} amount - Amount in INR
 * @param {number} credits - Credits to add
 * @param {object} userDetails - { name, email, phone }
 * @returns {Promise<object>}
 */
export const initiateCreditTopup = async (amount, credits, userDetails = {}) => {
  return initiatePayment(
    'credit_topup',
    amount,
    {
      topupAmount: credits,
      description: `Add ₹${credits} WCC Credits`,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone
      }
    }
  );
};

/**
 * Initiate a campaign cost payment
 * 
 * @param {string} campaignId - Campaign MongoDB ObjectId
 * @param {number} amount - Cost in INR
 * @param {object} userDetails - { name, email, phone }
 * @returns {Promise<object>}
 */
export const initiateCampaignPayment = async (campaignId, amount, userDetails = {}) => {
  return initiatePayment(
    'campaign_cost',
    amount,
    {
      campaignId,
      description: `Campaign Cost - ₹${amount}`,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone
      }
    }
  );
};

/**
 * Get transaction history
 * 
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionHistory = async () => {
  try {
    const response = await axios.get('/billing/transactions');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

/**
 * Create a manual transaction (non-payment)
 * Useful for admin operations or free plan upgrades
 * 
 * @param {string} description - Transaction description
 * @param {number} amount - Amount
 * @param {string} status - 'Paid', 'Processing', 'Failed'
 * @returns {Promise<object>}
 */
export const createManualTransaction = async (description, amount, status = 'Paid') => {
  try {
    const response = await axios.post('/billing/transactions', {
      desc: description,
      amount,
      status
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
};

/**
 * Format currency for display
 * 
 * @param {number} amount - Amount in INR
 * @returns {string} Formatted currency string (e.g., "₹1,00,000")
 */
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate GST
 * 
 * @param {number} amount - Base amount
 * @param {number} rate - GST rate (default 18%)
 * @returns {number} GST amount
 */
export const calculateGST = (amount, rate = 18) => {
  return Math.round(amount * (rate / 100));
};

/**
 * Get plan pricing with discount
 * 
 * @param {number} basePrice - Base monthly price
 * @param {string} billingCycle - 'quarterly' or 'yearly'
 * @returns {object} { baseAmount, discountPercent, discountedAmount, gst, total }
 */
export const getPlanPricing = (basePrice, billingCycle = 'yearly') => {
  const months = billingCycle === 'yearly' ? 12 : 3;
  const discount = billingCycle === 'yearly' ? 35 : 25;
  const baseAmount = basePrice * months;
  const discountedAmount = Math.round(baseAmount * (1 - discount / 100));
  const gst = calculateGST(discountedAmount);
  const total = discountedAmount + gst;

  return {
    baseAmount,
    discountPercent: discount,
    discountedAmount,
    gst,
    total,
    savings: baseAmount - discountedAmount
  };
};

export default {
  initiatePayment,
  initiateSubscriptionPayment,
  initiateCreditTopup,
  initiateCampaignPayment,
  getTransactionHistory,
  createManualTransaction,
  formatINR,
  calculateGST,
  getPlanPricing
};
