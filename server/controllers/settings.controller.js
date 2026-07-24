const TenantSettings = require('../models/TenantSettings');

/**
 * GET /api/settings
 * Returns the tenant's global settings. Creates defaults if none exist.
 */
exports.getSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    let settings = await TenantSettings.findOne({ tenantId });
    if (!settings) {
      settings = await TenantSettings.create({ tenantId });
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

/**
 * PUT /api/settings
 * Updates the tenant's global settings (partial update supported).
 */
exports.updateSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    let settings = await TenantSettings.findOne({ tenantId });
    if (!settings) {
      settings = await TenantSettings.create({ tenantId });
    }

    const { deliveryRules, executionSpeed, crmSync, welcomeMessage, awayMessage, fallbackMessage, spamProtection } = req.body;
    
    if (deliveryRules !== undefined) {
      settings.deliveryRules = deliveryRules;
      settings.markModified('deliveryRules');
    }
    if (executionSpeed !== undefined) {
      settings.executionSpeed = executionSpeed;
      settings.markModified('executionSpeed');
    }
    if (crmSync !== undefined) {
      settings.crmSync = crmSync;
      settings.markModified('crmSync');
    }
    if (welcomeMessage !== undefined) {
      settings.welcomeMessage = welcomeMessage;
      settings.markModified('welcomeMessage');
    }
    if (awayMessage !== undefined) {
      settings.awayMessage = awayMessage;
      settings.markModified('awayMessage');
    }
    if (fallbackMessage !== undefined) {
      settings.fallbackMessage = fallbackMessage;
      settings.markModified('fallbackMessage');
    }
    if (spamProtection !== undefined) {
      settings.spamProtection = spamProtection;
      settings.markModified('spamProtection');
    }
    if (req.body.billing !== undefined) {
      settings.billing = req.body.billing;
      settings.markModified('billing');
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};
