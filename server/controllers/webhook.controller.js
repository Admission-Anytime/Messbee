import crypto from 'crypto';
import { enqueueWebhookPayload } from '../queues/webhookQueue.js';
import Channel from '../models/Channel.js';
import { upsertContactInternal } from './contact.controller.js';
import { logMessageInternal } from './inbox.controller.js';
import { cancelSequenceEnrollmentsForContact } from './sequence.controller.js';
import Automation from '../models/Automation.js';
import Contact from '../models/Contact.js';
import { startFlowManually } from '../engine/flowRunner.js';


/**
 * Validates the webhook verification request sent by Meta during app configuration.
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

/**
 * Handles incoming webhook events (messages, statuses) from WhatsApp.
 */
export const handleIncomingMessage = async (req, res) => {
  try {
    // 1. Validate Meta Signature
    const signature = req.headers['x-hub-signature-256'];
    const APP_SECRET = process.env.META_APP_SECRET;
    
    if (signature && APP_SECRET && req.rawBody) {
      const expectedSignature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(req.rawBody).digest('hex');
      if (signature !== expectedSignature) {
        console.error('CRITICAL: Webhook signature mismatch! Rejecting payload.');
        return res.status(403).send('Forbidden');
      }
    }

    const body = req.body;

    // Acknowledge receipt of the webhook to Meta immediately
    res.status(200).send('EVENT_RECEIVED');

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            const message = change.value.messages[0];
            const customerPhone = message.from; // Phone number of the user sending the message
            const phoneNumberId = change.value.metadata.phone_number_id; // The channel receiving it

            let incomingPayload = '';

            // Extract the payload depending on message type
            if (message.type === 'text') {
              incomingPayload = message.text.body;
            } else if (message.type === 'interactive') {
              const interactiveType = message.interactive.type;
              if (interactiveType === 'button_reply') {
                incomingPayload = message.interactive.button_reply.id;
              } else if (interactiveType === 'list_reply') {
                incomingPayload = message.interactive.list_reply.id;
              }
            } else if (message.type === 'button') {
              // Template reply
              incomingPayload = message.button.payload;
            } else if (message.type === 'image') {
              incomingPayload = '[__MEDIA_IMAGE__]';
            } else if (message.type === 'video') {
              incomingPayload = '[__MEDIA_VIDEO__]';
            } else if (message.type === 'audio') {
              incomingPayload = '[__MEDIA_AUDIO__]'; // WhatsApp uses audio for voice notes as well
            } else if (message.type === 'document') {
              incomingPayload = '[__MEDIA_DOCUMENT__]';
            } else if (message.type === 'location') {
              incomingPayload = '[__MEDIA_LOCATION__]';
            } else if (message.type === 'contacts') {
              incomingPayload = '[__MEDIA_CONTACT__]';
            } else if (message.type === 'reaction') {
              incomingPayload = '[__REACTION__]';
            } else {
              incomingPayload = `[Unsupported Message Type: ${message.type}]`;
            }

            const referral = message.referral || null;

            if (referral) {
              console.log(`[Ad Attribution] Referral data detected:`, JSON.stringify(referral));
            }

            console.log(`Received message from ${customerPhone}: ${incomingPayload}`);

            // Find the channel internally based on the Meta Phone Number ID
            const channel = await Channel.findOne({ activeWhatsappPhoneNumberId: phoneNumberId });
            
            if (channel) {
              let profileName = 'Unknown';
              try {
                if (change.value.contacts && change.value.contacts[0] && change.value.contacts[0].profile) {
                  profileName = change.value.contacts[0].profile.name || 'Unknown';
                }
              } catch(e) {}

              const contact = await upsertContactInternal(channel.tenantId, channel._id, customerPhone, profileName);

              if (contact) {
                // Strict Meta Opt-Out Compliance Check
                const incomingText = typeof incomingPayload === 'string' ? incomingPayload.trim().toUpperCase() : '';
                if (['STOP', 'UNSUBSCRIBE', 'CANCEL'].includes(incomingText)) {
                  contact.isOptedOut = true;
                  await contact.save();
                  
                  // Instantly cancel any active sequences and sessions
                  await cancelSequenceEnrollmentsForContact(contact._id);
                  const { CustomerSession } = await import('../models/CustomerSession.js');
                  await CustomerSession.updateMany({ phone: contact.phone, status: 'ACTIVE' }, { status: 'CANCELLED' });
                  
                  // Acknowledge the opt-out directly
                  const { sendWhatsAppMessage } = await import('../engine/flowRunner.js');
                  await sendWhatsAppMessage(contact.phone, {
                    type: 'text',
                    text: { body: 'You have been unsubscribed and will no longer receive automated messages from us.' }
                  }, channel, true); // true = force bypass opt-out block to send this confirmation
                  
                  continue; // Halt further processing of this message
                }

                // If user sends a normal message, and they were opted out, you might optionally opt them back in or leave them opted out.
                // Standard behavior: replying "START" opts them back in.
                if (['START', 'SUBSCRIBE'].includes(incomingText) && contact.isOptedOut) {
                  contact.isOptedOut = false;
                  await contact.save();
                }

                await logMessageInternal({
                  tenantId: channel.tenantId,
                  channelId: channel._id,
                  contactId: contact._id,
                  direction: 'INBOUND',
                  senderType: 'CUSTOMER',
                  messageType: message.type,
                  content: incomingPayload,
                  metaMessageId: message.id,
                  status: 'received'
                });

                // Crucial Marketing Logic: Cancel any active sequence if the user replies!
                await cancelSequenceEnrollmentsForContact(contact._id);
              }

              // Pass the message along to our Background Webhook Queue for asynchronous execution
              // This guarantees the HTTP response completes within 1500ms
              enqueueWebhookPayload(customerPhone, incomingPayload, channel._id, referral, message.id);
            } else {
              console.warn(`No registered channel found for Phone Number ID: ${phoneNumberId}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling webhook payload:', error);
  }
};

/**
 * Handles incoming API requests from external systems (like Zapier, Shopify)
 * to trigger a specific automation flow for a user.
 */
export const handleApiEventTrigger = async (req, res) => {
  try {
    const { channelId, phone, eventName, eventData } = req.body;

    if (!channelId || !phone || !eventName) {
      return res.status(400).json({ message: 'channelId, phone, and eventName are required.' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const activeFlow = await Automation.findOne({
      channelId,
      isActive: true,
      'triggers.type': 'API_EVENT',
      'triggers.value': eventName
    });

    if (!activeFlow) {
      return res.status(404).json({ message: `No active flow found for API event: ${eventName}` });
    }

    // Upsert the contact to ensure they exist before triggering
    const contact = await upsertContactInternal(channel.tenantId, channel._id, phone, 'Unknown');
    if (!contact) {
      return res.status(500).json({ message: 'Failed to find or create contact.' });
    }

    // Initiate the flow manually with the provided payload as variables
    await startFlowManually(phone, channelId, activeFlow._id, eventData || {});

    res.status(200).json({ message: 'Flow triggered successfully.' });

  } catch (error) {
    console.error('Error handling API event trigger:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
