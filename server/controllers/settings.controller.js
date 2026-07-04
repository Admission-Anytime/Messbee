import TenantSettings from '../models/TenantSettings.js';

/**
 * GET /api/settings
 * Returns the tenant's global settings. Creates defaults if none exist.
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await TenantSettings.findOne({ tenantId: req.user.tenantId });
    if (!settings) {
      settings = await TenantSettings.create({ tenantId: req.user.tenantId });
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
export const updateSettings = async (req, res) => {
  try {
    let settings = await TenantSettings.findOne({ tenantId: req.user.tenantId });
    if (!settings) {
      settings = await TenantSettings.create({ tenantId: req.user.tenantId });
    }

    const { deliveryRules, executionSpeed, crmSync, welcomeMessage, awayMessage, fallbackMessage } = req.body;
    
    if (deliveryRules) {
      settings.deliveryRules = { ...settings.deliveryRules.toObject(), ...deliveryRules };
    }
    if (executionSpeed) {
      settings.executionSpeed = { ...settings.executionSpeed.toObject(), ...executionSpeed };
    }
    if (crmSync) {
      settings.crmSync = { ...settings.crmSync.toObject(), ...crmSync };
    }
    if (welcomeMessage !== undefined) {
      const existingWelcomeMessage = settings.welcomeMessage ? settings.welcomeMessage.toObject?.() || settings.welcomeMessage : {};
      settings.welcomeMessage = { ...existingWelcomeMessage, ...welcomeMessage };
    }
    if (awayMessage !== undefined) {
      const existingAwayMessage = settings.awayMessage ? settings.awayMessage.toObject?.() || settings.awayMessage : {};
      settings.awayMessage = { ...existingAwayMessage, ...awayMessage };
    }
    if (fallbackMessage !== undefined) {
      const existingFallbackMessage = settings.fallbackMessage ? settings.fallbackMessage.toObject?.() || settings.fallbackMessage : {};
      settings.fallbackMessage = { ...existingFallbackMessage, ...fallbackMessage };
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};
