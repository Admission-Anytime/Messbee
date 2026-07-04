const ApiKey = require('../models/ApiKey');
const Webhook = require('../models/Webhook');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const INITIAL_EVENTS = [
  { id: 'messages', label: 'Messages Received', desc: 'Triggered when a new message arrives.', enabled: true, color: 'bg-green-500' },
  { id: 'status', label: 'Status Updates', desc: 'Delivery, read, and delivery fail reports.', enabled: true, color: 'bg-blue-500' },
  { id: 'alerts', label: 'System Alerts', desc: 'Critical errors and account notifications.', enabled: false, color: 'bg-orange-500' },
];

/**
 * @desc    Get all API keys for user
 * @route   GET /api/dev/keys
 * @access  Private
 */
exports.getApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: keys.length, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create new API key
 * @route   POST /api/dev/keys
 * @access  Private
 */
exports.createApiKey = async (req, res) => {
  try {
    const { name, permission } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a key name' });
    }

    // Generate random raw key
    const rawKey = `mb_${crypto.randomBytes(24).toString('hex')}`;
    const maskedKey = `mb_••••••••••••${rawKey.slice(-4)}`;

    // Hash the raw key using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(rawKey, salt);

    const newKey = await ApiKey.create({
      user: req.user.id,
      name,
      key: hashedKey,
      maskedKey,
      permission: permission || 'Read-only',
    });

    // We send back the raw key just once! It won't be retrievable again.
    res.status(201).json({
      success: true,
      data: {
        _id: newKey._id,
        name: newKey.name,
        maskedKey: newKey.maskedKey,
        permission: newKey.permission,
        status: newKey.status,
        createdAt: newKey.createdAt,
        rawKey, // CRITICAL: only time this is returned
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete (Revoke) API key
 * @route   DELETE /api/dev/keys/:id
 * @access  Private
 */
exports.deleteApiKey = async (req, res) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!key) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    await ApiKey.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ success: true, message: 'API key revoked properly' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get Webhook Configuration
 * @route   GET /api/dev/webhook
 * @access  Private
 */
exports.getWebhookConfig = async (req, res) => {
  try {
    let webhook = await Webhook.findOne({ user: req.user.id });

    // If it doesn't exist, create it with initial events defaults
    if (!webhook) {
      webhook = await Webhook.create({
        user: req.user.id,
        events: INITIAL_EVENTS,
      });
    }

    res.status(200).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Save Webhook Config
 * @route   POST /api/dev/webhook
 * @access  Private
 */
exports.saveWebhookConfig = async (req, res) => {
  try {
    const { callbackUrl, verifyToken } = req.body;
    
    let webhook = await Webhook.findOne({ user: req.user.id });
    
    if (!webhook) {
      webhook = await Webhook.create({ user: req.user.id, events: INITIAL_EVENTS, callbackUrl, verifyToken });
    } else {
      webhook.callbackUrl = callbackUrl !== undefined ? callbackUrl : webhook.callbackUrl;
      webhook.verifyToken = verifyToken !== undefined ? verifyToken : webhook.verifyToken;
      await webhook.save();
    }

    res.status(200).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Toggle Webhook Event
 * @route   PATCH /api/dev/webhook/events/:eventId
 * @access  Private
 */
exports.toggleWebhookEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    let webhook = await Webhook.findOne({ user: req.user.id });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook config not found' });
    }

    const eventIndex = webhook.events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      webhook.events[eventIndex].enabled = !webhook.events[eventIndex].enabled;
      await webhook.save();
    } else {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
