import Automation from '../models/Automation.js';

export const getAutomations = async (req, res, next) => {
  try {
    const automations = await Automation.find({ tenantId: req.user.tenantId });
    res.status(200).json(automations);
  } catch (error) {
    next(error);
  }
};

export const getAutomationById = async (req, res, next) => {
  try {
    const automation = await Automation.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    res.status(200).json(automation);
  } catch (error) {
    next(error);
  }
};

export const createAutomation = async (req, res, next) => {
  try {
    const existing = await Automation.findOne({ tenantId: req.user.tenantId, name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
    }

    const automationData = { ...req.body, tenantId: req.user.tenantId };
    const newAutomation = new Automation(automationData);
    const savedAutomation = await newAutomation.save();
    res.status(201).json(savedAutomation);
  } catch (error) {
    next(error);
  }
};

export const updateAutomation = async (req, res, next) => {
  try {
    if (req.body.name) {
      const existing = await Automation.findOne({ tenantId: req.user.tenantId, name: req.body.name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `An automation with the name "${req.body.name}" already exists.` });
      }
    }

    const updatedAutomation = await Automation.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
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

export const deleteAutomation = async (req, res, next) => {
  try {
    const deletedAutomation = await Automation.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!deletedAutomation) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    res.status(200).json({ message: 'Automation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getActivityLog = async (req, res, next) => {
  try {
    const { CustomerSession } = await import('../models/CustomerSession.js');
    
    // We fetch sessions across all channels for this tenant, populated with Automation name
    // Since CustomerSession does not have tenantId directly, we find Automations first or just rely on populate filtering
    const automations = await Automation.find({ tenantId: req.user.tenantId }).select('_id');
    const flowIds = automations.map(a => a._id);

    const CustomerSessionModel = (await import('../models/CustomerSession.js')).default;
    const activities = await CustomerSessionModel.find({ activeFlowId: { $in: flowIds } })
      .populate({ path: 'activeFlowId', select: 'name' })
      .populate({ path: 'channelId', select: 'name phoneNumber' })
      .sort({ lastInteractionAt: -1 })
      .limit(100);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};
