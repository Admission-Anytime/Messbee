const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const { sendBulkMessages } = require('../services/messageService');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id })
      .populate('targetAudience', 'name phone')
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
      .populate('user', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.user.toString() !== req.user.id) {
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
    req.body.user = req.user.id;

    // If audienceFilter is provided, get matching contacts
    if (req.body.audienceFilter) {
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

      const contacts = await Contact.find(filter).select('_id');
      req.body.targetAudience = contacts.map(c => c._id);
    }

    const campaign = await Campaign.create(req.body);

    // If campaign is active, trigger sending process (simulated/async)
    if (campaign.status === 'active') {
      const contacts = await Contact.find({ _id: { $in: campaign.targetAudience } });
      
      // We run this in the background (no await) so the response is immediate
      sendBulkMessages(req.user.id, campaign._id, contacts, campaign.messageTemplate)
        .then(async (result) => {
          const freshCampaign = await Campaign.findById(campaign._id);
          if (!freshCampaign) return;

          const hasAttempts = (result?.totalProcessed || 0) > 0;
          const allFailed = hasAttempts && (result?.failed || 0) >= (result?.totalProcessed || 0);

          freshCampaign.status = allFailed ? 'paused' : 'completed';
          await freshCampaign.save();
        })
        .catch(async (err) => {
          console.error('Campaign background process failed:', err);

          const freshCampaign = await Campaign.findById(campaign._id);
          if (!freshCampaign) return;
          freshCampaign.status = 'paused';
          await freshCampaign.save();
        });
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
