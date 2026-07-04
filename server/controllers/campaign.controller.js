import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import Channel from '../models/Channel.js';
import Segment from '../models/Segment.js';
import axios from 'axios';
import { parseDynamicVariables } from '../engine/nodeExecutors.js';
import { logMessageInternal } from './inbox.controller.js';
import { enqueueCampaignBlast } from '../queues/campaignQueue.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
  }
};

export const createAndLaunchCampaign = async (req, res) => {
  try {
    const { name, channelId, templateName, templateLanguage, targetSegment, variablesMapping } = req.body;

    const channel = await Channel.findOne({ _id: channelId, tenantId: req.user.tenantId }).select('+metaAccessToken');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // 1. Create the Campaign record
    const campaign = await Campaign.create({
      tenantId: req.user.tenantId,
      channelId,
      name,
      templateName,
      templateLanguage,
      targetSegment,
      variablesMapping,
      status: 'RUNNING'
    });

    // 2. Resolve Target Audience
    let query = { tenantId: req.user.tenantId, channelId };
    
    if (targetSegment.segmentId) {
      const segment = await Segment.findById(targetSegment.segmentId);
      if (segment) {
        const rules = segment.rules.map(rule => {
          const { field, operator, value } = rule;
          const map = {
            'equals': { [field]: value },
            'not_equals': { [field]: { $ne: value } },
            'contains': { [field]: { $regex: value, $options: 'i' } },
            'exists': { [field]: { $exists: true } }
          };
          return map[operator] || {};
        });

        if (segment.matchType === 'ALL' && rules.length > 0) {
          query.$and = rules;
        } else if (segment.matchType === 'ANY' && rules.length > 0) {
          query.$or = rules;
        }
      }
    } else if (targetSegment.tag) {
      query.tags = targetSegment.tag; // Ensure contact has this tag
    }
    
    const targetContacts = await Contact.find(query);
    
    campaign.stats.totalTargeted = targetContacts.length;
    await campaign.save();

    res.status(200).json({ message: 'Campaign launched successfully', campaignId: campaign._id, totalTargeted: targetContacts.length });

    // 3. Dispatch asynchronously in the background via our mock queue
    enqueueCampaignBlast(campaign, targetContacts, channel);

  } catch (error) {
    res.status(500).json({ message: 'Failed to launch campaign', error: error.message });
  }
};
