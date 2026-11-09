const Campaign = require('../models/Campaign');
const CampaignQueue = require('../models/CampaignQueue');
const Contact = require('../models/Contact');
const ContactGroup = require('../models/ContactGroup');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const QrSession = require('../models/QrSession');
const { sendQrMessage, sendQrPresence, getSessionStatus } = require('./qrWhatsappService');
const { getIO } = require('../config/socket');
const path = require('path');
const fs = require('fs');

// In-memory set of currently running campaign IDs to prevent duplicate parallel runners on same campaign
const runningCampaigns = new Set();

/**
 * Calculate delay in milliseconds based on user choice (5m, 10m, 15m, 5s, 10s, 15s)
 */
const getDelayMs = (delayOption, delayInterval, delayUnit) => {
  const opt = String(delayOption || '').toLowerCase().trim();
  const unit = String(delayUnit || '').toLowerCase().trim();
  const interval = Number(delayInterval);

  // If specific minutes selected (5 min, 10 min, 15 min)
  if (opt === '5m' || opt === '5min' || opt === '5 mins' || (interval === 5 && (unit === 'minutes' || unit === 'm'))) {
    return 5 * 60 * 1000; // 5 minutes = 300,000 ms
  }
  if (opt === '10m' || opt === '10min' || opt === '10 mins' || (interval === 10 && (unit === 'minutes' || unit === 'm'))) {
    return 10 * 60 * 1000; // 10 minutes = 600,000 ms
  }
  if (opt === '15m' || opt === '15min' || opt === '15 mins' || (interval === 15 && (unit === 'minutes' || unit === 'm'))) {
    return 15 * 60 * 1000; // 15 minutes = 900,000 ms
  }

  // If specific seconds selected with natural human jitter
  if (opt === '5s' || opt === '5 sec' || (interval === 5 && (unit === 'seconds' || unit === 's'))) {
    return 5000 + Math.floor(Math.random() * 2000); // 5 - 7 seconds
  }
  if (opt === '10s' || opt === '10 sec' || (interval === 10 && (unit === 'seconds' || unit === 's'))) {
    return 10000 + Math.floor(Math.random() * 3000); // 10 - 13 seconds
  }
  if (opt === '15s' || opt === '15 sec' || (interval === 15 && (unit === 'seconds' || unit === 's'))) {
    return 15000 + Math.floor(Math.random() * 4000); // 15 - 19 seconds
  }

  // Fallback safe default: 7 - 12 seconds randomized
  return 7000 + Math.floor(Math.random() * 5000);
};

/**
 * Interruptible sleep that checks every 1000ms if the campaign was paused or cancelled.
 * Guarantees that a 5m, 10m, or 15m delay pauses immediately within 1s if user clicks Pause.
 */
const sleepInterruptible = async (ms, campaignId) => {
  const stepMs = 1000;
  let elapsed = 0;
  const campIdStr = campaignId.toString();

  while (elapsed < ms) {
    if (!runningCampaigns.has(campIdStr)) {
      break;
    }
    const currentStep = Math.min(stepMs, ms - elapsed);
    await new Promise(r => setTimeout(r, currentStep));
    elapsed += currentStep;
  }
};

/**
 * Prepares the CampaignQueue for a campaign and begins execution
 */
const startFreeQrCampaign = async (tenantId, campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found.');
  }

  // 1. Verify WhatsApp QR is active and connected
  const qrStatus = await getSessionStatus(tenantId);
  if (qrStatus.status !== 'CONNECTED') {
    campaign.status = 'paused';
    await campaign.save();
    throw new Error('WhatsApp Web is not connected. Please scan QR in WhatsApp Settings before launching campaigns.');
  }

  // 2. Identify target contacts (lean projection for 90% memory savings)
  let contactDocs = [];

  // Check if ContactGroup is assigned
  if (campaign.contactGroupId) {
    const group = await ContactGroup.findById(campaign.contactGroupId).populate({
      path: 'contacts',
      select: 'name phone whatsapp company email',
      options: { lean: true }
    });
    if (group && Array.isArray(group.contacts)) {
      contactDocs = group.contacts;
    }
  }

  // If no contact group or empty, check targetAudience
  if (contactDocs.length === 0 && Array.isArray(campaign.targetAudience) && campaign.targetAudience.length > 0) {
    contactDocs = await Contact.find({ _id: { $in: campaign.targetAudience } })
      .select('name phone whatsapp company email')
      .lean();
  }

  // If still empty, check audienceFilter
  if (contactDocs.length === 0 && campaign.audienceFilter?.tags?.length > 0) {
    contactDocs = await Contact.find({
      user: tenantId,
      $or: [
        { labels: { $in: campaign.audienceFilter.tags } },
        { tags: { $in: campaign.audienceFilter.tags } }
      ]
    }).select('name phone whatsapp company email').lean();
  }

  // If still empty, fallback to all active contacts for this tenant
  if (contactDocs.length === 0) {
    contactDocs = await Contact.find({
      user: tenantId,
      labels: { $nin: ['_HIDDEN_CAMPAIGN_'] }
    }).select('name phone whatsapp company email').lean();
  }

  // 3. Check existing queue status
  const existingQueueCount = await CampaignQueue.countDocuments({ campaignId });
  const pendingCount = await CampaignQueue.countDocuments({ campaignId, status: 'PENDING' });

  // If queue is already full and all sent/failed, complete it
  if (existingQueueCount > 0 && pendingCount === 0) {
    campaign.status = 'completed';
    await campaign.save();
    return {
      success: true,
      message: 'Campaign has already completed all recipients.',
      campaign
    };
  }

  // Populate queue if not already populated
  if (existingQueueCount === 0) {
    if (contactDocs.length === 0) {
      campaign.status = 'failed';
      await campaign.save();
      throw new Error('No valid recipients found for this campaign.');
    }

    const queueItems = [];
    // Prioritize actual message body over template name slug
    const baseText = campaign.bodyText || campaign.messageTemplate || campaign.name || 'Hello';
    const seenPhones = new Set();

    for (const c of contactDocs) {
      const rawPhone = c.phone || c.whatsapp;
      if (!rawPhone) continue;

      let cleanPhone = rawPhone.toString().replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.replace(/^0+/, '');
      if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
      if (cleanPhone.length === 13 && cleanPhone.startsWith('910')) {
        cleanPhone = '91' + cleanPhone.slice(3);
      }
      if (cleanPhone.length < 10) continue;

      // Prevent duplicate messages to the same phone number within one campaign
      if (seenPhones.has(cleanPhone)) continue;
      seenPhones.add(cleanPhone);

      const contactName = c.name && c.name !== 'Unknown' ? c.name : 'Customer';
      const personalizedMessage = baseText
        .replace(/\{\{\s*name\s*\}\}/gi, contactName)
        .replace(/\{\{\s*1\s*\}\}/g, contactName)
        .replace(/\{\{\s*company\s*\}\}/gi, c.company || '')
        .replace(/\{\{\s*2\s*\}\}/g, c.company || '')
        .replace(/\{\{\s*email\s*\}\}/gi, c.email || '')
        .replace(/\{\{\s*3\s*\}\}/g, c.email || '');

      queueItems.push({
        campaignId: campaign._id,
        user: campaign.user || tenantId,
        tenantId: campaign.tenantId || tenantId,
        contactId: c._id,
        phone: cleanPhone,
        name: contactName,
        personalizedMessage,
        mediaUrl: campaign.headerMediaUrl || null,
        mediaType: campaign.headerType || 'image',
        status: 'PENDING'
      });
    }

    if (queueItems.length > 0) {
      // Chunk inserts in batches of 1000 to easily support 10,000+ recipients without BSON/memory overflow
      const BATCH_SIZE = 1000;
      for (let i = 0; i < queueItems.length; i += BATCH_SIZE) {
        const batch = queueItems.slice(i, i + BATCH_SIZE);
        await CampaignQueue.insertMany(batch, { ordered: false });
      }
    }
  }

  // 4. Update campaign status & metrics (preserve already sent/failed counts on resumed campaigns)
  const totalInQueue = await CampaignQueue.countDocuments({ campaignId });
  const alreadySent = await CampaignQueue.countDocuments({ campaignId, status: 'SENT' });
  const alreadyFailed = await CampaignQueue.countDocuments({ campaignId, status: 'FAILED' });

  campaign.status = 'active';
  campaign.channelType = 'FREE_QR';
  campaign.stats = {
    totalTargeted: totalInQueue,
    sent: alreadySent,
    delivered: alreadySent,
    read: campaign.stats?.read || 0,
    replied: campaign.stats?.replied || 0,
    failed: alreadyFailed
  };
  if (!campaign.startedAt) {
    campaign.startedAt = new Date();
  }
  await campaign.save();

  // 5. Trigger execution worker in background (non-blocking)
  runQueueWorker(tenantId, campaignId).catch(err => {
    console.error(`[FreeQrCampaign] Worker execution error for campaign ${campaignId}:`, err);
  });

  return {
    success: true,
    message: `Campaign started with ${totalInQueue} recipients.`,
    campaign
  };
};

/**
 * Background worker that safely processes pending queue items with human delay
 */
const runQueueWorker = async (tenantId, campaignId) => {
  const campaignKey = campaignId.toString();
  if (runningCampaigns.has(campaignKey)) {
    console.log(`[FreeQrCampaign] Campaign ${campaignKey} is already actively running.`);
    return;
  }

  runningCampaigns.add(campaignKey);
  const tenantIdStr = tenantId.toString();
  const io = getIO();
  const tenantRoom = `tenant_${tenantIdStr}`;

  try {
    // Recover any orphaned PROCESSING items from prior crash/reboot back to PENDING
    await CampaignQueue.updateMany(
      { campaignId, status: 'PROCESSING' },
      { $set: { status: 'PENDING' } }
    );

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      runningCampaigns.delete(campaignKey);
      return;
    }

    const delayMs = getDelayMs(campaign.delayOption, campaign.delayInterval, campaign.delayUnit);
    console.log(`[FreeQrCampaign] Starting queue dispatch for "${campaign.name}" (${campaignKey}). Delay per message: ${Math.round(delayMs / 1000)}s`);

    let processedInSession = 0;

    while (true) {
      // Re-verify campaign status (support pause / cancel)
      const currentCampaign = await Campaign.findById(campaignId);
      if (!currentCampaign || ['paused', 'cancelled', 'PAUSED', 'CANCELLED'].includes(currentCampaign.status)) {
        console.log(`[FreeQrCampaign] Campaign ${campaignKey} paused or cancelled by user.`);
        break;
      }

      // Check session connection with multiple retry grace periods (up to 15 seconds)
      let qrStatus = await getSessionStatus(tenantId);
      if (qrStatus.status !== 'CONNECTED') {
        let connected = false;
        for (let retry = 1; retry <= 3; retry++) {
          console.log(`[FreeQrCampaign] WhatsApp not connected, retrying check in 5s (attempt ${retry}/3)...`);
          await new Promise(r => setTimeout(r, 5000));
          qrStatus = await getSessionStatus(tenantId);
          if (qrStatus.status === 'CONNECTED') {
            connected = true;
            break;
          }
        }

        if (!connected) {
          console.warn(`[FreeQrCampaign] WhatsApp session disconnected for tenant ${tenantIdStr}. Pausing campaign safely.`);
          currentCampaign.status = 'paused';
          await currentCampaign.save();
          if (io) {
            io.to(tenantRoom).to(tenantIdStr).emit('campaign_error', {
              campaignId,
              error: 'WhatsApp Web was disconnected. Campaign paused safely. Please reconnect in Settings and click Resume.'
            });
            io.to(tenantRoom).to(tenantIdStr).emit('campaign_status_changed', {
              campaignId,
              status: 'paused'
            });
          }
          break;
        }
      }

      // Pick next PENDING queue item
      const queueItem = await CampaignQueue.findOne({
        campaignId,
        status: 'PENDING'
      }).sort({ createdAt: 1 });

      if (!queueItem) {
        // All items completed! Accurately calculate final stats from CampaignQueue
        const [sentFinal, failedFinal, totalFinal] = await Promise.all([
          CampaignQueue.countDocuments({ campaignId, status: 'SENT' }),
          CampaignQueue.countDocuments({ campaignId, status: 'FAILED' }),
          CampaignQueue.countDocuments({ campaignId })
        ]);

        currentCampaign.stats = {
          ...currentCampaign.stats,
          totalTargeted: totalFinal,
          sent: sentFinal,
          delivered: sentFinal,
          failed: failedFinal
        };
        currentCampaign.status = 'completed';
        currentCampaign.completedAt = new Date();
        await currentCampaign.save();

        if (io) {
          io.to(tenantRoom).to(tenantIdStr).emit('campaign_completed', {
            campaignId,
            stats: currentCampaign.stats,
            status: 'COMPLETED'
          });
          io.to(tenantRoom).to(tenantIdStr).emit('campaign_status_changed', {
            campaignId,
            status: 'completed'
          });
        }
        console.log(`[FreeQrCampaign] Campaign ${campaignKey} completed successfully! Stats:`, currentCampaign.stats);
        break;
      }

      // Mark item as processing
      queueItem.status = 'PROCESSING';
      await queueItem.save();

      try {
        // Construct message payload (Media or Text)
        let payload;
        if (queueItem.mediaUrl) {
          const mType = (queueItem.mediaType || 'image').toLowerCase();
          if (mType.includes('image')) {
            payload = { image: { url: queueItem.mediaUrl }, caption: queueItem.personalizedMessage };
          } else if (mType.includes('video')) {
            payload = { video: { url: queueItem.mediaUrl }, caption: queueItem.personalizedMessage };
          } else if (mType.includes('audio')) {
            payload = { audio: { url: queueItem.mediaUrl }, mimetype: 'audio/mp4' };
          } else {
            payload = { document: { url: queueItem.mediaUrl }, fileName: 'document.pdf', caption: queueItem.personalizedMessage };
          }
        } else {
          payload = queueItem.personalizedMessage;
        }

        // Simulate human typing presence for Anti-Ban protection if enabled
        if (campaign.antiBanConfig?.simulateTyping !== false && sendQrPresence) {
          await sendQrPresence(tenantId, queueItem.phone, 'composing');
          await new Promise(r => setTimeout(r, 1000 + Math.floor(Math.random() * 800)));
        }

        // Send message through Baileys QR
        const res = await sendQrMessage(tenantId, queueItem.phone, payload);

        // Update queue item to SENT
        queueItem.status = 'SENT';
        queueItem.deliveryStatus = 'sent';
        queueItem.sentAt = new Date();
        queueItem.whatsappMessageId = res?.key?.id || null;
        await queueItem.save();

        // Increment campaign stats
        await Campaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.sent': 1, 'stats.delivered': 1 }
        });

        // Sync to Chat & Message collections in an isolated try-catch so inbox errors never fail the broadcast
        try {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let chat = await Chat.findOne({
            user: tenantId,
            $or: [{ phone: queueItem.phone }, { whatsappId: queueItem.phone }]
          });

          if (!chat) {
            chat = await Chat.create({
              name: queueItem.name,
              phone: queueItem.phone,
              whatsappId: queueItem.phone,
              source: 'free_qr',
              status: 'active',
              chatStatus: 'open',
              lastMsg: queueItem.personalizedMessage || '📎 Media',
              lastMsgTime: timeStr,
              lastActivity: new Date(),
              user: tenantId
            });
          } else {
            chat.lastMsg = queueItem.personalizedMessage || '📎 Media';
            chat.lastMsgTime = timeStr;
            chat.lastActivity = new Date();
            await chat.save();
          }

          const savedMsg = await Message.create({
            chatId: chat._id,
            user: tenantId,
            tenantId,
            contactId: queueItem.contactId,
            sender: 'me',
            senderType: 'HUMAN_AGENT',
            direction: 'OUTBOUND',
            text: queueItem.personalizedMessage,
            content: queueItem.personalizedMessage,
            messageType: queueItem.mediaUrl ? (queueItem.mediaType || 'image') : 'text',
            mediaUrl: queueItem.mediaUrl,
            time: timeStr,
            whatsappMessageId: res?.key?.id,
            status: 'delivered'
          });

          if (io) {
            io.to(tenantRoom).to(tenantIdStr).emit('receive_message', {
              chatId: chat._id,
              message: savedMsg,
              chat
            });
            io.to(tenantRoom).emit('chat_updated', chat);
          }
        } catch (chatSyncErr) {
          console.warn(`[FreeQrCampaign] Non-fatal chat sync warning for ${queueItem.phone}:`, chatSyncErr.message);
        }

        // Emit real-time socket progress for dashboard
        const total = currentCampaign.stats.totalTargeted || 1;
        const sentCount = (currentCampaign.stats.sent || 0) + 1;

        if (io) {
          io.to(tenantRoom).to(tenantIdStr).emit('campaign_progress', {
            campaignId,
            sent: sentCount,
            total,
            phone: queueItem.phone,
            name: queueItem.name,
            percent: Math.min(100, Math.round((sentCount / total) * 100)),
            status: 'PROCESSING'
          });
        }

      } catch (sendErr) {
        console.error(`[FreeQrCampaign] Failed to send to ${queueItem.phone}:`, sendErr.message);

        // Disconnection error handling: pause campaign safely, preserve remaining contacts
        const isConnErr = sendErr.message && (
          sendErr.message.includes('not connected') ||
          sendErr.message.includes('Connection Closed') ||
          sendErr.message.includes('QR') ||
          sendErr.message.includes('timed out')
        );

        if (isConnErr) {
          queueItem.status = 'PENDING';
          await queueItem.save();

          currentCampaign.status = 'paused';
          await currentCampaign.save();

          if (io) {
            io.to(tenantRoom).to(tenantIdStr).emit('campaign_status_changed', {
              campaignId,
              status: 'paused'
            });
            io.to(tenantRoom).to(tenantIdStr).emit('campaign_error', {
              campaignId,
              error: 'WhatsApp connection dropped during broadcast. Campaign has been paused safely without losing progress.'
            });
          }
          break; // Stop worker loop cleanly
        }

        // Recipient-level error (e.g. invalid phone number)
        queueItem.status = 'FAILED';
        queueItem.errorReason = sendErr.message;
        await queueItem.save();

        const updatedCamp = await Campaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.failed': 1 }
        }, { new: true });

        if (io) {
          io.to(tenantRoom).to(tenantIdStr).emit('campaign_stats_updated', {
            campaignId,
            status: 'active',
            stats: updatedCamp?.stats || currentCampaign.stats
          });
        }
      } finally {
        processedInSession++;
      }

      // Check if there are still pending items
      const remainingCount = await CampaignQueue.countDocuments({ campaignId, status: 'PENDING' });
      if (remainingCount > 0) {
        let sleepTime = delayMs;
        // Batch rest cooldown every 25 messages: add 60-90s rest without overriding selected 5m/10m/15m delay
        if (processedInSession > 0 && processedInSession % 25 === 0) {
          const extraRest = 60000 + Math.floor(Math.random() * 30000);
          sleepTime = Math.max(delayMs, delayMs + extraRest);
          console.log(`[FreeQrCampaign] Batch of 25 sent. Anti-ban rest cooldown for ${Math.round(sleepTime / 1000)}s...`);
        } else {
          console.log(`[FreeQrCampaign] Waiting ${Math.round(sleepTime / 1000)}s before next message...`);
        }
        await sleepInterruptible(sleepTime, campaignId);
      }
    }
  } catch (err) {
    console.error(`[FreeQrCampaign] Fatal worker loop error on campaign ${campaignKey}:`, err);
  } finally {
    runningCampaigns.delete(campaignKey);
  }
};

/**
 * Pauses an active Free QR campaign
 */
const pauseCampaign = async (tenantId, campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found.');
  }

  // Remove from running set immediately so any sleeping delay breaks out within 1s
  const campaignKey = campaignId.toString();
  runningCampaigns.delete(campaignKey);

  campaign.status = 'paused';
  await campaign.save();

  const io = getIO();
  if (io) {
    const tenantIdStr = tenantId.toString();
    io.to(`tenant_${tenantIdStr}`).to(tenantIdStr).emit('campaign_status_changed', {
      campaignId,
      status: 'paused'
    });
  }

  return { success: true, message: 'Campaign paused successfully.', campaign };
};

/**
 * Cancels an active or paused Free QR campaign
 */
const cancelCampaign = async (tenantId, campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found.');
  }

  const campaignKey = campaignId.toString();
  runningCampaigns.delete(campaignKey);

  campaign.status = 'cancelled';
  await campaign.save();

  // Mark pending & processing queue items as CANCELLED
  await CampaignQueue.updateMany(
    { campaignId, status: { $in: ['PENDING', 'PROCESSING'] } },
    { $set: { status: 'CANCELLED' } }
  );

  const io = getIO();
  if (io) {
    const tenantIdStr = tenantId.toString();
    io.to(`tenant_${tenantIdStr}`).to(tenantIdStr).emit('campaign_status_changed', {
      campaignId,
      status: 'cancelled'
    });
  }

  return { success: true, message: 'Campaign cancelled successfully.', campaign };
};

/**
 * Resumes a paused Free QR campaign
 */
const resumeCampaign = async (tenantId, campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found.');
  }

  // Verify WhatsApp QR is active and connected
  const sessionDoc = await QrSession.findOne({ tenantId });
  if (!sessionDoc || sessionDoc.status !== 'CONNECTED') {
    throw new Error('WhatsApp Web is not connected. Please scan QR in WhatsApp Settings before resuming.');
  }

  campaign.status = 'active';
  await campaign.save();

  const io = getIO();
  if (io) {
    const tenantIdStr = tenantId.toString();
    io.to(`tenant_${tenantIdStr}`).to(tenantIdStr).emit('campaign_status_changed', {
      campaignId,
      status: 'active'
    });
  }

  // Trigger worker again
  runQueueWorker(tenantId, campaignId).catch(err => {
    console.error(`[FreeQrCampaign] Resume error for campaign ${campaignId}:`, err);
  });

  return { success: true, message: 'Campaign resumed successfully.', campaign };
};

/**
 * Get queue status metrics
 */
const getCampaignQueueStatus = async (campaignId) => {
  const [total, pending, processing, sent, failed, cancelled] = await Promise.all([
    CampaignQueue.countDocuments({ campaignId }),
    CampaignQueue.countDocuments({ campaignId, status: 'PENDING' }),
    CampaignQueue.countDocuments({ campaignId, status: 'PROCESSING' }),
    CampaignQueue.countDocuments({ campaignId, status: 'SENT' }),
    CampaignQueue.countDocuments({ campaignId, status: 'FAILED' }),
    CampaignQueue.countDocuments({ campaignId, status: 'CANCELLED' })
  ]);

  return {
    total,
    pending,
    processing,
    sent,
    failed,
    cancelled,
    percent: total > 0 ? Math.round(((sent + failed) / total) * 100) : 0
  };
};

/**
 * Auto-resume any active Free QR campaigns on server reboot
 */
const autoResumeActiveCampaigns = async () => {
  try {
    const activeCampaigns = await Campaign.find({
      status: { $in: ['active', 'ACTIVE', 'running', 'RUNNING', 'processing', 'PROCESSING'] },
      channelType: 'FREE_QR'
    });

    if (!activeCampaigns.length) return;
    console.log(`[FreeQrCampaign] Found ${activeCampaigns.length} active campaigns to resume on boot.`);

    for (const camp of activeCampaigns) {
      const tenantId = camp.user || camp.tenantId;
      if (!tenantId) continue;

      // Reset any orphaned PROCESSING items to PENDING
      await CampaignQueue.updateMany(
        { campaignId: camp._id, status: 'PROCESSING' },
        { $set: { status: 'PENDING' } }
      );

      const remainingCount = await CampaignQueue.countDocuments({ campaignId: camp._id, status: 'PENDING' });
      if (remainingCount > 0) {
        console.log(`[FreeQrCampaign] Auto-resuming campaign "${camp.name}" (${camp._id}) with ${remainingCount} pending recipients.`);
        runQueueWorker(tenantId, camp._id).catch(err => {
          console.error(`[FreeQrCampaign] Auto-resume failed for ${camp._id}:`, err.message);
        });
      } else {
        camp.status = 'completed';
        await camp.save();
      }
    }
  } catch (err) {
    console.error('[FreeQrCampaign] Error in autoResumeActiveCampaigns:', err.message);
  }
};

/**
 * Checks for any scheduled campaigns whose scheduledDate <= now and launches them
 */
const checkAndTriggerScheduledCampaigns = async () => {
  try {
    const now = new Date();
    const dueCampaigns = await Campaign.find({
      status: { $in: ['scheduled', 'SCHEDULED'] },
      $or: [
        { scheduledDate: { $lte: now } },
        { scheduledAt: { $lte: now } }
      ]
    });

    for (const camp of dueCampaigns) {
      console.log(`[ScheduledCampaign] Triggering scheduled campaign "${camp.name}" (${camp._id})`);
      camp.status = 'active';
      await camp.save();

      const tenantId = camp.user || camp.tenantId;
      if (camp.channelType === 'FREE_QR') {
        startFreeQrCampaign(tenantId, camp._id).catch(err => {
          console.error(`[ScheduledCampaign] Failed to start scheduled Free QR campaign ${camp._id}:`, err);
        });
      }
    }
  } catch (err) {
    console.error('[ScheduledCampaign] Poller check error:', err.message);
  }
};

module.exports = {
  startFreeQrCampaign,
  runQueueWorker,
  pauseCampaign,
  cancelCampaign,
  resumeCampaign,
  getCampaignQueueStatus,
  autoResumeActiveCampaigns,
  checkAndTriggerScheduledCampaigns
};


