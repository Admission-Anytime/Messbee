const mongoose = require('mongoose');

/**
 * TenantSettings Schema
 * Stores global automation settings per tenant (delivery rules, speed, CRM sync).
 * Matches the "Global Settings" section from the Figma Automation dashboard.
 */
const tenantSettingsSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
    index: true
  },
  defaultChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null
  },
  // Outbound Delivery Rules
  deliveryRules: {
    maxMessagesPerMinute: { type: Number, default: 30 },
    maxMessagesPerDay: { type: Number, default: 1000 },
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: '22:00' }, // HH:mm
    quietHoursEnd: { type: String, default: '08:00' }
  },
  // Speed / Production
  executionSpeed: {
    delayBetweenMessages: { type: Number, default: 500 }, // ms between sequential messages
    maxConcurrentFlows: { type: Number, default: 50 },
    mode: { type: String, enum: ['normal', 'fast', 'conservative'], default: 'normal' }
  },
  // CRM Sync
  crmSync: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['none', 'hubspot', 'salesforce', 'zoho', 'custom_webhook'], default: 'none' },
    webhookUrl: { type: String, default: '' },
    syncContacts: { type: Boolean, default: true },
    syncConversations: { type: Boolean, default: false }
  },
  // Welcome Message Settings
  welcomeMessage: {
    enabled: { type: Boolean, default: false },
    automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', default: null }
  },
  // Away Message Settings
  awayMessage: {
    enabled: { type: Boolean, default: false },
    timezone: { type: String, default: 'UTC' },
    holidayMode: { type: Boolean, default: false },
    automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', default: null },
    workingHours: {
      type: Map,
      of: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '17:00' }
      },
      default: {
        monday: { isOpen: true, open: '09:00', close: '17:00' },
        tuesday: { isOpen: true, open: '09:00', close: '17:00' },
        wednesday: { isOpen: true, open: '09:00', close: '17:00' },
        thursday: { isOpen: true, open: '09:00', close: '17:00' },
        friday: { isOpen: true, open: '09:00', close: '17:00' },
        saturday: { isOpen: false, open: '09:00', close: '17:00' },
        sunday: { isOpen: false, open: '09:00', close: '17:00' }
      }
    }
  },
  // Fallback Message Settings
  fallbackMessage: {
    enabled: { type: Boolean, default: false },
    automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', default: null }
  },
  // Spam Protection
  spamProtection: {
    enabled: { type: Boolean, default: false },
    rateLimitWindowMs: { type: Number, default: 60000 },
    maxMessagesPerWindow: { type: Number, default: 10 },
    blocklist: [{ type: String }] // Array of phone numbers
  },
  // Billing & Invoice Settings
  billing: {
    companyName: { type: String, default: '' },
    logo: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'INV-' },
    currency: { type: String, default: 'INR' },
    taxPercentage: { type: Number, default: 18 } // Default GST
  },
  // Meta Commerce (WhatsApp Catalog Sync)
  metaCommerce: {
    catalogId: { type: String, default: '' },
    systemUserToken: { type: String, default: '' }
  }
}, {
  timestamps: true
});

const TenantSettings = mongoose.model('TenantSettings', tenantSettingsSchema);
module.exports = TenantSettings;

