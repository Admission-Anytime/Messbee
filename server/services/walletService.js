const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getMessageCost, WHATSAPP_PRICING } = require('../config/pricingConfig');
const { getIO } = require('../config/socket');

/**
 * Resolve the tenant owner account holding the wallet balance
 */
async function resolveTenantUser(tenantId) {
  if (!tenantId) return null;
  let user = null;
  if (mongoose.Types.ObjectId.isValid(tenantId)) {
    user = await User.findById(tenantId);
  }
  if (!user) {
    user = await User.findOne({
      $or: [{ tenantId: tenantId }, { _id: tenantId }]
    });
  }
  // If this user is an agent/sub-account with a parent tenant, resolve to the parent tenant owner
  if (user && user.tenantId && user.tenantId.toString() !== user._id.toString()) {
    const parent = await User.findById(user.tenantId);
    if (parent) return parent;
  }
  return user;
}

/**
 * Check if a tenant has sufficient available credits
 */
async function hasSufficientCredits(tenantId, requiredCost) {
  if (!tenantId) return false;

  const user = await resolveTenantUser(tenantId);
  if (!user) return false;

  const currentCredits = Number(user.credits) || 0;
  const reserved = Number(user.reservedCredits) || 0;
  const available = currentCredits - reserved;
  const cost = Number(requiredCost) || 0;

  // Credits must be strictly positive and cover the required cost
  if (available <= 0) return false;
  return available >= cost;
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

    const tenantUser = await resolveTenantUser(tenantId);
    if (!tenantUser) return { success: false, reason: 'User not found' };

    const cost = getMessageCost(category, recipientPhone, tenantUser?.customPricing);
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

    // 1. If user already has 0 or negative balance, refuse deduction and ensure 0
    if ((Number(tenantUser.credits) || 0) <= 0) {
      if (tenantUser.credits < 0) {
        await User.findByIdAndUpdate(tenantUser._id, { $set: { credits: 0 } });
      }
      return { success: false, reason: 'Insufficient credits (balance is 0)', cost: 0, newBalance: 0 };
    }

    // 2. Atomic deduction: only decrement if credits >= cost
    let updatedUser = await User.findOneAndUpdate(
      { _id: tenantUser._id, credits: { $gte: cost } },
      { $inc: incObject },
      { new: true }
    );

    // 3. If remaining balance was positive but less than cost, drain to 0 without going negative
    if (!updatedUser) {
      const freshUser = await User.findById(tenantUser._id).select('credits');
      const remCredits = Number(freshUser?.credits) || 0;
      if (remCredits > 0) {
        const usageInc = { ...incObject };
        delete usageInc.credits;
        usageInc['messageUsage.totalSpent'] = remCredits;
        if (usageInc[`messageUsage.${catKey}.costDeducted`]) {
          usageInc[`messageUsage.${catKey}.costDeducted`] = remCredits;
        }
        updatedUser = await User.findByIdAndUpdate(
          tenantUser._id,
          { $inc: usageInc, $set: { credits: 0 } },
          { new: true }
        );
      } else {
        await User.findByIdAndUpdate(tenantUser._id, { $set: { credits: 0 } });
        return { success: false, reason: 'Insufficient credits in wallet', cost: 0, newBalance: 0 };
      }
    }

    if (!updatedUser) return { success: false, reason: 'User not found' };

    // Final safety guard: ensure credits is never below 0
    if (updatedUser.credits < 0) {
      await User.findByIdAndUpdate(tenantUser._id, { $set: { credits: 0 } });
      updatedUser.credits = 0;
    }

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
    const user = await resolveTenantUser(tenantId);
    if (!user) return { success: false, message: 'User not found' };

    const currentCredits = Number(user.credits) || 0;
    const reserved = Math.max(0, Number(user.reservedCredits) || 0);
    const available = currentCredits - reserved;
    if (available <= 0 || available < totalEstimatedCost) {
      return {
        success: false,
        message: `Insufficient WCC credits. Required: ₹${totalEstimatedCost.toFixed(2)}, Available: ₹${Math.max(0, available).toFixed(2)}`
      };
    }

    // Place hold
    await User.findByIdAndUpdate(user._id, {
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
    const user = await resolveTenantUser(tenantId);
    if (!user) return;
    const updated = await User.findByIdAndUpdate(user._id, {
      $inc: { reservedCredits: -totalEstimatedCost }
    }, { new: true });

    if (updated && updated.reservedCredits < 0) {
      await User.findByIdAndUpdate(user._id, { $set: { reservedCredits: 0 } });
    }
  } catch (error) {
    console.error('Error releasing reservation:', error.message);
  }
}

/**
 * Refund failed message credits back to user
 */
async function refundFailedMessage(tenantId, messageId, category, recipientPhone) {
  try {
    const tenantUser = await resolveTenantUser(tenantId);
    if (!tenantUser) return { success: false, reason: 'User not found' };

    const cost = getMessageCost(category, recipientPhone, tenantUser?.customPricing);
    const catKey = String(category).toLowerCase();

    const incObject = {
      credits: cost,
      'messageUsage.totalSpent': -cost
    };

    if (['marketing', 'utility', 'authentication', 'service'].includes(catKey)) {
      incObject[`messageUsage.${catKey}.costDeducted`] = -cost;
    }

    const updatedUser = await User.findByIdAndUpdate(
      tenantUser._id,
      { $inc: incObject },
      { new: true }
    );

    // Audit log refund transaction
    const transactionId = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const safeMessageId = (messageId && mongoose.Types.ObjectId.isValid(messageId)) ? messageId : undefined;
    await Transaction.create({
      user: tenantUser._id,
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
