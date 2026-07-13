import axios from 'axios';
import { parseDynamicVariables } from '../engine/nodeExecutors.js';
import { logMessageInternal } from '../controllers/inbox.controller.js';
import Campaign from '../models/Campaign.js';

/**
 * In-memory Mock Queue for Campaign Blasts (Replaces BullMQ + Redis for Local Dev).
 * Processes contacts in chunks to respect rate limits and avoid blocking the Node event loop.
 */
class CampaignQueueMock {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
  }

  add(campaign, targetContacts, channel) {
    this.jobs.push({ campaign, targetContacts, channel });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;

    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      await this.processCampaignJob(job.campaign, job.targetContacts, job.channel);
    }

    this.isProcessing = false;
  }

  async processCampaignJob(campaign, targetContacts, channel) {
    let sent = 0;
    let failed = 0;
    
    // Process in batches of 50 to avoid hogging memory
    const BATCH_SIZE = 50;

    for (let i = 0; i < targetContacts.length; i += BATCH_SIZE) {
      const batch = targetContacts.slice(i, i + BATCH_SIZE);
      const promises = batch.map(contact => this.processSingleMessage(campaign, contact, channel));
      
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
        }
      });

      // Small delay between batches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Finalize stats
    try {
      const dbCampaign = await Campaign.findById(campaign._id);
      if (dbCampaign) {
        dbCampaign.status = 'COMPLETED';
        dbCampaign.stats.sent = sent;
        dbCampaign.stats.failed = failed;
        await dbCampaign.save();
      }
    } catch (err) {
      console.error('Failed to update campaign stats:', err);
    }
  }

  async processSingleMessage(campaign, contact, channel) {
    try {
      const contextData = {
        contact: { name: contact.name, phone: contact.phone, id: contact._id },
        ...Object.fromEntries(contact.customFields || new Map())
      };

      const parameters = (campaign.variablesMapping || []).map(mapping => ({
        type: 'text',
        text: parseDynamicVariables(mapping.value, contextData)
      }));

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: contact.phone,
        type: 'template',
        template: {
          name: campaign.templateName,
          language: { code: campaign.templateLanguage || 'en_US' },
          components: parameters.length > 0 ? [{ type: 'body', parameters }] : []
        }
      };

      let metaMessageId = null;
      const url = `https://graph.facebook.com/v21.0/${channel.activeWhatsappPhoneNumberId}/messages`;
      const response = await axios.post(url, payload, {
        headers: { 'Authorization': `Bearer ${channel.metaAccessToken}`, 'Content-Type': 'application/json' }
      });
      metaMessageId = response.data.messages[0].id;

      await logMessageInternal({
        tenantId: campaign.tenantId,
        channelId: channel._id,
        contactId: contact._id,
        direction: 'OUTBOUND',
        senderType: 'BOT',
        messageType: 'template',
        content: `Template: ${campaign.templateName}`,
        metaMessageId,
        status: 'sent'
      });

      return true; // Success
    } catch (error) {
      console.error(`Failed to send campaign to ${contact.phone}:`, error.response?.data || error.message);
      return false; // Failed
    }
  }
}

export const enqueueCampaignBlast = (campaign, targetContacts, channel) => {
  // Use a singleton instance
  if (!global.campaignQueueInstance) {
    global.campaignQueueInstance = new CampaignQueueMock();
  }
  global.campaignQueueInstance.add(campaign, targetContacts, channel);
};
