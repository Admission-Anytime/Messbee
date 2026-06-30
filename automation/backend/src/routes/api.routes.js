import express from 'express';
import { getAutomations, getAutomationById, createAutomation, updateAutomation, deleteAutomation, getActivityLog } from '../controllers/automation.controller.js';
import { getChannels, createChannel } from '../controllers/channel.controller.js';
import { getContacts, getContactById, updateContact, deleteContact } from '../controllers/contact.controller.js';
import { getInboxThreads, getChatHistory, sendManualMessage } from '../controllers/inbox.controller.js';
import { getCampaigns, createAndLaunchCampaign } from '../controllers/campaign.controller.js';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { requireAuth, requireApiKey } from '../middleware/auth.middleware.js';
import { triggerEvent } from '../controllers/event.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { automationSchema, channelSchema } from '../validators/schemas.js';

const router = express.Router();

// External Events & Webhooks - Requires special API Key
router.post('/events/trigger', requireApiKey, triggerEvent);

// Protected routes
// Automations
router.get('/automations', requireAuth, getAutomations);
router.get('/automations/activity', requireAuth, getActivityLog);
router.get('/automations/:id', requireAuth, getAutomationById);
router.post('/automations', requireAuth, validate(automationSchema), createAutomation);
router.put('/automations/:id', requireAuth, validate(automationSchema), updateAutomation);
router.delete('/automations/:id', requireAuth, deleteAutomation);

// Channels
router.get('/channels', requireAuth, getChannels);
router.post('/channels', requireAuth, validate(channelSchema), createChannel);

// Contacts (CRM)
router.get('/contacts', requireAuth, getContacts);
router.get('/contacts/:id', requireAuth, getContactById);
router.put('/contacts/:id', requireAuth, updateContact);
router.delete('/contacts/:id', requireAuth, deleteContact);

// Live Team Inbox
router.get('/inbox/threads', requireAuth, getInboxThreads);
router.get('/inbox/:contactId/history', requireAuth, getChatHistory);
router.post('/inbox/:contactId/send', requireAuth, sendManualMessage);

// Broadcast Campaigns
router.get('/campaigns', requireAuth, getCampaigns);
router.post('/campaigns/launch', requireAuth, createAndLaunchCampaign);

// Global Settings
router.get('/settings', requireAuth, getSettings);
router.put('/settings', requireAuth, updateSettings);

export default router;
