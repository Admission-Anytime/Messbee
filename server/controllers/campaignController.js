const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const User = require('../models/User');
const CampaignQueue = require('../models/CampaignQueue');
const ContactGroup = require('../models/ContactGroup');
const freeQrCampaignService = require('../services/freeQrCampaignService');
const { PLAN_LIMITS } = require('../utils/planLimits');
const { sendBulkMessages } = require('../services/messageService');
const { createAndEmitNotification } = require('../services/notificationService');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id })
      .populate('contactGroupId', 'name totalContacts')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('targetAudience', 'name phone email')
      .populate('contactGroupId', 'name totalContacts')
      .populate('user', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const campaignUserId = campaign.user._id ? campaign.user._id.toString() : campaign.user.toString();
    if (campaignUserId !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this campaign'
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
exports.createCampaign = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userPlan = (user?.subscriptionPlan || 'free').toLowerCase();
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // Check campaign count limit
    if (limits.campaigns !== -1) {
      const existingCampaignCount = await Campaign.countDocuments({ user: req.user.id });
      if (existingCampaignCount >= limits.campaigns) {
        return res.status(403).json({
          success: false,
          message: `Your current plan (${userPlan}) allows up to ${limits.campaigns} campaign. Please upgrade your plan for unlimited campaigns.`
        });
      }
    }

    // Check schedule feature permission
    if ((req.body.scheduledAt || req.body.scheduledDate) && !limits.features?.scheduleCampaign) {
      return res.status(403).json({
        success: false,
        message: 'Campaign scheduling requires a Basic plan or higher. Please upgrade your plan.'
      });
    }

    // Check recurring campaign feature permission
    if (req.body.isRecurring && !limits.features?.recurringCampaign) {
      return res.status(403).json({
        success: false,
        message: 'Recurring campaigns require a Professional plan or higher.'
      });
    }

    req.body.user = req.user.id;

    // 1. If a contact group is selected, use group's contacts
    if (req.body.contactGroupId) {
      const group = await ContactGroup.findById(req.body.contactGroupId);
      if (group && Array.isArray(group.contacts) && group.contacts.length > 0) {
        req.body.targetAudience = group.contacts;
      }
    } else if (req.body.audienceFilter) {
      // 2. If audienceFilter is provided, get matching contacts
      const filter = { user: req.user.id };
      
      if (req.body.audienceFilter.tags && req.body.audienceFilter.tags.length > 0) {
        filter.labels = { $in: req.body.audienceFilter.tags };
      }

      if (req.body.audienceFilter.status) {
        if (Array.isArray(req.body.audienceFilter.status)) {
          filter.status = { $in: req.body.audienceFilter.status.map(s => String(s).toUpperCase()) };
        } else {
          filter.status = String(req.body.audienceFilter.status).toUpperCase();
        }
      }
      
      if (req.body.audienceFilter.createdAfter) {
        filter.createdAt = { $gte: new Date(req.body.audienceFilter.createdAfter) };
      }
      
      if (req.body.audienceFilter.createdBefore) {
        filter.createdAt = { 
          ...filter.createdAt, 
          $lte: new Date(req.body.audienceFilter.createdBefore) 
        };
      }

      // If user selected "All Contacts" (no tags and no status filters), exclude system hidden contacts
      if ((!req.body.audienceFilter.tags || req.body.audienceFilter.tags.length === 0) && !req.body.audienceFilter.status) {
        filter.labels = { $nin: ['_HIDDEN_CAMPAIGN_'] };
      }

      const contacts = await Contact.find(filter).select('_id');
      req.body.targetAudience = contacts.map(c => c._id);
    }

    const isFreeQrTier = (req.user?.whatsappChannelType === 'free_qr' || req.body?.channelType === 'FREE_QR');
    if (isFreeQrTier) {
      req.body.channelType = 'FREE_QR';
    }

    const campaign = await Campaign.create(req.body);

    // If campaign is active, trigger sending process (simulated/async)
    if (campaign.status === 'active') {
      if (isFreeQrTier) {
        freeQrCampaignService.startFreeQrCampaign(req.user.id, campaign._id).catch(err => {
          console.error('[CampaignController] Free QR campaign launch error:', err.message);
        });
      } else {
        const contacts = await Contact.find({ _id: { $in: campaign.targetAudience } });

        // 💳 Pre-flight Wallet Reservation for auto-send campaigns
        const walletServiceCc = require('../services/walletService');
        const { getMessageCost: getMsgCostCc } = require('../config/pricingConfig');
        let totalAutoEstimate = 0;
        for (const c of contacts) {
          totalAutoEstimate += getMsgCostCc('MARKETING', c.phone || '', req.user.customPricing);
        }

        const autoReservation = await walletServiceCc.reserveCampaignCredits(
          req.user.id,
          campaign._id,
          totalAutoEstimate
        );

        if (!autoReservation.success) {
          // Pause campaign if insufficient funds
          campaign.status = 'paused';
          await campaign.save();
          return res.status(402).json({
            success: false,
            message: autoReservation.message || 'Insufficient WCC credits. Campaign paused. Please recharge.',
            errorCode: 'INSUFFICIENT_WCC_CREDITS',
            data: campaign
          });
        }
        
        // We run this in the background (no await) so the response is immediate
        sendBulkMessages(req.user.id, campaign._id, contacts, campaign.messageTemplate)
          .then(async (result) => {
            const freshCampaign = await Campaign.findById(campaign._id);
            if (!freshCampaign) return;

            const hasAttempts = (result?.totalProcessed || 0) > 0;
            const allFailed = hasAttempts && (result?.failed || 0) >= (result?.totalProcessed || 0);

            freshCampaign.status = allFailed ? 'paused' : 'completed';
            await freshCampaign.save();

            // Release reservation and deduct actual sent count
            await walletServiceCc.releaseCampaignReservation(req.user.id, totalAutoEstimate);
            for (const c of contacts.slice(0, result?.totalProcessed || 0)) {
              await walletServiceCc.deductMessageCredits({
                tenantId: req.user.id,
                category: 'MARKETING',
                recipientPhone: c.phone || '',
                campaignId: campaign._id
              });
            }
          })
          .catch(async (err) => {
            console.error('Campaign background process failed:', err);
            await walletServiceCc.releaseCampaignReservation(req.user.id, totalAutoEstimate);
            const freshCampaign = await Campaign.findById(campaign._id);
            if (!freshCampaign) return;
            freshCampaign.status = 'paused';
            await freshCampaign.save();
          });
      }
    }

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
exports.updateCampaign = async (req, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // If campaign status updated to active, resume queue worker if Free QR
    if (req.body.status === 'active' && (campaign.channelType === 'FREE_QR' || req.user.whatsappChannelType === 'free_qr')) {
      freeQrCampaignService.runQueueWorker(req.user.id, campaign._id).catch(console.error);
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    // Clean up queue items associated with this campaign to prevent orphaned records
    await CampaignQueue.deleteMany({ campaignId: req.params.id });
    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update campaign stats
// @route   PUT /api/campaigns/:id/stats
// @access  Private
exports.updateCampaignStats = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    campaign.stats = {
      ...campaign.stats,
      ...req.body
    };

    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send campaign
// @route   POST /api/campaigns/:id/send
// @access  Private
exports.sendCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('targetAudience');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to send this campaign'
      });
    }

    const hasAudience = (campaign.targetAudience && campaign.targetAudience.length > 0) ||
      campaign.contactGroupId ||
      (campaign.audienceFilter?.tags && campaign.audienceFilter.tags.length > 0) ||
      campaign.audienceFilter?.status;

    if (!hasAudience && campaign.channelType !== 'FREE_QR') {
      return res.status(400).json({
        success: false,
        message: 'Campaign has no target audience'
      });
    }

    const messageContent = campaign.bodyText || campaign.messageTemplate;
    if (!messageContent || messageContent.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Campaign has no message template or body text'
      });
    }

    const isFreeQrTier = (req.user?.whatsappChannelType === 'free_qr' || campaign.channelType === 'FREE_QR');

    if (isFreeQrTier) {
      try {
        const result = await freeQrCampaignService.startFreeQrCampaign(req.user.id, campaign._id);
        return res.status(200).json({
          success: true,
          message: result.message || 'Campaign launched successfully via WhatsApp Web Free Hub!',
          data: result.campaign
        });
      } catch (qrErr) {
        return res.status(400).json({
          success: false,
          message: qrErr.message || 'Failed to start Free QR campaign',
          errorCode: 'FREE_QR_ERROR'
        });
      }
    }

    // 💳 Pre-flight Campaign Wallet Reservation
    const walletService = require('../services/walletService');
    const { getMessageCost } = require('../config/pricingConfig');
    // Calculate total cost for target audience
    let totalEstimatedCost = 0;
    for (const recipient of campaign.targetAudience) {
      totalEstimatedCost += getMessageCost('MARKETING', recipient.phone || recipient, req.user.customPricing);
    }

    const reservation = await walletService.reserveCampaignCredits(
      req.user.id,
      campaign._id,
      totalEstimatedCost
    );

    if (!reservation.success) {
      return res.status(402).json({
        success: false,
        message: reservation.message || 'Insufficient WCC credits to launch campaign. Please recharge your wallet.',
        errorCode: 'INSUFFICIENT_WCC_CREDITS'
      });
    }

    // Update campaign status to active
    campaign.status = 'active';
    campaign.stats = {
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0
    };
    await campaign.save();

    // Create notification for campaign start
    await createAndEmitNotification(
      req.user.id,
      'campaign',
      `Campaign "${campaign.name}" started`,
      `Sending to ${campaign.targetAudience.length} contacts via WhatsApp`,
      {
        meta: [
          { label: 'Recipients', value: campaign.targetAudience.length.toString() },
          { label: 'Status', value: 'active' },
          { label: 'Template', value: campaign.name }
        ],
        relatedId: campaign._id,
        data: {
          campaignId: campaign._id.toString(),
          recipientCount: campaign.targetAudience.length,
          templateName: campaign.name
        }
      }
    );

    // Send messages in background (no await - respond immediately)
    sendBulkMessages(req.user.id, campaign._id, campaign.targetAudience, campaign.messageTemplate)
      .then(async (result) => {
        // Update campaign with results
        const updatedCampaign = await Campaign.findById(campaign._id);
        if (updatedCampaign) {
          updatedCampaign.status = 'completed';
          updatedCampaign.stats = result.stats || { sent: result.totalProcessed, delivered: 0, read: 0, replied: 0, failed: result.failed };
          await updatedCampaign.save();

          // Create completion notification
          await createAndEmitNotification(
            req.user.id,
            'campaign',
            `Campaign "${campaign.name}" completed`,
            `Sent to ${result.totalProcessed} contacts. Failed: ${result.failed}`,
            {
              meta: [
                { label: 'Sent', value: result.totalProcessed.toString() },
                { label: 'Failed', value: result.failed.toString() },
                { label: 'Status', value: 'completed' }
              ],
              relatedId: campaign._id,
            }
          );

          // Release reservation and deduct actual processed count
          await walletService.releaseCampaignReservation(req.user.id, totalEstimatedCost);
          
          for (const recipient of campaign.targetAudience.slice(0, result.totalProcessed)) {
            await walletService.deductMessageCredits({
              tenantId: req.user.id,
              category: 'MARKETING',
              recipientPhone: recipient.phone || recipient,
              campaignId: campaign._id
            });
          }
        }
      })
      .catch(async (err) => {
        console.error('Campaign sending failed:', err);
        // Release reservation if failed
        await walletService.releaseCampaignReservation(req.user.id, totalEstimatedCost);
        const updatedCampaign = await Campaign.findById(campaign._id);
        if (updatedCampaign) {
          updatedCampaign.status = 'failed';
          await updatedCampaign.save();

          // Create failure notification
          await createAndEmitNotification(
            req.user.id,
            'alert',
            `Campaign "${campaign.name}" failed`,
            err.message || 'Failed to send campaign messages',
            {
              meta: [
                { label: 'Status', value: 'failed' },
                { label: 'Error', value: err.message || 'Unknown error' }
              ],
              relatedId: campaign._id,
              data: { campaignId: campaign._id.toString(), error: err.message }
            }
          );
        }
      });

    res.status(200).json({
      success: true,
      message: `Campaign "${campaign.name}" started sending!`,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pause campaign
// @route   POST /api/campaigns/:id/pause
// @access  Private
exports.pauseCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.user.toString() !== req.user.id && campaign.tenantId?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to pause this campaign' });
    }

    if (campaign.channelType === 'FREE_QR' || req.user.whatsappChannelType === 'free_qr') {
      const result = await freeQrCampaignService.pauseCampaign(req.user.id, campaign._id);
      return res.status(200).json(result);
    }

    campaign.status = 'paused';
    await campaign.save();
    res.status(200).json({ success: true, message: 'Campaign paused successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

// @desc    Resume campaign
// @route   POST /api/campaigns/:id/resume
// @access  Private
exports.resumeCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.user.toString() !== req.user.id && campaign.tenantId?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to resume this campaign' });
    }

    if (campaign.channelType === 'FREE_QR' || req.user.whatsappChannelType === 'free_qr') {
      const result = await freeQrCampaignService.resumeCampaign(req.user.id, campaign._id);
      return res.status(200).json(result);
    }

    campaign.status = 'active';
    await campaign.save();
    res.status(200).json({ success: true, message: 'Campaign resumed successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel campaign
// @route   POST /api/campaigns/:id/cancel
// @access  Private
exports.cancelCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.user.toString() !== req.user.id && campaign.tenantId?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this campaign' });
    }

    if (campaign.channelType === 'FREE_QR' || req.user.whatsappChannelType === 'free_qr') {
      const result = await freeQrCampaignService.cancelCampaign(req.user.id, campaign._id);
      return res.status(200).json(result);
    }

    campaign.status = 'cancelled';
    await campaign.save();

    // Mark remaining pending queue items as cancelled
    await CampaignQueue.updateMany(
      { campaignId: req.params.id, status: 'PENDING' },
      { $set: { status: 'CANCELLED' } }
    );

    res.status(200).json({ success: true, message: 'Campaign cancelled successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaign queue execution list & stats
// @route   GET /api/campaigns/:id/queue
// @access  Private
exports.getCampaignQueue = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = { campaignId: req.params.id };
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const [total, queue, stats] = await Promise.all([
      CampaignQueue.countDocuments(filter),
      CampaignQueue.find(filter)
        .sort({ scheduledFor: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      freeQrCampaignService.getCampaignQueueStatus(req.params.id)
    ]);

    res.status(200).json({
      success: true,
      stats,
      count: queue.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};
