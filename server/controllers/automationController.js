const Automation = require('../models/Automation');
const CustomerSession = require('../models/CustomerSession');
const whatsappService = require('../services/whatsappService');

exports.getAutomations = async (req, res, next) => {
  try {
    const automations = await Automation.find({ user: req.user.id });
    res.status(200).json(automations);
  } catch (error) {
    next(error);
  }
};

exports.getAutomationById = async (req, res, next) => {
  try {
    const automation = await Automation.findOne({ _id: req.params.id, user: req.user.id });
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
    const existing = await Automation.findOne({ user: req.user.id, name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
    }

    const automationData = { ...req.body, user: req.user.id };
    const newAutomation = new Automation(automationData);
    const savedAutomation = await newAutomation.save();
    res.status(201).json(savedAutomation);
  } catch (error) {
    next(error);
  }
};

exports.updateAutomation = async (req, res, next) => {
  try {
    if (req.body.name) {
      const existing = await Automation.findOne({ user: req.user.id, name: req.body.name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
      }
    }

    const updatedAutomation = await Automation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAutomation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    res.status(200).json(updatedAutomation);
  } catch (error) {
    next(error);
  }
};

exports.deleteAutomation = async (req, res, next) => {
  try {
    const deletedAutomation = await Automation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedAutomation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    res.status(200).json({ message: 'Automation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.testAutomation = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const automation = await Automation.findOne({ _id: req.params.id, user: req.user.id });
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    
    // Find trigger node (prefer unsaved canvas state if provided, otherwise DB state)
    const nodes = req.body.nodes || automation.nodes || [];
    const edges = req.body.edges || automation.edges || [];
    
    const triggerNode = nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
    if (!triggerNode) {
      return res.status(400).json({ message: 'No trigger node found in this automation.' });
    }

    const firstEdge = edges.find(e => e.source === triggerNode.id);
    if (!firstEdge) {
      return res.status(400).json({ message: 'Trigger node is not connected to any step.' });
    }

    const firstNode = nodes.find(n => n.id === firstEdge.target);
    if (!firstNode) {
      return res.status(400).json({ message: 'Target node of the trigger was not found.' });
    }

    // Try to send the message
    let result;
      
    if (firstNode.type === 'templateNode') {
      const { templateName, templateLanguage, variables } = firstNode.data;
      const components = [];
      if (variables && variables.length > 0) {
        components.push({
          type: 'body',
          parameters: variables.map(v => ({ type: 'text', text: v.value || '' }))
        });
      }
      result = await whatsappService.sendTemplateMessage(phoneNumber, templateName, templateLanguage || 'en_US', components);
    } else {
      let textToSend = "Test message from Automation Flow!";
      // Extract text from standard message nodes
      if (firstNode.data && firstNode.data.text) {
        textToSend = firstNode.data.text;
      }
      result = await whatsappService.sendTextMessage(phoneNumber, textToSend);
    }

    if (result && !result.success) {
       const errorMessage = result.error?.error?.message || result.error?.message || 'Failed to send WhatsApp message';
       return res.status(400).json({ success: false, message: errorMessage });
    }
    
    res.status(200).json({ success: true, message: `Test automation triggered for ${phoneNumber}` });
  } catch (error) {
    next(error);
  }
};

exports.getActivityLog = async (req, res, next) => {
  try {
    // We fetch sessions across all channels for this user, populated with Automation name
    // Since CustomerSession does not have user directly, we find Automations first or just rely on populate filtering
    const automations = await Automation.find({ user: req.user.id }).select('_id');
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
