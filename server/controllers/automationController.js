const Automation = require('../models/Automation');
const CustomerSession = require('../models/CustomerSession');
const whatsappService = require('../services/whatsappService');
const automationService = require('../services/automationService');

exports.getAutomations = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const automations = await Automation.find({ tenantId }).lean();
    
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
    const existing = await Automation.findOne({ tenantId, name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
    }

    const automationData = { ...req.body, tenantId };
    const newAutomation = new Automation(automationData);
    const savedAutomation = await newAutomation.save();
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

    const updatedAutomation = await Automation.findOneAndUpdate(
      { _id: req.params.id, tenantId },
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
    const tenantId = req.user.tenantId || req.user._id;
    const deletedAutomation = await Automation.findOneAndDelete({ _id: req.params.id, tenantId });
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
    const tenantId = req.user.tenantId || req.user._id;
    let { phoneNumber } = req.body;
    if (phoneNumber && phoneNumber.length === 10) {
      phoneNumber = `91${phoneNumber}`;
    }
    const automation = await Automation.findOne({ _id: req.params.id, tenantId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }
    
    if (!automation.channelId) {
      return res.status(400).json({ success: false, message: 'No WhatsApp channel assigned to this automation.' });
    }

    // Trigger the real engine for the test number
    const result = await automationService.startFlow(phoneNumber, automation.channelId, automation._id, { isTest: true });
    
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
