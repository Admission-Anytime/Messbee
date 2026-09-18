const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getMessageCost, WHATSAPP_PRICING } = require('../config/pricingConfig');
const { getIO } = require('../config/socket');

/**
 * Check if a tenant has sufficient available credits
 */
async function hasSufficientCredits(tenantId, requiredCost) {
  if (!tenantId) return false;
  const user = await User.findById(tenantId).select('credits reservedCredits');
  if (!user) return false;

  const currentCredits = Number(user.credits) || 0;
  const reserved = Number(user.reservedCredits) || 0;
  const available = currentCredits - reserved;

  return available >= requiredCost;
}

/**
 * Deduct credits for a dispatched WhatsApp message and update category counters
 */
async function deductMessageCredits({
  tenantId,
  category = 'MARKETING',
  recipientPhone = '',
  messageId = null,
  campaignId = null
}) {
  try {
    if (!tenantId) return { success: false, reason: 'No tenantId provided' };

    const userDoc = await User.findById(tenantId).select('customPricing').lean();
    const cost = getMessageCost(category, recipientPhone, userDoc?.customPricing);
    const catKey = String(category).toLowerCase();

    // Deduct from credits and increment category usage counters atomically
    const incObject = {
      credits: -cost,
      'messageUsage.totalMessages': 1,
      'messageUsage.totalSpent': cost
    };

    if (['marketing', 'utility', 'authentication', 'service'].includes(catKey)) {
      incObject[`messageUsage.${catKey}.sentCount`] = 1;
      incObject[`messageUsage.${catKey}.costDeducted`] = cost;
    }

    const updatedUser = await User.findByIdAndUpdate(
      tenantId,
      { $inc: incObject },
      { new: true }
    );

    if (!updatedUser) return { success: false, reason: 'User not found' };

    // Create an audit transaction record
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const safeMessageId = (messageId && mongoose.Types.ObjectId.isValid(messageId)) ? messageId : undefined;
    const safeCampaignId = (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) ? campaignId : undefined;
    await Transaction.create({
      user: tenantId,
      transactionId,
      desc: `WhatsApp ${category} to ${recipientPhone}`,
      amount: -cost,
      status: 'Paid',
      metadata: {
        scenario: 'message_deduction',
        category,
        recipientPhone,
        messageId: safeMessageId,
        campaignId: safeCampaignId,
        topupAmount: -cost
      }
    });

    // Real-time broadcast to tenant room so sidebar/wallet reflects new balance instantly
    try {
      const io = getIO();
      if (io) {
        io.to(`tenant_${tenantId}`).emit('wallet_updated', {
          credits: updatedUser.credits,
          deducted: cost,
          category
        });
      }
    } catch (_) {}

    // 🔔 Low Balance Alert — fire once when credits drop below ₹200
    try {
      const LOW_BALANCE_THRESHOLD = WHATSAPP_PRICING.LOW_BALANCE_THRESHOLD || 200;
      if (
        updatedUser.credits < LOW_BALANCE_THRESHOLD &&
        !updatedUser.lowBalanceAlertSent
      ) {
        // Mark as sent so we don't spam
        await User.findByIdAndUpdate(tenantId, { $set: { lowBalanceAlertSent: true } });

        const io = getIO();
        if (io) {
          io.to(`tenant_${tenantId}`).emit('low_balance_alert', {
            credits: updatedUser.credits,
            threshold: LOW_BALANCE_THRESHOLD,
            message: `⚠️ Low WCC Balance! Only ₹${updatedUser.credits.toFixed(2)} remaining. Please recharge.`
          });
        }
      }
    } catch (_) {}

    return { success: true, cost, newBalance: updatedUser.credits };
  } catch (error) {
    console.error('Wallet deduction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reserve credits for an outgoing Campaign (Concurrency Lock)
 */
async function reserveCampaignCredits(tenantId, campaignId, totalEstimatedCost) {
  try {
    const user = await User.findById(tenantId);
    if (!user) return { success: false, message: 'User not found' };

    const available = (Number(user.credits) || 0) - (Number(user.reservedCredits) || 0);
    if (available < totalEstimatedCost) {
      return {
        success: false,
        message: `Insufficient WCC credits. Required: ₹${totalEstimatedCost.toFixed(2)}, Available: ₹${available.toFixed(2)}`
      };
    }

    // Place hold
    await User.findByIdAndUpdate(tenantId, {
      $inc: { reservedCredits: totalEstimatedCost }
    });

    return { success: true, reserved: totalEstimatedCost };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Release reserved campaign credits when completed
 */
async function releaseCampaignReservation(tenantId, totalEstimatedCost) {
  try {
    await User.findByIdAndUpdate(tenantId, {
      $inc: { reservedCredits: -totalEstimatedCost }
    });
  } catch (error) {
    console.error('Error releasing reservation:', error.message);
  }
}

/**
 * Refund failed message credits back to user
 */
async function refundFailedMessage(tenantId, messageId, category, recipientPhone) {
  try {
    const userDoc = await User.findById(tenantId).select('customPricing').lean();
    const cost = getMessageCost(category, recipientPhone, userDoc?.customPricing);
    const catKey = String(category).toLowerCase();

    const incObject = {
      credits: cost,
      'messageUsage.totalSpent': -cost
    };

    if (['marketing', 'utility', 'authentication', 'service'].includes(catKey)) {
      incObject[`messageUsage.${catKey}.costDeducted`] = -cost;
    }

    const updatedUser = await User.findByIdAndUpdate(
      tenantId,
      { $inc: incObject },
      { new: true }
    );

    // Audit log refund transaction
    const transactionId = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const safeMessageId = (messageId && mongoose.Types.ObjectId.isValid(messageId)) ? messageId : undefined;
    await Transaction.create({
      user: tenantId,
      transactionId,
      desc: `Refund for failed ${category} message to ${recipientPhone}`,
      amount: cost,
      status: 'Paid',
      metadata: {
        scenario: 'refund',
        category,
        recipientPhone,
        messageId: safeMessageId,
        topupAmount: cost
      }
    });

    // Real-time broadcast
    try {
      const io = getIO();
      if (io) {
        io.to(`tenant_${tenantId}`).emit('wallet_updated', {
          credits: updatedUser.credits,
          refunded: cost
        });
      }
    } catch (_) {}

    return { success: true, refunded: cost, newBalance: updatedUser.credits };
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  hasSufficientCredits,
  deductMessageCredits,
  reserveCampaignCredits,
  releaseCampaignReservation,
  refundFailedMessage
};
