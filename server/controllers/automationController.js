const Automation = require('../models/Automation');
const CustomerSession = require('../models/CustomerSession');
const User = require('../models/User');
const { PLAN_LIMITS } = require('../utils/planLimits');
const whatsappService = require('../services/whatsappService');
const automationService = require('../services/automationService');

function extractTriggersFromNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  const triggers = [];

  for (const node of nodes) {
    if (!node || !node.data) continue;

    if (node.type === 'triggerNode') {
      const { triggerType, keyword, keywords, adSourceId, eventName } = node.data;
      
      const allKeywords = [];
      if (Array.isArray(keywords)) {
        keywords.forEach(k => {
          if (typeof k === 'string' && k.trim()) allKeywords.push(k.trim());
        });
      }
      if (typeof keyword === 'string' && keyword.trim()) {
        keyword.split(',').forEach(k => {
          const trimmed = k.trim();
          if (trimmed && !allKeywords.includes(trimmed)) {
            allKeywords.push(trimmed);
          }
        });
      }

      for (const kw of allKeywords) {
        triggers.push({
          type: triggerType || 'keyword',
          value: kw
        });
        if (kw.toLowerCase() !== kw) {
          triggers.push({
            type: triggerType || 'keyword',
            value: kw.toLowerCase()
          });
        }
      }

      if (triggerType === 'whatsapp_ad' || adSourceId) {
        triggers.push({
          type: 'whatsapp_ad',
          value: adSourceId || ''
        });
      }

      if (triggerType === 'tag_added' && keyword) {
        triggers.push({
          type: 'TAG_ADDED',
          value: keyword.trim()
        });
      } else if (triggerType === 'tag_removed' && keyword) {
        triggers.push({
          type: 'TAG_REMOVED',
          value: keyword.trim()
        });
      } else if (triggerType === 'new_contact' || triggerType === 'NEW_CONTACT') {
        triggers.push({
          type: 'NEW_CONTACT',
          value: null
        });
      } else if (triggerType === 'crm_event' || triggerType === 'crm') {
        triggers.push({
          type: eventName || 'CRM_EVENT',
          value: keyword || ''
        });
      } else if (triggerType === 'api_webhook' || triggerType === 'webhook') {
        triggers.push({
          type: 'API_EVENT',
          value: eventName || 'custom'
        });
      }
    } else if (node.type === 'eventTriggerNode') {
      const { triggerType, eventName, eventValue } = node.data;
      if (triggerType === 'webhook') {
        triggers.push({
          type: 'API_EVENT',
          value: eventName || 'webhook'
        });
      } else if (triggerType === 'crm') {
        triggers.push({
          type: eventName || 'CRM_EVENT',
          value: eventValue || ''
        });
      } else if (triggerType === 'schedule' || triggerType === 'recurring') {
        triggers.push({
          type: triggerType,
          value: eventName || ''
        });
      } else if (eventName) {
        triggers.push({
          type: eventName,
          value: eventValue || eventName
        });
      }
    }
  }

  return triggers;
}

exports.extractTriggersFromNodes = extractTriggersFromNodes;

exports.getAutomations = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const automations = await Automation.find({ tenantId }).populate('channelId', 'name phoneNumber').lean();
    
    const flowIds = automations.map(a => a._id);
    const sessionStats = await CustomerSession.aggregate([
      { $match: { activeFlowId: { $in: flowIds } } },
      { $group: {
          _id: "$activeFlowId",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } }
        }
      }
    ]);

    const statsMap = {};
    sessionStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        total: stat.total,
        completed: stat.completed,
        rate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
      };
    });

    const automationsWithStats = automations.map(a => {
      const stats = statsMap[a._id.toString()] || { total: 0, completed: 0, rate: 0 };
      return {
        ...a,
        successRate: stats.rate,
        sessionStats: stats
      };
    });

    res.status(200).json(automationsWithStats);
  } catch (error) {
    next(error);
  }
};

exports.getAutomationById = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const automation = await Automation.findOne({ _id: req.params.id, tenantId });
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    res.status(200).json(automation);
  } catch (error) {
    next(error);
  }
};

exports.createAutomation = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;

    // Plan limits check
    const user = await User.findById(tenantId);
    const userPlan = (user?.subscriptionPlan || 'free').toLowerCase();
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    if (limits.chatbots !== -1) {
      const count = await Automation.countDocuments({ tenantId });
      if (count >= limits.chatbots) {
        return res.status(403).json({
          message: `Your current plan (${userPlan}) allows up to ${limits.chatbots} automation/chatbot. Please upgrade to create more.`
        });
      }
    }

    if (req.body.nodes && limits.chatbotNodes !== -1 && req.body.nodes.length > limits.chatbotNodes) {
      return res.status(403).json({
        message: `Your current plan (${userPlan}) allows up to ${limits.chatbotNodes} nodes per automation. Please upgrade your plan.`
      });
    }

    const existing = await Automation.findOne({ tenantId, name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
    }

    const triggers = (Array.isArray(req.body.triggers) && req.body.triggers.length > 0)
      ? req.body.triggers
      : extractTriggersFromNodes(req.body.nodes);

    const automationData = { ...req.body, triggers, tenantId };
    const newAutomation = new Automation(automationData);
    const savedAutomation = await newAutomation.save();

    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) io.emit('automation_updated', { tenantId, automation: savedAutomation });
    } catch (_) {}

    res.status(201).json(savedAutomation);
  } catch (error) {
    next(error);
  }
};

exports.updateAutomation = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    if (req.body.name) {
      const existing = await Automation.findOne({ tenantId, name: req.body.name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
      }
    }

    const updateData = { ...req.body };
    if (req.body.nodes) {
      if (!Array.isArray(req.body.triggers) || req.body.triggers.length === 0) {
        updateData.triggers = extractTriggersFromNodes(req.body.nodes);
      }
    }

    const updatedAutomation = await Automation.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedAutomation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) io.emit('automation_updated', { tenantId, automation: updatedAutomation });
    } catch (_) {}

    res.status(200).json(updatedAutomation);
  } catch (error) {
    next(error);
  }
};

exports.deleteAutomation = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const deletedAutomation = await Automation.findOneAndDelete({ _id: req.params.id, tenantId });
    if (!deletedAutomation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) io.emit('automation_updated', { tenantId, deletedId: req.params.id });
    } catch (_) {}

    res.status(200).json({ message: 'Automation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.testAutomation = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    let { phoneNumber } = req.body;
    const automation = await Automation.findOne({ _id: req.params.id, tenantId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }
    
    let channelId = automation.channelId;
    if (!channelId) {
      const Channel = require('../models/Channel');
      const defaultChannel = await Channel.findOne({ tenantId });
      if (defaultChannel) {
        channelId = defaultChannel._id;
        automation.channelId = channelId;
        await automation.save();
      }
    }

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'No WhatsApp channel configured. Please connect a WhatsApp channel first.' });
    }

    let cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    // Ensure contact exists and bot is not paused or opted out for testing
    const Contact = require('../models/Contact');
    await Contact.findOneAndUpdate(
      { phone: cleanPhone, tenantId },
      { $set: { isOptedOut: false, isBotPaused: false, status: 'ACTIVE', lastInteractionAt: new Date() } },
      { upsert: true }
    );

    // Trigger the real engine for the test number
    const result = await automationService.startFlow(cleanPhone, channelId, automation._id, { isTest: true });
    
    if (!result.success) {
       return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, message: `Test automation triggered for ${phoneNumber}` });
  } catch (error) {
    next(error);
  }
};

exports.getActivityLog = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    // We fetch sessions across all channels for this user, populated with Automation name
    // Since CustomerSession does not have user directly, we find Automations first or just rely on populate filtering
    const automations = await Automation.find({ tenantId }).select('_id');
    const flowIds = automations.map(a => a._id);

    const activities = await CustomerSession.find({ activeFlowId: { $in: flowIds } })
      .populate({ path: 'activeFlowId', select: 'name' })
      .populate({ path: 'channelId', select: 'name phoneNumber' })
      .sort({ lastInteractionAt: -1 })
      .limit(100);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

exports.simulateStart = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const automation = await Automation.findOne({ _id: req.params.id, tenantId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }
    
    let channelId = automation.channelId || req.body.channelId;
    if (!channelId) {
      const Channel = require('../models/Channel');
      const defaultChannel = await Channel.findOne({ tenantId });
      if (defaultChannel) {
        channelId = defaultChannel._id;
        automation.channelId = channelId;
        await automation.save();
      }
    }

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'No WhatsApp channel configured. Please connect a WhatsApp channel first.' });
    }

    const simulatorPhone = req.body.simulatorPhone || `SIMULATOR_${req.user._id}`;

    // Get the start trigger keyword from the triggerNode
    let triggerKeyword = 'hello'; // Default fallback
    if (automation.nodes && automation.nodes.length > 0) {
      const triggerNode = automation.nodes.find(n => n.type === 'triggerNode');
      if (triggerNode && triggerNode.data) {
        if (triggerNode.data.keyword) {
           // If multiple keywords are separated by commas, pick the first one
           triggerKeyword = triggerNode.data.keyword.split(',')[0].trim() || 'hello';
        }
      }
    }

    // Upsert a dummy contact for the simulator and ensure bot is not paused
    const Contact = require('../models/Contact');
    const simName = req.user?.name || req.user?.tenantName || 'Aayush Kumar';
    await Contact.findOneAndUpdate(
      { phone: simulatorPhone, tenantId },
      { name: simName, isOptedOut: false, isBotPaused: false, status: 'ACTIVE', lastInteractionAt: new Date() },
      { upsert: true, new: true }
    );

    // Cancel any stale simulator sessions before starting a new one
    await CustomerSession.updateMany(
      { phone: simulatorPhone, status: { $in: ['ACTIVE', 'WAITING_FOR_INPUT', 'WAITING_FOR_EVENT', 'PAUSED', 'HANDOFF'] } },
      { $set: { status: 'COMPLETED' } }
    );

    // Automatically trigger/start the flow so template/first message immediately pops up in the simulator!
    const flowRunner = await import('../engine/flowRunner.js');
    const startFlowManually = flowRunner.startFlowManually;
    
    // Check if flow has a triggerNode with keyword or starts with templateNode
    const triggerNode = automation.nodes?.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
    
    if (triggerNode) {
      // Find what trigger keyword it expects, or start it via trigger node's next edge
      const outgoing = automation.edges?.filter(e => e.source === triggerNode.id);
      if (outgoing && outgoing.length > 0) {
        // Start flow directly from the node attached to trigger
        await startFlowManually(simulatorPhone, channelId, automation._id, { isTest: true });
      } else {
        await startFlowManually(simulatorPhone, channelId, automation._id, { isTest: true });
      }
    } else {
      // Flow directly starts with a message/template node
      await startFlowManually(simulatorPhone, channelId, automation._id, { isTest: true });
    }
    
    res.status(200).json({ success: true, message: 'Simulation started', channelId });
  } catch (error) {
    console.error('[SIMULATOR] simulateStart error:', error);
    next(error);
  }
};

exports.simulateMessage = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    let { channelId, simulatorPhone, message, messageContext } = req.body;
    const automationId = req.params.id; // Get the specific flow ID being tested
    
    if (!simulatorPhone || !message) {
      return res.status(400).json({ success: false, message: 'Missing simulatorPhone or message' });
    }

    if (!channelId) {
      const automation = await Automation.findOne({ _id: automationId, tenantId });
      channelId = automation?.channelId;
      if (!channelId) {
        const Channel = require('../models/Channel');
        const defaultChannel = await Channel.findOne({ tenantId });
        if (defaultChannel) channelId = defaultChannel._id;
      }
    }

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'No WhatsApp channel configured. Please connect a WhatsApp channel first.' });
    }

    // Enqueue the incoming message to webhookQueue
    const { enqueueWebhookPayload } = require('../queues/webhookQueue');
    enqueueWebhookPayload(simulatorPhone, message, channelId, null, `sim_msg_${Date.now()}`, automationId, false, messageContext || {});
    
    res.status(200).json({ success: true, message: 'Simulated message sent' });
  } catch (error) {
    next(error);
  }
};
