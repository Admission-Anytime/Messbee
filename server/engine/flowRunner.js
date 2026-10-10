import axios from 'axios';
import Channel from '../models/Channel.js';
import Automation from '../models/Automation.js';
import CustomerSession from '../models/CustomerSession.js';
import {
  executeConditionNode,
  executeApiCallNode,
  executeActionNode,
  executeGoogleSheetsNode,
  executeAiNode,
  executeRandomizerNode,
  executeShopifyNode,
  parseDynamicVariables
} from './nodeExecutors.js';
import { scheduleDelayedNode } from '../queues/delayQueue.js';
import { logMessageInternal } from '../controllers/inbox.controller.js';
import Contact from '../models/Contact.js';
import RoutingRule from '../models/RoutingRule.js';
import TenantSettings from '../models/TenantSettings.js';
import { getIO } from '../config/socket.js';
import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const logger = _require('../utils/logger.js');


async function markSessionCompleted(session, customerPhone, channelId) {
  if (!session) return;
  if (session.status === 'HANDOFF') {
    try { await session.save(); } catch (_) {}
    return;
  }
  session.status = 'COMPLETED';
  try {
    await session.save();
  } catch (err) {
    logger.error('Error saving completed session:', err.message);
  }

  try {
    const contact = await Contact.findOne({ phone: customerPhone, channelId });
    if (contact && session.sessionVariables) {
      if (!contact.customFields || typeof contact.customFields !== 'object') {
        contact.customFields = {};
      }

      const syncKeyVal = (rawKey, val) => {
        const cleanKey = rawKey.replace(/^contact\./, '');
        if (['name', 'email'].includes(cleanKey)) {
          contact[cleanKey] = val;
          return;
        }
        if (contact.customFields instanceof Map) {
          contact.customFields.set(cleanKey, val);
        } else if (Array.isArray(contact.customFields)) {
          const idx = contact.customFields.findIndex(f => f.key === cleanKey || f.name === cleanKey);
          if (idx !== -1) {
            contact.customFields[idx].value = val;
          } else {
            contact.customFields.push({ key: cleanKey, name: cleanKey, value: val });
          }
          contact.markModified('customFields');
        } else {
          contact.customFields[cleanKey] = val;
          contact.markModified('customFields');
        }
      };

      if (typeof session.sessionVariables.entries === 'function') {
        for (let [key, value] of session.sessionVariables.entries()) {
          syncKeyVal(key, value);
        }
      } else if (typeof session.sessionVariables === 'object') {
        for (let [key, value] of Object.entries(session.sessionVariables)) {
          syncKeyVal(key, value);
        }
      }
      
      // Sync tags
      if (session.tags && Array.isArray(session.tags) && session.tags.length > 0) {
        for (const tag of session.tags) {
          if (!contact.tags.includes(tag)) {
            contact.tags.push(tag);
          }
        }
      }
      
      await contact.save();
      
      // Execute CRM Webhook Sync if enabled
      try {
        const settings = await TenantSettings.findOne({ tenantId: contact.tenantId });
        if (settings && settings.crmSync && settings.crmSync.enabled && settings.crmSync.provider === 'custom_webhook' && settings.crmSync.webhookUrl) {
          const sessionVarsObj = typeof session.sessionVariables.entries === 'function'
            ? Object.fromEntries(session.sessionVariables)
            : (session.sessionVariables || {});
          let cFieldsObj = {};
          if (contact.customFields) {
            if (typeof contact.customFields.entries === 'function') {
              cFieldsObj = Object.fromEntries(contact.customFields);
            } else if (Array.isArray(contact.customFields)) {
              contact.customFields.forEach(f => {
                const k = f.key || f.name;
                if (k) cFieldsObj[k] = f.value;
              });
            } else if (typeof contact.customFields === 'object') {
              cFieldsObj = contact.customFields;
            }
          }
          const payload = {
            event: 'flow_completed',
            phone: contact.phone,
            name: contact.name,
            tags: contact.tags,
            customFields: cFieldsObj,
            sessionVariables: sessionVarsObj
          };
          await axios.post(settings.crmSync.webhookUrl, payload, { timeout: 5000 }).catch(e => logger.error('CRM Webhook Post error:', e.message));
        }
      } catch (err) {
        logger.error('Failed to execute CRM sync:', err.message);
      }
    }
  } catch(e) {
    logger.error('Failed to sync CRM fields:', e);
  }
}

/**
 * Synchronizes session variables into contextData so subsequent nodes can access them dynamically
 */
function syncContextVariables(session, contextData) {
  if (!session || !contextData) return;
  if (session.sessionVariables) {
    const entries = typeof session.sessionVariables.entries === 'function'
      ? session.sessionVariables.entries()
      : Object.entries(session.sessionVariables);
    for (const [k, v] of entries) {
      contextData[k] = v;
      if (k.startsWith('contact.')) {
        const field = k.replace(/^contact\./, '');
        if (!contextData.contact) contextData.contact = {};
        contextData.contact[field] = v;
      }
    }
  }
}

/**
 * Evaluates whether incoming text/media matches an automation trigger node
 */
function isFlowTriggerMatch(tNode, payloadText, messageContext = {}, isNewContact = false) {
  if (!tNode || !tNode.data) return false;
  let matchType = String(tNode.data.matchType || tNode.data.triggerType || 'exact_match').toLowerCase().trim();
  if (matchType === 'keyword') {
    matchType = (tNode.data.matchType && tNode.data.matchType !== 'keyword') ? String(tNode.data.matchType).toLowerCase() : 'contains';
  }
  const kw = (tNode.data.keyword || '').toLowerCase().trim();
  const lowerPayload = (payloadText || '').toLowerCase().trim();
  const cleanPayload = lowerPayload.replace(/[!.,?]+$/g, '').trim();
  const msgType = String(messageContext?.messageType || '').toLowerCase();

  // Media triggers (match both payload placeholders and real messageType)
  const isImage = msgType === 'image' || lowerPayload === '[__media_image__]';
  const isVideo = msgType === 'video' || lowerPayload === '[__media_video__]';
  const isDoc = msgType === 'document' || lowerPayload === '[__media_document__]';
  const isAudio = ['audio', 'voice'].includes(msgType) || lowerPayload === '[__media_audio__]';
  const isLocation = msgType === 'location' || lowerPayload === '[__media_location__]';
  const isContact = ['contacts', 'contact'].includes(msgType) || lowerPayload === '[__media_contact__]';
  const isReaction = msgType === 'reaction' || lowerPayload === '[__reaction__]';
  const isOrder = msgType === 'order' || lowerPayload === '[__order__]';

  if (matchType === 'image_received') return isImage;
  if (matchType === 'video_received') return isVideo;
  if (matchType === 'document_received') return isDoc;
  if (matchType === 'voice_received') return isAudio;
  if (matchType === 'location_received') return isLocation;
  if (matchType === 'contact_shared') return isContact;
  if (matchType === 'reaction') return isReaction;
  if (['media_any', 'media_received'].includes(matchType)) return isImage || isVideo || isDoc || isAudio;
  if (['order_created', 'order'].includes(matchType)) return isOrder;
  if (['new_subscriber', 'new_contact'].includes(matchType)) return !!isNewContact;

  // Keyword-based matching
  if (['exact_match', 'exact', 'qr_link', 'whatsapp_ad', 'interactive_template', 'template_reply', 'button_click', 'list_selection'].includes(matchType) && kw !== '') {
    const keywords = kw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    return keywords.includes(lowerPayload) || (cleanPayload && keywords.includes(cleanPayload));
  } else if (['contains', 'contain', 'includes'].includes(matchType) && kw !== '') {
    const keywords = kw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    return keywords.some(k => lowerPayload.includes(k) || (cleanPayload && cleanPayload.includes(k)));
  } else if (matchType === 'starts_with' && kw !== '') {
    const keywords = kw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    return keywords.some(k => lowerPayload.startsWith(k) || (cleanPayload && cleanPayload.startsWith(k)));
  } else if (matchType === 'ends_with' && kw !== '') {
    const keywords = kw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    return keywords.some(k => lowerPayload.endsWith(k) || (cleanPayload && cleanPayload.endsWith(k)));
  } else if (matchType === 'any_message') {
    return lowerPayload !== '' || ['text', 'image', 'video', 'document', 'audio', 'voice', 'location', 'contacts', 'button', 'interactive'].includes(msgType);
  }
  
  // Safe keyword fallback: if a keyword is provided, match if payload contains it
  if (kw !== '') {
    const keywords = kw.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    if (keywords.some(k => lowerPayload.includes(k) || (cleanPayload && cleanPayload.includes(k)))) {
      return true;
    }
  }
  return false;
}

export async function sendWhatsAppMessage(toPhone, payload, channel, forceBypassOptOut = false) {
  try {
    // ---- SIMULATOR INTERCEPTION ----
    if (toPhone.startsWith('SIMULATOR_')) {
      logger.log(`[SIMULATOR] Intercepted outbound message to ${toPhone}`);
      const io = getIO();
      if (io) {
        const msgId = `sim_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const simMsg = { 
          msgId,
          direction: 'OUTBOUND', 
          payload,
          timestamp: new Date()
        };
        // Emit once globally to avoid duplicate packet reception
        io.emit('simulator_message', simMsg);
      }
      return null;
    }
    // --------------------------------

    const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v20.0'}/${channel.activeWhatsappPhoneNumberId}/messages`;

    // 1. Meta Opt-Out Compliance Check
    const contact = await Contact.findOne({ phone: toPhone, tenantId: channel.tenantId });
    if (!forceBypassOptOut) {
      if (contact && contact.isOptedOut) {
        logger.log(`[Compliance] Blocked outbound message to ${toPhone} because they are opted out.`);
        return null;
      }
    }
    
    // 1.5 Global Delivery Rules (Quiet Hours) Check
    try {
      const { default: TenantSettings } = await import('../models/TenantSettings.js');
      const settings = await TenantSettings.findOne({ tenantId: channel.tenantId });
      if (settings && settings.deliveryRules && settings.deliveryRules.quietHoursEnabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Parse quiet hours (format: "HH:mm")
        const startParts = (settings.deliveryRules.quietHoursStart || '22:00').split(':');
        const endParts = (settings.deliveryRules.quietHoursEnd || '08:00').split(':');
        
        const startHour = parseInt(startParts[0]);
        const startMin = parseInt(startParts[1]);
        const endHour = parseInt(endParts[0]);
        const endMin = parseInt(endParts[1]);
        
        // Convert to minutes from midnight
        const currentMins = currentHour * 60 + currentMinute;
        const startMins = startHour * 60 + startMin;
        const endMins = endHour * 60 + endMin;
        
        let isQuiet = false;
        if (startMins < endMins) {
          // e.g., 08:00 to 17:00
          if (currentMins >= startMins && currentMins < endMins) isQuiet = true;
        } else {
          // e.g., 22:00 to 08:00 (crosses midnight)
          if (currentMins >= startMins || currentMins < endMins) isQuiet = true;
        }
        
        if (isQuiet) {
          logger.log(`[Delivery Rules] Blocked message to ${toPhone} due to Quiet Hours (${settings.deliveryRules.quietHoursStart} - ${settings.deliveryRules.quietHoursEnd})`);
          return null; // Don't send the message
        }
      }
    } catch (e) {
      logger.error('Error checking delivery rules:', e.message);
    }

    const cleanToPhone = toPhone.toString().replace(/\D/g, '');
    if (payload && payload.to) {
      payload.to = payload.to.toString().replace(/\D/g, '');
    }

    // 2. 24-Hour Rule Compliance (Meta blocks non-templates after 24h)
    if (payload.type !== 'template') {
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      let mostRecentInteraction = contact?.lastInteractionAt ? new Date(contact.lastInteractionAt).getTime() : 0;

      // If contact interaction is missing or old, check if there was a recent inbound message on the chat
      if (!mostRecentInteraction || Date.now() - mostRecentInteraction > TWENTY_FOUR_HOURS) {
        try {
          const { default: Chat } = await import('../models/Chat.js');
          const recentChat = await Chat.findOne({
            $or: [{ phone: toPhone }, { whatsappId: toPhone }, { phone: cleanToPhone }, { whatsappId: cleanToPhone }]
          }).select('lastInboundAt').lean();
          if (recentChat?.lastInboundAt) {
            mostRecentInteraction = Math.max(mostRecentInteraction, new Date(recentChat.lastInboundAt).getTime());
          }
        } catch (_) {}
      }

      // Only block if we have a confirmed past interaction and it is truly > 24 hours ago
      if (mostRecentInteraction > 0 && (Date.now() - mostRecentInteraction > TWENTY_FOUR_HOURS)) {
        logger.warn(`[Compliance] Blocked free-form message to ${toPhone}. Last interaction > 24h ago.`);
        return null;
      }
    }

    let metaMessageId = null;

    if (toPhone.startsWith('SIMULATOR_')) {
      logger.log(`\n[SIMULATION MODE] Intercepted message to ${toPhone}:`);
      logger.log(JSON.stringify(payload, null, 2));
      
      const io = getIO();
      if (io) {
        io.to(channel._id.toString()).emit('simulator_message', {
          direction: 'OUTBOUND',
          payload: payload,
          timestamp: new Date()
        });
        logger.log(`[SIMULATOR] Emitted simulator_message to room ${channel._id.toString()}`);
      } else {
        logger.warn('[SIMULATOR] Socket.io not initialized, cannot send simulator message to frontend');
      }
      
      metaMessageId = `sim_${Date.now()}`;
    } else {
      // 💳 Pre-flight WCC Wallet Balance Check for Automation
      let walletService = null;
      let autoCategory = payload.type === 'template' ? 'UTILITY' : 'SERVICE';
      try {
        walletService = (await import('../services/walletService.js')).default || require('../services/walletService.js');
        const pricingConfig = (await import('../config/pricingConfig.js')).default || require('../config/pricingConfig.js');
        const { getMessageCost } = pricingConfig;
        
        // Determine category (Templates may specify or default to UTILITY for automated notifications)
        const User = (await import('../models/User.js')).default || require('../models/User.js');
        const userPricingDoc = await User.findOne({
          $or: [{ _id: channel.tenantId }, { tenantId: channel.tenantId }]
        }).select('customPricing').lean();
        const autoCost = getMessageCost(autoCategory, toPhone, userPricingDoc?.customPricing);

        const hasBalance = await walletService.hasSufficientCredits(channel.tenantId, autoCost);
        if (!hasBalance) {
          logger.warn(`[Automation] Skipped outbound ${autoCategory} message to ${toPhone}. Insufficient WCC Credits for tenant ${channel.tenantId}`);
          return null;
        }
      } catch (balErr) {
        logger.error('[Automation] Wallet check error, blocking message:', balErr.message);
        return null;
      }

      if (payload.type === 'template' && payload.template?.name) {
        try {
          const { getTenantWhatsAppService } = await import('../controllers/whatsappController.js');
          const tenantWhatsAppService = await getTenantWhatsAppService(channel.tenantId);
          let sent = false;
          if (tenantWhatsAppService) {
            const sendResult = await tenantWhatsAppService.sendTemplateMessage(
              toPhone,
              payload.template.name,
              payload.template.language?.code || 'en_US',
              payload.template.components || []
            );
            if (sendResult && sendResult.success) {
              metaMessageId = sendResult.messageId || null;
              sent = true;
            }
          }
          if (!sent) {
            const response = await axios.post(url, payload, {
              headers: {
                'Authorization': `Bearer ${channel.metaAccessToken}`,
                'Content-Type': 'application/json'
              }
            });
            metaMessageId = response.data?.messages?.[0]?.id || null;
          }
        } catch (tmplErr) {
          logger.error(`[flowRunner] Template send error for ${payload.template.name}:`, tmplErr.message);
          throw tmplErr;
        }
      } else {
        logger.log(`\n📤 [WhatsApp API] Sending ${payload.type || 'message'} to: ${toPhone}`);
        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${channel.metaAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        metaMessageId = response.data?.messages?.[0]?.id || null;
        logger.log(`✅ [WhatsApp API] Send Success! Message ID: ${metaMessageId}\n`);
      }

      // Deduct WCC credits for successful automated message
      if (walletService) {
        try {
          await walletService.deductMessageCredits({
            tenantId: channel.tenantId,
            category: autoCategory,
            recipientPhone: toPhone
          });
        } catch (deductErr) {
          logger.warn('[Automation] Deduct credits warning:', deductErr.message);
        }
      }
    }

    // 1. Log to Contact message logs if contact exists
    const logContact = await Contact.findOne({ phone: toPhone, channelId: channel._id });
    if (logContact) {
      let content = payload.type === 'text' ? payload.text.body : JSON.stringify(payload[payload.type] || payload);
      await logMessageInternal({
        tenantId: channel.tenantId,
        channelId: channel._id,
        contactId: logContact._id,
        direction: 'OUTBOUND',
        senderType: 'BOT',
        messageType: payload.type || 'unknown',
        content,
        metaMessageId,
        status: 'sent'
      });
    }

    // 2. Also log to Chat and Message collection so it appears live in the Chat inbox!
    try {
      const { default: Chat } = await import('../models/Chat.js');
      const { default: Message } = await import('../models/Message.js');
      const { normalizePhoneNumber } = await import('../utils/phoneHelper.js');
      const normalizedTo = normalizePhoneNumber ? normalizePhoneNumber(toPhone) : toPhone.replace(/\D/g, '');

      let chat = await Chat.findOne({
        ...(channel.tenantId ? { user: channel.tenantId } : {}),
        $or: [
          { phone: normalizedTo },
          { whatsappId: normalizedTo },
          { phone: toPhone },
          { whatsappId: toPhone }
        ]
      });

      if (!chat) {
        chat = await Chat.findOne({
          $or: [
            { phone: normalizedTo },
            { whatsappId: normalizedTo },
            { phone: toPhone },
            { whatsappId: toPhone }
          ]
        });
      }

      if (!chat && channel.tenantId) {
        try {
          chat = await Chat.create({
            phone: normalizedTo,
            whatsappId: normalizedTo,
            name: toPhone,
            user: channel.tenantId,
            unread: 0,
            status: 'active'
          });
        } catch (_) {}
      }

      if (chat) {
        let outboundText = '';
        if (payload.type === 'text') {
          outboundText = payload.text?.body || '';
        } else if (payload.type === 'interactive') {
          const bodyText = payload.interactive?.body?.text || '';
          const buttonsText = (payload.interactive?.action?.buttons || [])
            .map(b => b.reply?.title)
            .filter(Boolean)
            .join(' | ');
          outboundText = buttonsText ? `${bodyText}\n[Buttons: ${buttonsText}]` : bodyText;
        } else if (payload.type === 'template') {
          outboundText = payload._sim_template_text || `Template: ${payload.template?.name}`;
        } else {
          outboundText = payload[payload.type]?.caption || `[${payload.type}]`;
        }

        const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        const savedOutbound = await Message.create({
          chatId: chat._id,
          user: chat.user || channel.tenantId,
          text: outboundText,
          sender: 'me',
          time: msgTime,
          whatsappMessageId: metaMessageId,
          messageType: payload.type === 'interactive' ? 'interactive' : (payload.type === 'template' ? 'template' : 'text'),
          status: 'sent',
          metadata: payload,
          templateName: payload.type === 'template' ? (payload.template?.name || null) : null
        });

        chat.lastMsg = outboundText || chat.lastMsg;
        chat.lastMsgTime = msgTime;
        chat.lastActivity = new Date();
        await chat.save();

        try {
          const io = getIO();
          if (io) {
            const tenantRoom = `tenant_${chat.user?.toString() || channel.tenantId?.toString()}`;
            io.to(chat._id.toString()).to(tenantRoom).emit('receive_message', {
              chatId: chat._id,
              message: savedOutbound,
              chat: chat
            });
            io.to(tenantRoom).emit('chat_updated', chat);
          }
        } catch (sErr) {}
      }
    } catch (chatLogErr) {
      logger.warn('[FlowRunner] Outbound chat logging warning:', chatLogErr.message);
    }

  } catch (error) {
    logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
}

// Function parseDynamicVariables is now imported from nodeExecutors.js

/**
 * Constructs the interactive payload based on node data
 */
function buildMessagePayload(phone, nodeType, nodeData, contextData = {}) {
  const basePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
  };

  const { messageType, text, question, mediaUrl, interactiveButtons, buttons, headerType, headerText } = nodeData;
  const rawText = text || question || '';
  const parsedText = parseDynamicVariables(rawText, contextData);
  const btns = buttons || interactiveButtons || [];

  if (messageType === 'interactive' || nodeType === 'interactiveNode') {
    if (btns.length === 0) {
      return { ...basePayload, type: 'text', text: { body: parsedText || 'Please configure buttons.' } };
    }
    const interactive = {
      type: 'button',
      body: { text: parsedText || 'Select an option' },
      action: {
        buttons: btns.slice(0, 3).map((btn, idx) => {
          const rawId = parseDynamicVariables(btn.id, contextData) ?? btn.id;
          const btnId = (rawId !== undefined && rawId !== null && String(rawId).trim() !== '') ? String(rawId) : `btn_${idx}`;
          const rawTitle = parseDynamicVariables(btn.title || btn.text, contextData) || btn.title || btn.text || `Option ${idx + 1}`;
          const btnTitle = String(rawTitle).trim().substring(0, 20);
          return {
            type: 'reply',
            reply: { 
              id: btnId, 
              title: btnTitle
            }
          };
        })
      }
    };

    if (headerType && headerText) {
      interactive.header = { type: 'text', text: parseDynamicVariables(headerText, contextData) };
    } else if (headerType && mediaUrl) {
      const parsedMediaUrl = parseDynamicVariables(mediaUrl, contextData);
      if (parsedMediaUrl) {
        interactive.header = {
          type: headerType,
          [headerType]: { link: parsedMediaUrl }
        };
      }
    }

    return {
      ...basePayload,
      type: 'interactive',
      interactive
    };
  }

  if (messageType === 'text' || nodeType === 'messageNode') {
    return {
      ...basePayload,
      type: 'text',
      text: { body: parsedText || ' ' }
    };
  }

  if (messageType === 'menu' || nodeType === 'menuNode') {
    let sectionsSource = nodeData.sections;
    if ((!sectionsSource || sectionsSource.length === 0) && (nodeData.menuType === 'slots' || nodeData.dateSlots || nodeData.slotPicker)) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);

      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const fmtShort = (d) => `${d.getDate()} ${monthsShort[d.getMonth()]}`;

      sectionsSource = [
        {
          title: `Today (${fmtShort(now)})`,
          rows: [
            { id: 'slot_today_11am', title: '11:00 AM - 12:00 PM', description: 'Morning Slot' },
            { id: 'slot_today_03pm', title: '03:00 PM - 04:00 PM', description: 'Afternoon Slot' },
            { id: 'slot_today_06pm', title: '06:00 PM - 07:00 PM', description: 'Evening Slot' }
          ]
        },
        {
          title: `Tomorrow (${fmtShort(tomorrow)})`,
          rows: [
            { id: 'slot_tomorrow_11am', title: '11:00 AM - 12:00 PM', description: 'Morning Slot' },
            { id: 'slot_tomorrow_03pm', title: '03:00 PM - 04:00 PM', description: 'Afternoon Slot' },
            { id: 'slot_tomorrow_06pm', title: '06:00 PM - 07:00 PM', description: 'Evening Slot' }
          ]
        },
        {
          title: `Day After (${fmtShort(dayAfter)})`,
          rows: [
            { id: 'slot_dayafter_11am', title: '11:00 AM - 12:00 PM', description: 'Morning Slot' },
            { id: 'slot_dayafter_03pm', title: '03:00 PM - 04:00 PM', description: 'Afternoon Slot' },
            { id: 'slot_dayafter_06pm', title: '06:00 PM - 07:00 PM', description: 'Evening Slot' }
          ]
        }
      ];
    }
    const validSections = (sectionsSource || []).filter(sec => sec.rows && sec.rows.length > 0);
    if (validSections.length === 0) {
      return { ...basePayload, type: 'text', text: { body: parsedText || 'Please configure menu options.' } };
    }
    const resolvedHeader = nodeData.header || (nodeData.headerType && nodeData.headerText ? nodeData.headerText : '');
    return {
      ...basePayload,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: resolvedHeader ? { type: 'text', text: (parseDynamicVariables(resolvedHeader, contextData) || '').substring(0, 60) } : undefined,
        body: { text: parsedText || 'Please select an option from the list' },
        footer: nodeData.footer ? { text: (parseDynamicVariables(nodeData.footer, contextData) || '').substring(0, 60) } : undefined,
        action: {
          button: (parseDynamicVariables(nodeData.menuButtonText, contextData) || 'View Options').substring(0, 20),
          sections: validSections.map(sec => ({
            title: (parseDynamicVariables(sec.title, contextData) || 'Options').substring(0, 24),
            rows: (sec.rows || []).slice(0, 10).map((row, rIdx) => ({
              id: (parseDynamicVariables(row.postbackId, contextData) || row.id || `row_${rIdx}`).substring(0, 200),
              title: (parseDynamicVariables(row.title, contextData) || `Option ${rIdx + 1}`).substring(0, 24),
              description: row.description ? (parseDynamicVariables(row.description, contextData) || '').substring(0, 72) : undefined
            }))
          }))
        }
      }
    };
  }

  if (messageType === 'input' || nodeType === 'inputNode') {
    return {
      ...basePayload,
      type: 'text',
      text: { body: parsedText || 'Please reply:' }
    };
  }

  if (nodeType === 'mediaNode') {
    const parsedMediaUrl = parseDynamicVariables(nodeData.mediaUrl, contextData);
    if (!parsedMediaUrl) {
      return { ...basePayload, type: 'text', text: { body: 'Missing media URL.' } };
    }
    
    let metaType = nodeData.messageType || 'image';
    if (metaType === 'doc') metaType = 'document';
    if (metaType === 'voice') metaType = 'audio';
    if (metaType === 'gif') metaType = 'video';

    const isAudioOrSticker = metaType === 'audio' || metaType === 'sticker';
    
    return {
      ...basePayload,
      type: metaType,
      [metaType]: {
        link: parsedMediaUrl,
        ...(nodeData.messageType === 'voice' ? { ptt: true } : {}),
        ...(!isAudioOrSticker ? { caption: parseDynamicVariables(nodeData.text, contextData) } : {})
      }
    };
  }

  if (nodeType === 'templateNode') {
    if (!nodeData.templateName) {
      return { ...basePayload, type: 'text', text: { body: 'Missing template configuration.' } };
    }

    const payload = {
      ...basePayload,
      type: 'template',
      template: {
        name: nodeData.templateName,
        language: { code: nodeData.templateLanguage || 'en_US' }
      }
    };

    const components = [];

    // 1. Header component (Media or dynamic text)
    if (nodeData.mediaUrl && ['image', 'video', 'document'].includes(nodeData.headerType)) {
      const parsedUrl = parseDynamicVariables(nodeData.mediaUrl, contextData);
      if (parsedUrl) {
        components.push({
          type: 'header',
          parameters: [{
            type: nodeData.headerType,
            [nodeData.headerType]: { link: parsedUrl }
          }]
        });
      }
    } else if (nodeData.headerType === 'text' && nodeData.headerVariables && nodeData.headerVariables.length > 0) {
      components.push({
        type: 'header',
        parameters: nodeData.headerVariables.map(v => ({
          type: 'text',
          text: parseDynamicVariables(v.value, contextData) || ' '
        }))
      });
    }

    // 2. Body component (Variables {{1}}, {{2}})
    if (nodeData.variables && nodeData.variables.length > 0) {
      components.push({
        type: 'body',
        parameters: nodeData.variables.map((v, vIdx) => {
          let evaluated = parseDynamicVariables(v?.value, contextData);
          if (!evaluated || evaluated.trim() === '') {
            const raw = String(v?.value || '').toLowerCase();
            if (raw.includes('name')) evaluated = contextData.contact?.name || 'Customer';
            else if (raw.includes('phone')) evaluated = contextData.contact?.phone || '-';
            else if (raw.includes('email')) evaluated = contextData.contact?.email || '-';
            else evaluated = contextData.contact?.name || 'Customer';
          }
          return {
            type: 'text',
            text: evaluated
          };
        })
      });
    }

    // 3. Limited Time Offer (LTO)
    if (nodeData.isLimitedTimeOffer === true) {
      let expirationMs = null;
      if (nodeData.expirationDate) {
        expirationMs = new Date(nodeData.expirationDate).getTime();
      } else if (nodeData.customExpirationHours) {
        expirationMs = Date.now() + Number(nodeData.customExpirationHours) * 60 * 60 * 1000;
      } else {
        // Default 72h (3 days) for LTO templates
        expirationMs = Date.now() + 72 * 60 * 60 * 1000;
      }

      if (expirationMs && expirationMs > Date.now()) {
        components.push({
          type: 'limited_time_offer',
          parameters: [{
            type: 'limited_time_offer',
            limited_time_offer: {
              expiration_time_ms: Math.floor(expirationMs)
            }
          }]
        });
      }
    }

    // 4. Coupon Code Button (COPY_CODE)
    if (nodeData.offerCode || nodeData.couponCode) {
      const code = parseDynamicVariables(nodeData.offerCode || nodeData.couponCode, contextData);
      if (code) {
        components.push({
          type: 'button',
          sub_type: 'copy_code',
          index: '0',
          parameters: [{
            type: 'coupon_code',
            coupon_code: code.trim().replace(/[^a-zA-Z0-9_-]/g, '')
          }]
        });
      }
    }

    if (components.length > 0) {
      payload.template.components = components;
    }

    return payload;
  }

  if (nodeType === 'reactionNode') {
    return {
      ...basePayload,
      type: 'reaction',
      reaction: {
        message_id: contextData.incomingMessageId || 'dummy_id',
        emoji: nodeData.emoji || '👍'
      }
    };
  }

  if (nodeType === 'utilityNode') {
    if (nodeData.utilityType === 'location') {
      return {
        ...basePayload,
        type: 'location',
        location: {
          latitude: nodeData.latitude ? nodeData.latitude.toString() : "0.0",
          longitude: nodeData.longitude ? nodeData.longitude.toString() : "0.0",
          name: parseDynamicVariables(nodeData.locationName, contextData) || undefined,
          address: parseDynamicVariables(nodeData.locationAddress, contextData) || undefined
        }
      };
    } else if (nodeData.utilityType === 'contact') {
      const contactObj = {
        name: { formatted_name: parseDynamicVariables(nodeData.contactName, contextData) || 'Contact' },
        phones: [{ phone: parseDynamicVariables(nodeData.contactPhone, contextData) || '' }]
      };
      if (nodeData.contactEmail) {
        contactObj.emails = [{ email: parseDynamicVariables(nodeData.contactEmail, contextData), type: 'WORK' }];
      }
      if (nodeData.contactCompany) {
        contactObj.org = { company: parseDynamicVariables(nodeData.contactCompany, contextData) };
      }
      return {
        ...basePayload,
        type: 'contacts',
        contacts: [contactObj]
      };
    } else if (nodeData.utilityType === 'calendar') {
      const eventName = parseDynamicVariables(nodeData.eventName, contextData) || 'Event';
      const eventDate = parseDynamicVariables(nodeData.eventDate, contextData) || '';
      const eventTime = parseDynamicVariables(nodeData.eventTime, contextData) || 'TBA';
      const eventLink = parseDynamicVariables(nodeData.eventLink, contextData) || '';
      let msg = `📅 *Calendar Invite:*\n${eventName}`;
      if (eventDate) msg += `\n📆 Date: ${eventDate}`;
      msg += `\n⏰ Time: ${eventTime}`;
      if (eventLink) msg += `\n🔗 Link: ${eventLink}`;
      return { ...basePayload, type: 'text', text: { body: msg }};
    }
    return { ...basePayload, type: 'text', text: { body: `Utility message` }};
  }

  if (nodeType === 'catalogNode') {
    const effectiveCatalogId = nodeData.catalogId || contextData?.catalogId || contextData?.tenantSettings?.metaCommerce?.catalogId;
    if (!effectiveCatalogId && nodeData.catalogType !== 'catalog') {
      return { ...basePayload, type: 'text', text: { body: 'Missing Catalog ID configuration. Please enter Catalog ID in the node or Commerce settings.' } };
    }

    if (nodeData.catalogType === 'catalog') {
      const interactive = {
        type: 'catalog_message',
        body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Browse our complete catalog!' },
        action: {
          name: 'catalog_message',
          parameters: nodeData.productId ? { thumbnail_product_retailer_id: parseDynamicVariables(nodeData.productId, contextData) } : undefined
        }
      };

      if (nodeData.footer) {
        interactive.footer = { text: parseDynamicVariables(nodeData.footer, contextData) };
      }

      return {
        ...basePayload,
        type: 'interactive',
        interactive
      };
    } else if (nodeData.catalogType === 'multi_product') {
      const validSections = (nodeData.sections || []).filter(sec => sec.productItems && sec.productItems.length > 0);
      if (validSections.length === 0) {
        return { ...basePayload, type: 'text', text: { body: 'Missing product sections configuration.' } };
      }

      const interactive = {
        type: 'product_list',
        header: { type: 'text', text: parseDynamicVariables(nodeData.headerText, contextData) || 'Products' },
        body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Check out our products!' },
        action: {
          catalog_id: effectiveCatalogId,
          sections: validSections.map(sec => ({
            title: parseDynamicVariables(sec.title, contextData) || 'Section',
            product_items: sec.productItems.slice(0, 30).map(item => ({
              product_retailer_id: parseDynamicVariables(item.productId, contextData) || 'product_1'
            }))
          }))
        }
      };

      if (nodeData.footer) {
        interactive.footer = { text: parseDynamicVariables(nodeData.footer, contextData) };
      }

      return {
        ...basePayload,
        type: 'interactive',
        interactive
      };
    } else {
      const interactive = {
        type: 'product',
        body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Check out this product!' },
        action: {
          catalog_id: effectiveCatalogId,
          product_retailer_id: parseDynamicVariables(nodeData.productId, contextData) || 'product_1'
        }
      };

      if (nodeData.footer) {
        interactive.footer = { text: parseDynamicVariables(nodeData.footer, contextData) };
      }

      return {
        ...basePayload,
        type: 'interactive',
        interactive
      };
    }
  }

  if (nodeType === 'pollNode') {
    const validOptions = (nodeData.options || []).filter(opt => parseDynamicVariables(opt.text, contextData));
    if (validOptions.length < 2) {
      return { ...basePayload, type: 'text', text: { body: 'Poll needs at least 2 options to display.' } };
    }
    return {
      ...basePayload,
      type: 'interactive',
      interactive: {
        type: 'poll',
        body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Poll' },
        action: {
          name: 'poll',
          options: validOptions.slice(0, 12).map(opt => ({
            option_name: parseDynamicVariables(opt.text, contextData)
          }))
        }
      }
    };
  }

  if (nodeType === 'commerceNode') {
    if (nodeData.commerceType === 'payment') {
      return {
        ...basePayload,
        type: 'interactive',
        interactive: {
          type: 'order_details',
          body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Please pay for your order.' },
          action: {
            name: "review_and_pay",
            parameters: {
              reference_id: parseDynamicVariables(nodeData.referenceId, contextData) || `order_${Date.now()}`,
              type: nodeData.goodsType || "digital-goods",
              payment_settings: [{
                type: "payment_gateway",
                payment_gateway: { 
                  desc: parseDynamicVariables(nodeData.paymentDescription, contextData) || "Payment", 
                  type: nodeData.paymentGateway || "razorpay" 
                }
              }],
              currency: nodeData.currency || "INR",
              total_amount: { value: (Number(nodeData.amount) * 100) || 100, offset: 100 },
              order: {
                status: "pending",
                items: [{
                  name: parseDynamicVariables(nodeData.itemName, contextData) || "Order Item",
                  amount: { value: (Number(nodeData.amount) * 100) || 100, offset: 100 },
                  quantity: 1
                }]
              }
            }
          }
        }
      };
    } else if (nodeData.commerceType === 'coupon') {
      const code = parseDynamicVariables(nodeData.couponCode, contextData) || 'PROMO';
      const msg = parseDynamicVariables(nodeData.text, contextData) || 'Here is your coupon!';
      return { ...basePayload, type: 'text', text: { body: `🎟️ *${code}*\n\n${msg}` } };
    } else if (nodeData.commerceType === 'otp') {
      const parsedText = parseDynamicVariables(nodeData.text, contextData) || 'Your OTP is: 123456';
      return { ...basePayload, type: 'text', text: { body: `🔐 *VERIFICATION CODE*\n\n${parsedText}\n\n_Please do not share this code with anyone._` } };
    } else if (nodeData.commerceType === 'invoice') {
      const parsedText = parseDynamicVariables(nodeData.text, contextData) || 'Here is your invoice details.';
      return { ...basePayload, type: 'text', text: { body: `🧾 *INVOICE / RECEIPT*\n------------------------\n\n${parsedText}\n\n------------------------\n_Thank you for your business!_` } };
    }
    
    return { ...basePayload, type: 'text', text: { body: parseDynamicVariables(nodeData.text, contextData) || 'Commerce message' } };
  }

  if (nodeType === 'carouselNode') {
    const cards = (nodeData.cards || []).map(card => {
      const parsedImage = parseDynamicVariables(card.mediaUrl, contextData);
      const header = parsedImage ? { type: 'image', image: { link: parsedImage } } : undefined;
      return {
        header,
        body: { text: parseDynamicVariables(card.title, contextData) || 'Card Title' },
        action: { buttons: [{ type: 'reply', reply: { id: `btn_${card.id || Date.now()}`, title: parseDynamicVariables(card.buttonText, contextData) || 'Select' } }] }
      };
    });
    if (cards.length === 0) return { ...basePayload, type: 'text', text: { body: 'Empty Carousel' } };
    
    return {
      ...basePayload,
      type: 'interactive',
      interactive: {
        type: 'carousel',
        body: { text: 'Swipe to see more' },
        action: { cards }
      }
    };
  }

  return { ...basePayload, type: 'text', text: { body: 'Unsupported message type' } };
}

// Utility to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Traverses the graph from the given start node until it hits a blocking node (wait for input, delay, or end).
 */
export async function processSpecificNode(customerPhone, channelId, startNodeId) {
  try {
    const phoneVariants = [
      customerPhone,
      String(customerPhone).replace(/\D/g, ''),
      '+' + String(customerPhone).replace(/\D/g, '')
    ].filter(Boolean);

    let session = await CustomerSession.findOne({ 
      phone: { $in: phoneVariants }, 
      status: { $in: ['ACTIVE', 'WAITING_FOR_INPUT', 'WAITING_FOR_EVENT'] } 
    }).sort({ updatedAt: -1 });
    if (!session) return;

    const activeFlow = await Automation.findById(session.activeFlowId);
    if (!activeFlow) {
      session.status = 'FAILED';
      await session.save();
      return;
    }

    let channel = await Channel.findById(channelId).select('+metaAccessToken');

    if (!channel) {
      // Fallback 1: check if channelId is actually a tenantId
      channel = await Channel.findOne({ tenantId: channelId }).select('+metaAccessToken');
    }

    if (!channel && activeFlow?.channelId) {
      // Fallback 2: check if activeFlow has channelId
      channel = await Channel.findById(activeFlow.channelId).select('+metaAccessToken');
    }

    if (!channel && activeFlow?.tenantId) {
      // Fallback 3: check if activeFlow has tenantId
      channel = await Channel.findOne({ tenantId: activeFlow.tenantId }).select('+metaAccessToken');
    }

    if (!channel) {
      try {
        const User = (await import('../models/User.js')).default || require('../models/User.js');
        const userDoc = await User.findById(channelId).select('+whatsappConfig.accessToken');
        if (userDoc && userDoc.whatsappConfig?.phoneNumberId) {
          channel = {
            _id: userDoc._id,
            tenantId: userDoc.tenantId || userDoc._id,
            activeWhatsappPhoneNumberId: userDoc.whatsappConfig.phoneNumberId,
            metaAccessToken: userDoc.whatsappConfig.accessToken
          };
        }
      } catch (err) {
        logger.warn('[FlowRunner] User fallback error in processSpecificNode:', err.message);
      }
    }

    if (!channel) {
      if (customerPhone.startsWith('SIMULATOR_')) {
        channel = { _id: channelId, tenantId: activeFlow.tenantId, activeWhatsappPhoneNumberId: 'mock_phone' };
      } else {
        logger.error(`[Error] Channel with ID ${channelId} not found in DB! Cannot process flow.`);
        return;
      }
    }
    let contact = await Contact.findOne({ phone: customerPhone, channelId: channel._id });
    if (!contact) {
      contact = await Contact.findOne({ phone: customerPhone, channelId });
    }
    if (!contact && customerPhone.startsWith('SIMULATOR_')) {
      contact = await Contact.findOne({ phone: customerPhone });
    }

    let currentNodeId = startNodeId;
    let keepRunning = true;
    let steps = 0;
    const MAX_STEPS = 30; // Prevent infinite loops from cyclic graphs

    const { default: TenantSettings } = await import('../models/TenantSettings.js');
    const tenantSettings = channel.tenantId ? await TenantSettings.findOne({ tenantId: channel.tenantId }).lean() : null;

    logger.log(`[DEBUG Engine] processSpecificNode started for ${customerPhone} on node ${startNodeId}`);

    while (keepRunning && currentNodeId && steps < MAX_STEPS) {
      steps++;
      
      // Build a rich contextData combining CRM Contact Data and Session Variables safely
      let contactFields = {};
      if (contact && contact.customFields) {
        if (contact.customFields instanceof Map || typeof contact.customFields.entries === 'function') {
          contactFields = Object.fromEntries(contact.customFields);
        } else if (Array.isArray(contact.customFields)) {
          contact.customFields.forEach(f => {
            const k = f.key || f.name;
            if (k) contactFields[k] = f.value;
          });
        } else if (typeof contact.customFields === 'object') {
          contactFields = contact.customFields;
        }
      }

      let sessionVars = {};
      if (session && session.sessionVariables) {
        if (session.sessionVariables instanceof Map || typeof session.sessionVariables.entries === 'function') {
          sessionVars = Object.fromEntries(session.sessionVariables);
        } else if (typeof session.sessionVariables === 'object') {
          sessionVars = session.sessionVariables;
        }
      }

      const isSim = typeof customerPhone === 'string' && customerPhone.startsWith('SIMULATOR_');
      let defaultSimName = '';
      if (isSim) {
        defaultSimName = 'Aayush Kumar';
        try {
          const { default: User } = await import('../models/User.js');
          if (channel.tenantId) {
            const u = await User.findOne({ tenantId: channel.tenantId });
            if (u?.name) defaultSimName = u.name;
          }
        } catch (_) {}
      }

      const contextData = {
        contact: contact ? {
          id: contact._id.toString(),
          tenantId: contact.tenantId ? contact.tenantId.toString() : null,
          phone: contact.phone,
          name: contact.name || (isSim ? defaultSimName : ''),
          email: contact.email || '',
          tags: contact.tags || [],
          ...contactFields
        } : { phone: customerPhone, id: session._id, name: isSim ? defaultSimName : '' },
        tenantSettings: tenantSettings || {},
        ...sessionVars
      };

      // Always sync latest session variables into contextData so EVERY node
      // can access answers from Ask Question nodes, action results, etc.
      syncContextVariables(session, contextData);
      
      session.currentNodeId = currentNodeId;
      session.lastInteractionAt = Date.now();
      await session.save(); // Save state at each step
      
      // Analytics: Track Node visits
      if (!activeFlow.nodeStats) activeFlow.nodeStats = new Map();
      const currentStat = activeFlow.nodeStats.get(currentNodeId) || 0;
      activeFlow.nodeStats.set(currentNodeId, currentStat + 1);
      await activeFlow.save();

      const currentNode = activeFlow.nodes.find(n => n.id === currentNodeId);
      if (!currentNode) {
        await markSessionCompleted(session, customerPhone, channelId);
        break;
      }

      logger.log(`Executing node: ${currentNode.type} (${currentNode.id})`);
      
      // --- Visual Debugger / Real-time Socket Event ---
      try {
        const io = getIO();
        if (io) {
          // Broadcast to the specific flow's room
          io.to(`automation_${activeFlow._id.toString()}`).emit('node_executed', { 
            nodeId: currentNode.id, 
            flowId: activeFlow._id.toString(),
            timestamp: Date.now() 
          });
        }
      } catch (e) {
        logger.error('Failed to emit debug event:', e);
      }
      
      // Determine the default next node by following an outgoing edge with no specific handle (e.g. text message output)
      const outgoingEdges = activeFlow.edges.filter(e => e.source === currentNodeId);
      const defaultNextEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle') ||
                              outgoingEdges.find(e => !e.sourceHandle || e.sourceHandle !== 'timeout') ||
                              outgoingEdges[0];
      let nextNodeId = defaultNextEdge ? defaultNextEdge.target : null;

      // Handle specific node types
      if (['messageNode', 'interactiveNode', 'menuNode', 'inputNode', 'mediaNode', 'templateNode', 'utilityNode', 'reactionNode', 'catalogNode', 'pollNode', 'commerceNode', 'carouselNode'].includes(currentNode.type)) {
        const payload = buildMessagePayload(customerPhone, currentNode.type, currentNode.data, contextData);
        
        // Inject full template text and buttons for Simulator UI if it's a template node
        if (customerPhone.startsWith('SIMULATOR_') && currentNode.type === 'templateNode') {
          try {
            // First check if currentNode.data has buttons directly configured
            if (currentNode.data?.buttons && Array.isArray(currentNode.data.buttons) && currentNode.data.buttons.length > 0) {
              payload._sim_template_buttons = currentNode.data.buttons;
            }

            const { default: Template } = await import('../models/Template.js');
            const tmplName = currentNode.data?.templateName;
            let tmpl = null;
            if (tmplName) {
              tmpl = await Template.findOne({
                $or: [
                  { name: tmplName },
                  { name: new RegExp(`^${tmplName}$`, 'i') },
                  { whatsappTemplateName: tmplName }
                ]
              });
            }

            if (tmpl) {
              const bodyComponent = tmpl.components?.find(c => c.type === 'BODY' || c.type === 'body');
              if (bodyComponent && bodyComponent.text) {
                payload._sim_template_text = bodyComponent.text;
              }
              
              const headerComponent = tmpl.components?.find(c => c.type === 'HEADER' || c.type === 'header');
              if (headerComponent && (headerComponent.format === 'IMAGE' || headerComponent.type === 'IMAGE')) {
                let imgUrl = headerComponent.example?.header_url?.[0] || headerComponent.example?.header_handle?.[0];
                if (imgUrl && !imgUrl.startsWith('http')) {
                  imgUrl = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop';
                }
                if (imgUrl) {
                  payload._sim_template_image = imgUrl;
                }
              }

              const buttonsComponent = tmpl.components?.find(c => c.type === 'BUTTONS' || c.type === 'buttons');
              if (buttonsComponent && buttonsComponent.buttons && buttonsComponent.buttons.length > 0) {
                payload._sim_template_buttons = buttonsComponent.buttons;
              }
            }

            // If template text still not found from DB, fallback to node text or placeholder
            if (!payload._sim_template_text) {
              payload._sim_template_text = currentNode.data?.text || currentNode.data?.headline || `Template: ${tmplName}`;
            }

            // Replace all {{1}}, {{2}} in payload._sim_template_text with evaluated variables
            if (payload._sim_template_text && typeof payload._sim_template_text === 'string') {
              let resolvedText = payload._sim_template_text;
              const vars = currentNode.data?.variables || [];
              vars.forEach((v, index) => {
                const paramNum = index + 1;
                const rawVal = v?.value || '';
                let evaluatedVal = parseDynamicVariables(rawVal, contextData);

                if (!evaluatedVal || evaluatedVal.trim() === '') {
                  if (rawVal.includes('contact.name') || rawVal.includes('name')) {
                    evaluatedVal = contextData?.contact?.name || defaultSimName || 'Aayush Kumar';
                  } else if (rawVal.includes('contact.phone') || rawVal.includes('phone')) {
                    evaluatedVal = contextData?.contact?.phone || '+91 9876543210';
                  } else if (rawVal.includes('contact.email') || rawVal.includes('email')) {
                    evaluatedVal = contextData?.contact?.email || 'contact@example.com';
                  } else if (rawVal) {
                    evaluatedVal = rawVal.replace(/[{}]/g, '').trim();
                  } else {
                    evaluatedVal = contextData?.contact?.name || defaultSimName || 'Aayush Kumar';
                  }
                }

                resolvedText = resolvedText.replace(new RegExp(`\\{\\{${paramNum}\\}\\}`, 'g'), evaluatedVal);
              });

              // Clean up any remaining {{1}}, {{2}} placeholders
              resolvedText = resolvedText.replace(/\{\{1\}\}/g, contextData?.contact?.name || defaultSimName || 'Aayush Kumar');
              resolvedText = resolvedText.replace(/\{\{2\}\}/g, 'Special Offer');
              resolvedText = resolvedText.replace(/\{\{(\d+)\}\}/g, '');

              payload._sim_template_text = resolvedText;
            }

            // Always ensure buttons from node are present if DB didn't provide any
            if (!payload._sim_template_buttons && currentNode.data?.buttons) {
              payload._sim_template_buttons = currentNode.data.buttons;
            }
          } catch (e) {
            logger.error('Failed to inject simulator template data:', e);
            if (currentNode.data?.buttons) {
              payload._sim_template_buttons = currentNode.data.buttons;
            }
          }
        }
        
        try {
          await sendWhatsAppMessage(customerPhone, payload, channel);
        } catch (err) {
          logger.error(`Failed to send message at node ${currentNode.id}, aborting flow. Exact Error:`, err);
          keepRunning = false;
          break;
        }

        let isBlockingNode = false;

        if (currentNode.type === 'inputNode') {
          session.status = 'WAITING_FOR_INPUT';
          session.expectedValidation = currentNode.data.validationType || 'text';
          session.saveVariableAs = currentNode.data.variableName || 'contact.custom_field';
          session.validationRetries = 0;
          await session.save();
          isBlockingNode = true;
          keepRunning = false;
        } else if (
          currentNode.type === 'interactiveNode' ||
          currentNode.type === 'menuNode' ||
          currentNode.type === 'catalogNode' ||
          currentNode.type === 'pollNode' ||
          currentNode.type === 'carouselNode' ||
          (currentNode.type === 'templateNode' && ((currentNode.data?.buttons && currentNode.data.buttons.length > 0) || outgoingEdges.some(e => e.sourceHandle && e.sourceHandle.startsWith('btn-')))) ||
          (currentNode.type === 'commerceNode' && currentNode.data?.commerceType === 'payment') ||
          (currentNode.type === 'messageNode' && currentNode.data?.messageType === 'interactive') ||
          currentNode.data?.messageType === 'interactive' ||
          currentNode.data?.messageType === 'menu'
        ) {
          const hasInteractiveOptions = (currentNode.data?.buttons && currentNode.data.buttons.length > 0) ||
                                        (currentNode.data?.interactiveButtons && currentNode.data.interactiveButtons.length > 0) ||
                                        (currentNode.data?.sections && currentNode.data.sections.length > 0) ||
                                        ['pollNode', 'catalogNode', 'carouselNode'].includes(currentNode.type) ||
                                        (currentNode.type === 'templateNode' && ((currentNode.data?.buttons && currentNode.data.buttons.length > 0) || outgoingEdges.some(e => e.sourceHandle && e.sourceHandle.startsWith('btn-'))));

          if (outgoingEdges.length === 0) {
            // Leaf interactive node! Nothing follows; complete the session so user is not trapped.
            logger.log(`[FlowRunner] Leaf interactive node reached (${currentNode.id}). Completing session.`);
            await markSessionCompleted(session, customerPhone, channelId);
            keepRunning = false;
            break;
          } else if (hasInteractiveOptions) {
            // Interactive nodes with outgoing edges block execution and wait for user reply
            isBlockingNode = true;
            keepRunning = false;
          } else {
            // Degraded to text message (no buttons configured) — do not trap user, advance to next step!
            await sleep(500);
          }
        } else {
          // Non-interactive text, media, template messages
          if (outgoingEdges.length === 0) {
            logger.log(`[FlowRunner] Leaf message node reached (${currentNode.id}). Completing session.`);
            await markSessionCompleted(session, customerPhone, channelId);
            keepRunning = false;
            break;
          }
          await sleep(500);
        }

        if (isBlockingNode && currentNode.data.timeoutEnabled) {
          const timeoutEdge = outgoingEdges.find(e => e.sourceHandle === 'timeout');
          if (timeoutEdge) {
            const timeoutMinutes = Number(currentNode.data.timeoutMinutes) || 15;
            const delayMs = timeoutMinutes * 60000;
            await scheduleDelayedNode(customerPhone, channelId, timeoutEdge.target, delayMs);
          }
        }
      } 
      else if (currentNode.type === 'conditionNode') {
        const handle = await executeConditionNode(session, currentNode, contextData);
        // Find the specific edge that matches the condition result (supports 'true' / 'true_path' and 'false' / 'false_path')
        const isTrue = handle === 'true' || handle === 'true_path';
        let conditionEdge = outgoingEdges.find(e => 
          isTrue ? (e.sourceHandle === 'true' || e.sourceHandle === 'true_path') : (e.sourceHandle === 'false' || e.sourceHandle === 'false_path')
        );

        if (!conditionEdge) {
          conditionEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || (outgoingEdges.length === 1 ? outgoingEdges[0] : null);
        }

        if (!conditionEdge) {
          // If condition is not met and no fallback edge exists, notify customer rather than silently dropping
          logger.warn(`[FlowRunner] Condition '${currentNode.data?.variable}' (${handle}) on node ${currentNode.id} has no matching outgoing edge.`);
          const varName = currentNode.data?.variable || 'input';
          const conditionErrMsg = currentNode.data?.conditionErrorMessage || currentNode.data?.errorMessage || 
            `⚠️ The response provided does not match the required condition for ${varName}. Please provide a valid value, or type *restart* to start over.`;

          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;
          await sendWhatsAppMessage(customerPhone, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: conditionErrMsg }
          }, channelToUse);

          keepRunning = false;
          break;
        }

        nextNodeId = conditionEdge.target;
      }
      else if (currentNode.type === 'apiNode') {
        const status = await executeApiCallNode(session, currentNode, contextData);
        syncContextVariables(session, contextData); // API response data may have been saved to session
        let apiEdge = outgoingEdges.find(e => e.sourceHandle === status);
        if (!apiEdge && status === 'success') {
          apiEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
        }
        if (!apiEdge && status === 'failure') {
          apiEdge = outgoingEdges.find(e => e.sourceHandle === 'failure' || e.sourceHandle === 'error');
        }
        if (!apiEdge && status === 'failure') {
          logger.warn(`[FlowRunner] apiNode ${currentNode.id} failed and has no failure/fallback edge.`);
          const apiErrMsg = currentNode.data?.errorMessage || '⚠️ We encountered a temporary technical issue while processing your request. Please try again or type *restart* to start over.';
          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;
          await sendWhatsAppMessage(customerPhone, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: apiErrMsg }
          }, channelToUse);
          keepRunning = false;
          break;
        }
        nextNodeId = apiEdge ? apiEdge.target : null;
      }
      else if (currentNode.type === 'actionNode') {
        await executeActionNode(session, currentNode, contextData);
        syncContextVariables(session, contextData);
        const edge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'aiNode') {
        const result = await executeAiNode(session, currentNode, contextData);
        syncContextVariables(session, contextData);
        const edge = outgoingEdges.find(e => e.sourceHandle === `ai-${result}` || e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'googleSheetsNode') {
        const status = await executeGoogleSheetsNode(session, currentNode, contextData);
        let edge = outgoingEdges.find(e => e.sourceHandle === status);
        if (!edge && status === 'success') {
          edge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
        }
        if (!edge && status === 'failure') {
          edge = outgoingEdges.find(e => e.sourceHandle === 'failure' || e.sourceHandle === 'error');
        }
        if (!edge && status === 'failure') {
          logger.warn(`[FlowRunner] googleSheetsNode ${currentNode.id} failed and has no failure edge.`);
          const sheetsErrMsg = currentNode.data?.errorMessage || '⚠️ We could not save your response due to a temporary integration issue. Please try again or type *restart* to start over.';
          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;
          await sendWhatsAppMessage(customerPhone, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: sheetsErrMsg }
          }, channelToUse);
          keepRunning = false;
          break;
        }
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'randomizerNode') {
        const handle = await executeRandomizerNode(session, currentNode);
        const randEdge = outgoingEdges.find(e => e.sourceHandle === handle) || 
                         outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || 
                         outgoingEdges[0];
        nextNodeId = randEdge ? randEdge.target : null;
      }
      else if (currentNode.type === 'shopifyNode') {
        const status = await executeShopifyNode(session, currentNode, contextData);
        let edge = outgoingEdges.find(e => e.sourceHandle === status);
        if (!edge && status === 'success') {
          edge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
        }
        if (!edge && status === 'failure') {
          edge = outgoingEdges.find(e => e.sourceHandle === 'failure' || e.sourceHandle === 'error');
        }
        if (!edge && status === 'failure') {
          logger.warn(`[FlowRunner] shopifyNode ${currentNode.id} failed and has no failure edge.`);
          const shopifyErrMsg = currentNode.data?.errorMessage || '⚠️ Could not retrieve store details at this moment. Please try again or type *restart* to start over.';
          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;
          await sendWhatsAppMessage(customerPhone, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: shopifyErrMsg }
          }, channelToUse);
          keepRunning = false;
          break;
        }
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'waitForEventNode') {
        const waitHours = currentNode.data.waitHours || 24;
        const delayMs = waitHours * 60 * 60 * 1000;
        
        session.status = 'WAITING_FOR_EVENT';
        session.expectedEvent = currentNode.data.eventType || 'any_message';
        await session.save();

        const timeoutEdge = outgoingEdges.find(e => e.sourceHandle === 'timeout');
        if (timeoutEdge) {
          await scheduleDelayedNode(customerPhone, channelId, timeoutEdge.target, delayMs);
        }
        keepRunning = false;
      }
      else if (currentNode.type === 'delayNode') {
        const amount = Number(currentNode.data.delayAmount) || 1;
        const unit = currentNode.data.delayUnit || 'Minutes';
        let delayMs = amount * 60000;
        if (unit === 'Hours') delayMs = amount * 60 * 60000;
        else if (unit === 'Days') delayMs = amount * 24 * 60 * 60000;

        const edge = outgoingEdges.find(e => e.sourceHandle === 'main-handle') || outgoingEdges[0];
        const targetNodeId = edge ? edge.target : null;

        if (targetNodeId) {
          await scheduleDelayedNode(customerPhone, channelId, targetNodeId, delayMs);
        }
        // Halt execution; the queue worker will resume it
        keepRunning = false;
      }
      else if (currentNode.type === 'jumpNode') {
        const targetFlowId = currentNode.data.flowId;
        if (targetFlowId) {
          session.activeFlowId = targetFlowId;
          const targetFlow = await Automation.findById(targetFlowId);
          if (targetFlow) {
             const triggerNode = targetFlow.nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode') || targetFlow.nodes[0];
             if (triggerNode) {
               let newNextNodeId = null;
               if (triggerNode.type === 'triggerNode' || triggerNode.type === 'eventTriggerNode') {
                 const targetEdges = targetFlow.edges.filter(e => e.source === triggerNode.id);
                 newNextNodeId = targetEdges.length > 0 ? targetEdges[0].target : null;
               } else {
                 newNextNodeId = triggerNode.id;
               }
               
               if (newNextNodeId) {
                 session.currentNodeId = newNextNodeId;
                 await session.save();
                 
                 // Immediately restart the processing with the new flow
                 return processSpecificNode(customerPhone, channelId, newNextNodeId);
               }
             }
          }
        }
        // If jump fails, just move to next node in current flow
        const edge = outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }

      if (keepRunning) {
        currentNodeId = nextNodeId;
        if (!currentNodeId) {
          if (session.status !== 'HANDOFF') {
            await markSessionCompleted(session, customerPhone, channelId);
          }
          keepRunning = false;
        }
      }
    }

    if (steps >= MAX_STEPS) {
      logger.warn(`Maximum execution steps (${MAX_STEPS}) reached for session ${session._id}. Possible infinite loop detected.`);
    }

  } catch (error) {
    logger.error('Error in processSpecificNode:', error);
    try {
      let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
      if (!channelToUse) channelToUse = channel;
      await sendWhatsAppMessage(customerPhone, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: customerPhone,
        type: 'text',
        text: { body: '⚠️ An unexpected error occurred while processing your request. Please type *restart* to start over.' }
      }, channelToUse);
    } catch (_) {}
  }
}

/**
 * Robust extractor for combined Name and Phone Number from single user message.
 * Handles variations like:
 * - "Anil kumar Atri\n9350157447"
 * - "+91 9350157447 Anil kumar Atri"
 * - "Name: Anil Kumar, Phone: 9350157447"
 */
export function extractNameAndPhone(text) {
  if (!text || typeof text !== 'string') return null;
  const cleanText = text.trim();

  // Pattern matches 10 to 12 digit phone numbers with optional +91, 91, 0, spaces, dashes
  const phonePattern = /(?:(?:\+|0{0,2})91[\s-]*)?([6-9]\d{4}[\s-]?\d{5}|[6-9]\d{9})\b|\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/;
  const match = cleanText.match(phonePattern);
  if (!match) return null;

  const rawPhoneMatch = match[0];
  const digitsOnly = rawPhoneMatch.replace(/\D/g, '');

  let phone = digitsOnly;
  if (phone.length === 12 && phone.startsWith('91')) {
    phone = phone.substring(2);
  } else if (phone.length === 11 && phone.startsWith('0')) {
    phone = phone.substring(1);
  }

  if (phone.length < 10) return null;

  // Extract name by removing the matched phone part
  let namePart = cleanText.replace(rawPhoneMatch, '');
  // Clean common field labels, prefixes, and punctuation
  namePart = namePart
    .replace(/(?:^|\b)(?:name|naam|phone|mobile|mob|contact|no|number)[\s:]*/gi, ' ')
    .replace(/[,\/\-\|\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Validate that namePart has at least 2 alphabetic characters
  const hasValidLetters = /[a-zA-Z\u0900-\u097F]{2,}/.test(namePart);
  if (!hasValidLetters) return null;

  return {
    name: namePart,
    phone: phone,
    rawPhone: rawPhoneMatch
  };
}

/**
 * Robust parser to extract Date, Time, and Slot details from natural user responses or menu selections
 * Supports:
 * - Dates: DD/MM/YYYY, DD-MM-YYYY, DD/MM, "15 Oct", "tomorrow", "kal", "aaj", "today", "parso", weekdays
 * - Times: "10:30 AM", "4pm", "5:30 pm", "14:30", "5 baje", "sham 5 baje", "subah 10 baje"
 * - Slots: "Tomorrow 4:00 PM", "15 Oct 11:30 AM", "10:00 AM - 11:00 AM"
 */
export function extractDateAndTime(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (!clean) return null;

  const now = new Date();
  let foundDate = null;
  let foundDateObj = null;
  let foundTime = null;

  // 1. TIME PARSING
  const time12Regex = /\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i;
  const time24Regex = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
  const timeHindiRegex = /(?:(subah|morning|dopahar|afternoon|sham|shaam|evening|raat|night)\s*)?(\b\d{1,2})(?::([0-5]\d))?\s*(?:baje|o'clock)/i;

  let timeMatch = clean.match(time12Regex);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] || '00';
    const ampm = timeMatch[3].toUpperCase();
    foundTime = `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  } else {
    timeMatch = clean.match(timeHindiRegex);
    if (timeMatch) {
      const period = (timeMatch[1] || '').toLowerCase();
      let hours = parseInt(timeMatch[2], 10);
      const mins = timeMatch[3] || '00';
      let ampm = 'AM';
      if (['sham', 'shaam', 'evening', 'raat', 'night'].includes(period) && hours < 12) {
        ampm = 'PM';
      } else if (['dopahar', 'afternoon'].includes(period) && hours < 12) {
        ampm = 'PM';
      } else if (hours >= 12 && hours <= 23) {
        ampm = 'PM';
        if (hours > 12) hours -= 12;
      } else if (hours >= 1 && hours <= 6 && !period) {
        ampm = 'PM';
      }
      foundTime = `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    } else {
      timeMatch = clean.match(time24Regex);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const mins = timeMatch[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        foundTime = `${String(displayHours).padStart(2, '0')}:${mins} ${ampm}`;
      }
    }
  }

  // 2. DATE PARSING
  const lower = clean.toLowerCase();

  if (/\b(today|aaj)\b/.test(lower)) {
    foundDateObj = new Date(now);
  } else if (/\b(tomorrow|kal)\b/.test(lower)) {
    foundDateObj = new Date(now);
    foundDateObj.setDate(foundDateObj.getDate() + 1);
  } else if (/\b(parso|day after tomorrow)\b/.test(lower)) {
    foundDateObj = new Date(now);
    foundDateObj.setDate(foundDateObj.getDate() + 2);
  } else {
    const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    for (const [dayName, dayIndex] of Object.entries(daysMap)) {
      if (new RegExp(`\\b${dayName}\\b`, 'i').test(lower)) {
        foundDateObj = new Date(now);
        const currentDay = foundDateObj.getDay();
        let diff = dayIndex - currentDay;
        if (diff <= 0) diff += 7;
        foundDateObj.setDate(foundDateObj.getDate() + diff);
        break;
      }
    }
  }

  // Explicit Date formats: e.g. "25/10/2026", "25-10-2026", "25.10.2026", "25/10"
  if (!foundDateObj) {
    const dmyMatch = clean.match(/\b([0-3]?\d)[\/\-\.]([01]?\d)(?:[\/\-\.](\d{4}|\d{2}))?\b/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1], 10);
      const m = parseInt(dmyMatch[2], 10) - 1;
      let y = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : now.getFullYear();
      if (y < 100) y += 2000;
      if (d >= 1 && d <= 31 && m >= 0 && m <= 11) {
        foundDateObj = new Date(y, m, d);
      }
    }
  }

  // Month names: e.g. "15 Oct", "15th October 2026", "October 15"
  if (!foundDateObj) {
    const monthRegex = /\b([0-3]?\d)(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*(?:\s+(\d{4}))?\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+([0-3]?\d)(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/i;
    const mMatch = clean.match(monthRegex);
    if (mMatch) {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const rawMonth = (mMatch[2] || mMatch[4]).toLowerCase().substring(0, 3);
      const mIdx = months.indexOf(rawMonth === 'sep' ? 'sep' : rawMonth);
      const dayVal = parseInt(mMatch[1] || mMatch[5], 10);
      let yearVal = mMatch[3] || mMatch[6] ? parseInt(mMatch[3] || mMatch[6], 10) : now.getFullYear();
      if (dayVal >= 1 && dayVal <= 31 && mIdx !== -1) {
        foundDateObj = new Date(yearVal, mIdx, dayVal);
      }
    }
  }

  // Standard Date.parse fallback
  if (!foundDateObj) {
    const parsed = Date.parse(clean);
    if (!isNaN(parsed)) {
      foundDateObj = new Date(parsed);
    }
  }

  if (foundDateObj && !isNaN(foundDateObj.getTime())) {
    const dd = String(foundDateObj.getDate()).padStart(2, '0');
    const mm = String(foundDateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = foundDateObj.getFullYear();
    foundDate = `${dd}/${mm}/${yyyy}`;
  }

  if (!foundDate && !foundTime) return null;

  let slotString = '';
  if (foundDate && foundTime) {
    slotString = `${foundDate} at ${foundTime}`;
  } else if (foundDate) {
    slotString = foundDate;
  } else if (foundTime) {
    slotString = foundTime;
  }

  return {
    hasDate: !!foundDate,
    hasTime: !!foundTime,
    date: foundDate,
    time: foundTime,
    slot: slotString,
    dateObj: foundDateObj,
    raw: clean
  };
}

/**
 * Evaluates the incoming message against the current active flow or initiates a new one.
 */
export async function executeWorkflowStep(customerPhone, incomingPayload, channelId, referral = null, incomingMessageId = null, simulatorTargetFlowId = null, isNewContact = false, messageContext = {}) {
  try {
    // IMPORTANT: metaAccessToken has `select: false` in schema — must explicitly select it
    let channel = await Channel.findById(channelId).select('+metaAccessToken');

    if (!channel) {
      // Fallback 1: check if channelId is actually a tenantId
      channel = await Channel.findOne({ tenantId: channelId }).select('+metaAccessToken');
    }

    if (!channel) {
      // Fallback 2: check User model for direct WhatsApp configuration
      try {
        const User = (await import('../models/User.js')).default || require('../models/User.js');
        const userDoc = await User.findById(channelId).select('+whatsappConfig.accessToken');
        if (userDoc && userDoc.whatsappConfig?.phoneNumberId) {
          channel = {
            _id: userDoc._id,
            tenantId: userDoc.tenantId || userDoc._id,
            activeWhatsappPhoneNumberId: userDoc.whatsappConfig.phoneNumberId,
            metaAccessToken: userDoc.whatsappConfig.accessToken
          };
        }
      } catch (err) {
        logger.warn('[FlowRunner] User fallback error:', err.message);
      }
    }

    if (!channel) {
      if (simulatorTargetFlowId || customerPhone.startsWith('SIMULATOR_')) {
        let dynamicTenantId = null;
        if (simulatorTargetFlowId) {
          const Automation = (await import('../models/Automation.js')).default || require('../models/Automation');
          const flow = await Automation.findById(simulatorTargetFlowId);
          dynamicTenantId = flow ? flow.tenantId : null;
        }
        channel = { _id: channelId, tenantId: dynamicTenantId, activeWhatsappPhoneNumberId: 'mock_phone' };
      } else {
        logger.error(`[Error] Channel with ID ${channelId} not found in DB! Cannot process flow.`);
        return;
      }
    }

    const possibleChannelIds = [
      channelId, 
      channelId?.toString(), 
      channel._id, 
      channel._id?.toString(), 
      channel.tenantId, 
      channel.tenantId?.toString()
    ].filter(Boolean);

    const phoneVariants = [
      customerPhone,
      String(customerPhone).replace(/\D/g, ''),
      '+' + String(customerPhone).replace(/\D/g, '')
    ].filter(Boolean);

    let session = await CustomerSession.findOne({ 
      phone: { $in: phoneVariants }, 
      channelId: { $in: possibleChannelIds }, 
      status: { $in: ['ACTIVE', 'WAITING_FOR_INPUT', 'WAITING_FOR_EVENT'] } 
    }).sort({ updatedAt: -1 });

    if (!session) {
      session = await CustomerSession.findOne({ 
        phone: { $in: phoneVariants }, 
        status: { $in: ['ACTIVE', 'WAITING_FOR_INPUT', 'WAITING_FOR_EVENT'] } 
      }).sort({ updatedAt: -1 });
    }
    
    // Check for session expiration due to inactivity (TTL: 24 hours, aligned with Meta customer service window)
    const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
    if (session && session.lastInteractionAt) {
      const inactiveDuration = Date.now() - new Date(session.lastInteractionAt).getTime();
      if (inactiveDuration > SESSION_TTL_MS) {
        logger.log(`[FlowRunner] Active session ${session._id} expired (${Math.round(inactiveDuration / 60000)}m inactive). Completing session.`);
        await markSessionCompleted(session, customerPhone, channelId);
        session = null;
      }
    }
    
    // 1. Check Global Routing Rules first (This allows escape words to interrupt active flows)
    const rules = await RoutingRule.find({ channelId: channel._id, isActive: true }).sort({ priority: -1 });
    let matchedRule = null;
    
    // Check OUT_OF_OFFICE first (only if user is not already in an active session to prevent spam)
    if (!session) {
      const oooRule = rules.find(r => r.ruleType === 'OUT_OF_OFFICE');
      if (oooRule && oooRule.businessHours) {
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const dayConfig = oooRule.businessHours[currentDay];
        
        if (dayConfig && !dayConfig.isOpen) {
          matchedRule = oooRule;
        } else if (dayConfig && dayConfig.isOpen && dayConfig.open && dayConfig.close) {
          const currentTimeStr = now.toTimeString().substring(0, 5); // "HH:MM"
          if (currentTimeStr < dayConfig.open || currentTimeStr > dayConfig.close) {
            matchedRule = oooRule;
          }
        }
      }
    }

    if (!matchedRule) {
      for (const rule of rules) {
        if (rule.ruleType === 'KEYWORD_REPLY') {
           if (rule.matchType === 'EXACT' && rule.keywords.includes(incomingPayload.toLowerCase())) {
              matchedRule = rule; break;
           } else if (rule.matchType === 'CONTAINS') {
              const matches = rule.keywords.some(k => incomingPayload.toLowerCase().includes(k));
              if (matches) { matchedRule = rule; break; }
           }
        }
      }
    }

    if (matchedRule) {
      // If user was in a flow, cancel it because they used an escape/global word
      if (session) {
        session.status = 'CANCELLED';
        await session.save();
      }

      if (matchedRule.action === 'SEND_MESSAGE' && matchedRule.replyMessage) {
        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: customerPhone,
          type: 'text',
          text: { body: matchedRule.replyMessage }
        };
        await sendWhatsAppMessage(customerPhone, payload, channel);
        return;
      } else if (matchedRule.action === 'TRIGGER_FLOW' && matchedRule.flowId) {
        await startFlowManually(customerPhone, channel._id, matchedRule.flowId);
        return;
      } else if (matchedRule.action === 'ASSIGN_AGENT') {
        const newSession = new CustomerSession({
          phone: customerPhone,
          channelId: channel._id,
          activeFlowId: null,
          currentNodeId: 'HANDOFF_NODE',
          status: 'HANDOFF'
        });
        await newSession.save();
        return;
      }
    }

    // Pre-load all active flows for trigger evaluation and session pre-emption
    let allActiveFlows = [];
    if (simulatorTargetFlowId) {
      const simFlow = await Automation.findById(simulatorTargetFlowId);
      if (simFlow) allActiveFlows = [simFlow];
    } else {
      allActiveFlows = await Automation.find({
        $or: [
          { channelId: channel._id },
          { channelId: channelId },
          { channel: channel._id },
          { channel: channelId },
          ...(channel.tenantId ? [{ tenantId: channel.tenantId }, { user: channel.tenantId }] : [])
        ],
        $and: [
          {
            $or: [
              { isActive: true },
              { status: { $in: ['active', 'published', 'enabled'] } },
              { isActive: { $exists: false } }
            ]
          }
        ]
      }).sort({ updatedAt: -1, createdAt: -1 });
    }

    const payloadText = typeof incomingPayload === 'string' ? incomingPayload.trim().toLowerCase() : '';
    const ESCAPE_KEYWORDS = ['restart', 'reset', 'menu', 'main menu', 'start', 'exit', 'cancel'];
    const isEscapeWord = ESCAPE_KEYWORDS.includes(payloadText);
    const isExplicitButton = messageContext?.isButtonTap !== undefined ? messageContext.isButtonTap : null;
    const isButtonTap = isExplicitButton !== null ? isExplicitButton : !!(
      messageContext?.buttonText ||
      messageContext?.buttonId ||
      messageContext?.buttonPayload ||
      messageContext?.buttonTitle ||
      messageContext?.listId ||
      messageContext?.listTitle ||
      messageContext?.optId ||
      messageContext?.optText ||
      messageContext?.messageType === 'button' ||
      messageContext?.messageType === 'interactive' ||
      messageContext?.messageType === 'button_reply' ||
      messageContext?.messageType === 'quick_reply' ||
      messageContext?.messageType === 'list_reply'
    );

    // 🛑 Check if Contact has bot paused (Agent in Live Chat is handling this contact)
    try {
      const ContactModel = (await import('../models/Contact.js')).default || require('../models/Contact');
      const existingContact = await ContactModel.findOne({
        phone: customerPhone,
        ...(channel.tenantId ? { tenantId: channel.tenantId } : {})
      });

      if (existingContact?.isBotPaused && !isEscapeWord) {
        logger.log(`[FlowRunner] Bot is paused for contact ${customerPhone} (agent handoff active). Ignoring incoming message.`);
        return;
      }
      if (existingContact?.isBotPaused && isEscapeWord) {
        await ContactModel.updateMany({ phone: customerPhone }, { $set: { isBotPaused: false, status: 'ACTIVE' } });
      }
    } catch (e) {
      logger.error('[FlowRunner] Error checking isBotPaused:', e.message);
    }

    const candidatePayloads = [
      payloadText,
      messageContext?.buttonText?.trim().toLowerCase(),
      messageContext?.buttonTitle?.trim().toLowerCase(),
      messageContext?.buttonPayload?.trim().toLowerCase(),
      messageContext?.buttonId?.trim().toLowerCase(),
      messageContext?.listTitle?.trim().toLowerCase(),
      messageContext?.listId?.trim().toLowerCase(),
      messageContext?.optText?.trim().toLowerCase(),
      messageContext?.optId?.trim().toLowerCase(),
      messageContext?.optIdx !== undefined && messageContext?.optIdx !== null ? String(messageContext.optIdx) : null,
      messageContext?.optionName?.trim().toLowerCase(),
      messageContext?.rowId?.trim().toLowerCase()
    ].filter(Boolean);

    const findButtonEdgeMatch = async (payloadsToMatch) => {
      const candidates = (payloadsToMatch && payloadsToMatch.length > 0) ? payloadsToMatch : candidatePayloads;
      if (!candidates || candidates.length === 0) return null;

      // 🎯 Resolve which template was sent to this customer and clicked
      let clickedTemplateName = null;
      try {
        const { default: MessageModel } = await import('../models/Message.js');
        // Priority 1: Meta context message ID (the exact WhatsApp message the user clicked on)
        if (messageContext?.contextMessageId) {
          const contextMsg = await MessageModel.findOne({
            whatsappMessageId: messageContext.contextMessageId
          }).select('templateName metadata').lean();
          if (contextMsg?.templateName || contextMsg?.metadata?.template?.name) {
            clickedTemplateName = contextMsg.templateName || contextMsg.metadata.template.name;
          }
        }

        // Priority 2: If Meta context ID was not present, find the last outbound template sent to this phone
        if (!clickedTemplateName) {
          const cleanPhone = customerPhone.replace(/\D/g, '');
          const lastTplMsg = await MessageModel.findOne({
            $or: [
              { phone: cleanPhone },
              { whatsappId: cleanPhone },
              { phone: customerPhone },
              { to: customerPhone }
            ],
            messageType: 'template',
            direction: { $in: ['OUTBOUND', 'outbound', 'sent'] }
          })
            .sort({ _id: -1 })
            .select('templateName metadata')
            .lean();

          if (lastTplMsg?.templateName || lastTplMsg?.metadata?.template?.name) {
            clickedTemplateName = lastTplMsg.templateName || lastTplMsg.metadata.template.name;
          }
        }
      } catch (err) {
        logger.warn('[FlowRunner] Template resolution warning:', err.message);
      }

      if (clickedTemplateName) {
        logger.log(`[FlowRunner] 🎯 Customer ${customerPhone} clicked button on template '${clickedTemplateName}'`);
      }

      // Prioritize flows that contain the clicked template
      let flowsToSearch = allActiveFlows;
      if (clickedTemplateName) {
        const clickedLower = clickedTemplateName.toLowerCase().trim();
        flowsToSearch = [...allActiveFlows].sort((a, b) => {
          const aHasTpl = a.nodes?.some(n => n.type === 'templateNode' && n.data?.templateName?.toLowerCase().trim() === clickedLower);
          const bHasTpl = b.nodes?.some(n => n.type === 'templateNode' && n.data?.templateName?.toLowerCase().trim() === clickedLower);
          if (aHasTpl && !bHasTpl) return -1;
          if (!aHasTpl && bHasTpl) return 1;
          return 0;
        });
      }

      for (const flow of flowsToSearch) {
        const flowNodes = Array.isArray(flow?.nodes) ? flow.nodes : [];
        const flowEdges = Array.isArray(flow?.edges) ? flow.edges : [];
        const interactiveOrTemplateNodes = flowNodes.filter(n =>
          n && (
            n.type === 'templateNode' ||
            n.type === 'interactiveNode' ||
            n.type === 'carouselNode' ||
            (n.type === 'messageNode' && n.data?.messageType === 'interactive')
          )
        );

        for (const node of interactiveOrTemplateNodes) {
          // If this is a templateNode and we know which template was sent/clicked, ensure templateName matches!
          if (node.type === 'templateNode' && clickedTemplateName && node.data?.templateName) {
            const nodeTpl = String(node.data.templateName).trim().toLowerCase();
            const clickedTpl = String(clickedTemplateName).trim().toLowerCase();
            if (nodeTpl !== clickedTpl) {
              continue; // Do NOT match a button on a different template!
            }
          }

          let buttons = node.data?.buttons || node.data?.interactiveButtons || [];
          if (node.type === 'carouselNode' && Array.isArray(node.data?.cards)) {
            buttons = node.data.cards.flatMap(c => c.buttons || []);
          }
          if ((!buttons || buttons.length === 0) && node.type === 'templateNode' && node.data?.templateName) {
            try {
              const { default: Template } = await import('../models/Template.js');
              const tmpl = await Template.findOne({
                $or: [
                  { name: node.data.templateName },
                  { whatsappTemplateName: node.data.templateName }
                ]
              });
              const btnComp = tmpl?.components?.find(c => String(c.type).toUpperCase() === 'BUTTONS');
              if (btnComp && Array.isArray(btnComp.buttons)) {
                buttons = btnComp.buttons;
              }
            } catch (_) {}

            // 🌐 DYNAMIC FALLBACK: If template is not stored in MongoDB, fetch directly from Meta WABA!
            if (!buttons || buttons.length === 0) {
              try {
                const { getTenantWhatsAppService } = await import('../controllers/whatsappController.js');
                const tenantService = await getTenantWhatsAppService(channel.tenantId);
                if (tenantService) {
                  const metaTmpl = await tenantService.findTemplate(node.data.templateName);
                  const btnComp = metaTmpl?.components?.find(c => String(c?.type || '').toUpperCase() === 'BUTTONS');
                  if (btnComp && Array.isArray(btnComp.buttons)) {
                    buttons = btnComp.buttons;
                  }
                }
              } catch (_) {}
            }
          }

          const outgoingEdges = flowEdges.filter(e => e && e.source === node.id);
          if (outgoingEdges.length === 0) continue;

          let matchedBtn = null;
          let matchedIdx = -1;

          for (let i = 0; i < buttons.length; i++) {
            const b = buttons[i];
            const bCandidates = [
              b.text?.trim().toLowerCase(),
              b.title?.trim().toLowerCase(),
              b.payload?.trim().toLowerCase(),
            ].filter(Boolean);

            if (b.id && !String(b.id).startsWith('btn_') && !String(b.id).startsWith('row_') && isNaN(b.id)) {
              bCandidates.push(String(b.id).trim().toLowerCase());
            }

            // Accurate match: match by button title, text, or payload
            const isMatch = candidates.some(cp => {
              if (!cp) return false;
              const cleanCp = cp.trim().toLowerCase();
              return bCandidates.some(bc => {
                if (!bc) return false;
                const cleanBc = bc.trim().toLowerCase();
                return cleanBc === cleanCp || 
                       cleanBc.replace(/^btn-/, '') === cleanCp.replace(/^btn-/, '') ||
                       (cleanCp.length > 3 && cleanBc.length > 3 && (cleanBc === cleanCp || cleanBc.includes(cleanCp) || cleanCp.includes(cleanBc)));
              });
            });

            if (isMatch) {
              matchedBtn = b;
              matchedIdx = i;
              break;
            }
          }

          if (matchedBtn) {
            const btnId = (matchedBtn.id !== undefined && matchedBtn.id !== null && String(matchedBtn.id).trim() !== '') ? String(matchedBtn.id) : String(matchedIdx);
            let matchedEdge = outgoingEdges.find(e => {
              const sh = e.sourceHandle;
              if (!sh) return false;
              const shLower = sh.toLowerCase();
              return (
                candidates.includes(shLower) ||
                candidates.some(cp => shLower === `btn-${cp}`) ||
                sh === `btn-${btnId}` ||
                sh === `btn-${matchedIdx}` ||
                sh === `btn-btn_${matchedIdx}` ||
                (matchedBtn.text && (sh === `btn-${matchedBtn.text}` || shLower === `btn-${matchedBtn.text.toLowerCase()}`)) ||
                (matchedBtn.title && (sh === `btn-${matchedBtn.title}` || shLower === `btn-${matchedBtn.title.toLowerCase()}`)) ||
                sh === btnId ||
                sh === `${matchedIdx}`
              );
            });

            // Only fallback to single outgoing edge if this button was indeed the only button configured for this node
            if (!matchedEdge && outgoingEdges.length === 1 && buttons.length <= 1 && isButtonTap) {
              matchedEdge = outgoingEdges[0];
            }

            if (matchedEdge) {
              return { flow, node, target: matchedEdge.target };
            }
          } else if (isButtonTap && outgoingEdges.length > 0) {
            // Check direct edge match ONLY if handle matches the button title/payload explicitly
            const directEdge = outgoingEdges.find(e => {
              const sh = e.sourceHandle;
              if (!sh) return false;
              const shLower = sh.toLowerCase();
              const stripped = shLower.replace(/^btn-/, '').trim();
              return candidates.some(cp => {
                if (!cp) return false;
                const cpLower = cp.toLowerCase().trim();
                const cpStripped = cpLower.replace(/^btn-/, '').trim();
                return (
                  shLower === cpLower ||
                  shLower === `btn-${cpLower}` ||
                  (stripped.length > 2 && stripped === cpLower) ||
                  (stripped.length > 2 && stripped === cpStripped)
                );
              });
            });
            if (directEdge) {
              return { flow, node, target: directEdge.target };
            }
            // CRITICAL: Do NOT blindly return outgoingEdges[0] if the button didn't match!
            // Doing so causes this flow to hijack buttons belonging to other active flows.
          }
        }
      }
      return null;
    };

    // If an existing session is found, check if customer is attempting to restart or trigger another automation
    if (session) {
      let matchesAnyFlow = false;
      for (const flow of allActiveFlows) {
        const flowNodes = Array.isArray(flow?.nodes) ? flow.nodes : [];
        const tNode = flowNodes.find(n => n && (n.type === 'triggerNode' || n.type === 'eventTriggerNode'));
        if (tNode && isFlowTriggerMatch(tNode, payloadText, messageContext, isNewContact)) {
          matchesAnyFlow = true;
          break;
        }
      }

      // Check if user tapped a button that matches a template or interactive node in ANY active flow
      let buttonMatchesAnyFlow = false;
      if (isButtonTap) {
        const currentActiveFlow = allActiveFlows.find(f => f._id.toString() === session.activeFlowId?.toString());
        const currentNode = currentActiveFlow?.nodes?.find(n => n.id === session.currentNodeId);
        const currentOutgoing = currentActiveFlow?.edges?.filter(e => e.source === session.currentNodeId) || [];

        let currentCanHandle = false;
        if (currentNode) {
          // If the node is currently waiting for free-form user input (Ask Question / inputNode), it handles it!
          if (currentNode.type === 'inputNode' || session.status === 'WAITING_FOR_INPUT') {
            currentCanHandle = true;
          } else if (['catalogNode', 'commerceNode', 'carouselNode'].includes(currentNode.type)) {
            // These nodes only have a next step (main-handle) to continue the flow
            currentCanHandle = currentOutgoing.length > 0;
          } else {
            const btnHandles = currentOutgoing.map(e => e.sourceHandle?.toLowerCase()).filter(Boolean);
            const hasMainOrSingleEdge = btnHandles.includes('main-handle') || currentOutgoing.length === 1;

            // Also check pollNode options if currentNode is pollNode
            let pollMatches = false;
            if (currentNode.type === 'pollNode' && Array.isArray(currentNode.data?.options)) {
              pollMatches = currentNode.data.options.some((opt, idx) => {
                const optCand = [
                  opt.text?.trim().toLowerCase(),
                  opt.id?.toString().trim().toLowerCase(),
                  String(idx),
                  `opt-${idx}`,
                  `opt-${opt.text?.trim().toLowerCase()}`
                ].filter(Boolean);
                return candidatePayloads.some(cp => {
                  const clean = cp.toLowerCase().trim();
                  return optCand.includes(clean) || optCand.some(oc => oc.replace(/^opt-/, '') === clean.replace(/^opt-/, ''));
                });
              });
            }

            currentCanHandle = pollMatches || candidatePayloads.some(cp => {
              const cleanCp = cp.toLowerCase().trim();
              const strippedCp = cleanCp.replace(/^(btn-|row-|row_|opt-)/, '');
              return btnHandles.includes(cleanCp) ||
                btnHandles.includes(`btn-${cleanCp}`) ||
                btnHandles.includes(`row-${cleanCp}`) ||
                btnHandles.includes(`opt-${cleanCp}`) ||
                btnHandles.some(sh => {
                  if (!sh) return false;
                  const strippedSh = sh.replace(/^(btn-|row-|row_|opt-)/, '');
                  return (
                    strippedSh === cleanCp || 
                    strippedSh === strippedCp ||
                    cleanCp.replace(/^(btn-|row-|row_|opt-)/, '') === sh ||
                    sh.includes(strippedCp) ||
                    strippedCp.includes(strippedSh)
                  );
                });
            });

            if (!currentCanHandle && hasMainOrSingleEdge) {
              currentCanHandle = true;
            }
          }
        }

        // If current session's node CANNOT handle this button tap, check if ANY active flow has a template/button that matches
        if (!currentCanHandle) {
          const externalMatch = await findButtonEdgeMatch(candidatePayloads);
          if (externalMatch) {
            buttonMatchesAnyFlow = true;
          }
        }
      }

      // Break out if user types an explicit escape word, or taps a button from a template/flow, or triggers another flow
      const isWaitingInput = session.status === 'WAITING_FOR_INPUT';
      if (isEscapeWord || buttonMatchesAnyFlow || (!isWaitingInput && matchesAnyFlow)) {
        logger.log(`[FlowRunner] Interruption / Escape keyword / Template button tap detected for user ${customerPhone} (payload: "${incomingPayload}"). Completing existing session.`);
        const flowToRestart = (payloadText === 'restart' || payloadText === 'reset')
          ? (allActiveFlows.find(f => f._id.toString() === session.activeFlowId?.toString()) || await Automation.findById(session.activeFlowId))
          : null;

        await markSessionCompleted(session, customerPhone, channelId);
        session = null;

        if (flowToRestart) {
          logger.log(`[FlowRunner] 🔄 User typed 'restart'. Restarting flow '${flowToRestart.name}' from step 1 for ${customerPhone}`);
          const effectiveChannelId = channel._id ? channel._id.toString() : channelId;
          const rootNode = flowToRestart.nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode') || flowToRestart.nodes[0];
          const activeEdges = Array.isArray(flowToRestart.edges) ? flowToRestart.edges : [];
          const outgoing = activeEdges.filter(e => e && e.source === rootNode.id);
          const startNodeId = outgoing.length > 0 ? outgoing[0].target : rootNode.id;

          const newSession = new CustomerSession({
            phone: customerPhone,
            channelId: effectiveChannelId,
            activeFlowId: flowToRestart._id,
            currentNodeId: rootNode.id,
            sessionVariables: {}
          });
          await newSession.save();
          await processSpecificNode(customerPhone, effectiveChannelId, startNodeId);
          return;
        }
      }
    }

    let activeFlow;
    let nextNodeId;

    if (!session) {
      let matchedFlow = null;
      let matchedTriggerNode = null;
      let targetFromButtonEdge = null;

      // ─── PATH B (run FIRST for button taps) ─────────────────────────────────
      // Match template/interactive node buttons to outgoing edges.
      if (!matchedFlow && isButtonTap) {
        const btnMatch = await findButtonEdgeMatch(candidatePayloads);
        if (btnMatch) {
          logger.log(`[FlowRunner] 🎯 [PATH-B-PRIORITY] Matched button '${payloadText}' on node ${btnMatch.node.id} in flow '${btnMatch.flow.name}'. Next: ${btnMatch.target}`);
          matchedFlow = btnMatch.flow;
          matchedTriggerNode = btnMatch.node;
          targetFromButtonEdge = btnMatch.target;
        }
      }

      // ─── PATH A. Standard Trigger Nodes (Keywords, exact match, contains, any_message, etc.) ───
      // If customer sent ANY normal message (e.g. 'hello', 'hi', 'demo'), match active flows first!
      if (!matchedFlow) {
        for (const flow of allActiveFlows) {
          const tNode = flow.nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
          if (tNode && isFlowTriggerMatch(tNode, payloadText, messageContext, isNewContact)) {
            logger.log(`[FlowRunner] 🎯 [PATH-A] Matched keyword '${payloadText}' on trigger ${tNode.id} in flow '${flow.name}'`);
            matchedFlow = flow;
            matchedTriggerNode = tNode;
            break;
          }
        }
      }

      // ─── PATH B FALLBACK (If incoming text matches button text on a template/interactive node) ───
      if (!matchedFlow && payloadText) {
        const btnMatch = await findButtonEdgeMatch([payloadText]);
        if (btnMatch) {
          logger.log(`[FlowRunner] 🎯 [PATH-B-TEXT-FALLBACK] Matched text '${payloadText}' to button on node ${btnMatch.node.id} in flow '${btnMatch.flow.name}'. Next: ${btnMatch.target}`);
          matchedFlow = btnMatch.flow;
          matchedTriggerNode = btnMatch.node;
          targetFromButtonEdge = btnMatch.target;
        }
      }

      // ─── PATH C. Flows that start directly with a root templateNode (No explicit triggerNode) ───
      // If customer tapped a button that has no connected edge, do NOT re-trigger the root template!
      if (!matchedFlow && !isButtonTap) {
        for (const flow of allActiveFlows) {
          const flowNodes = Array.isArray(flow?.nodes) ? flow.nodes : [];
          const flowEdges = Array.isArray(flow?.edges) ? flow.edges : [];
          
          // Check if this flow has NO triggerNode
          const hasTrigger = flowNodes.some(n => n && (n.type === 'triggerNode' || n.type === 'eventTriggerNode'));
          if (!hasTrigger) {
            // Find the root node (a node with no incoming edges)
            const rootNode = flowNodes.find(n => !flowEdges.some(e => e && e.target === n.id)) || flowNodes[0];
            
            if (simulatorTargetFlowId) {
              if (flow._id?.toString() === simulatorTargetFlowId.toString()) {
                logger.log(`[FlowRunner] 🎯 [PATH-C-SIMULATOR] Triggering flow '${flow.name}' starting directly at root node ${rootNode.id} (${rootNode.type})`);
                matchedFlow = flow;
                matchedTriggerNode = rootNode;
                break;
              }
            }
            // Note: In Live WhatsApp, root templateNodes without an explicit triggerNode should ONLY
            // trigger when a customer actually taps one of the template's buttons (handled by PATH B above).
            // Normal free-form text messages (e.g. 'hi', 'hello') must NOT re-send the template.
          }
        }
      }

      // ─── PATH D. Dynamic Welcome & Away Messages (Fallback when NO custom flow keyword matched) ───
      const settings = await TenantSettings.findOne({ tenantId: channel.tenantId });
      
      if (!matchedFlow && settings) {
        // D1. AWAY / OUT-OF-OFFICE CHECK
        let isOutOfOffice = false;
        let configuredAwayAutomationId = null;

        if (settings.awayMessage && settings.awayMessage.enabled) {
          configuredAwayAutomationId = settings.awayMessage.automationId;
          if (settings.awayMessage.holidayMode) {
            isOutOfOffice = true;
          } else {
            const tz = settings.awayMessage.timezone || 'UTC';
            const nowStr = new Date().toLocaleString('en-US', { timeZone: tz, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
            const parts = nowStr.split(', ');
            const dayName = parts[0].toLowerCase();
            const timeStr = parts[1];
            const dayConfig = settings.awayMessage.workingHours?.get(dayName) || (settings.awayMessage.workingHours && settings.awayMessage.workingHours[dayName]);
            if (dayConfig) {
              if (!dayConfig.isOpen) {
                isOutOfOffice = true;
              } else if (dayConfig.open && dayConfig.close) {
                if (timeStr < dayConfig.open || timeStr > dayConfig.close) {
                  isOutOfOffice = true;
                }
              }
            }
          }
        }

        if (isOutOfOffice) {
          if (configuredAwayAutomationId) {
            const awayFlow = await Automation.findById(configuredAwayAutomationId);
            if (awayFlow && awayFlow.isActive) {
              matchedFlow = awayFlow;
              matchedTriggerNode = awayFlow.nodes.find(n => n.type === 'triggerNode') || awayFlow.nodes[0];
            }
          }
          if (!matchedFlow) {
            const awayText = settings.awayMessage.textMessage || 'We are currently away and will get back to you as soon as possible!';
            const payload = { messaging_product: 'whatsapp', recipient_type: 'individual', to: customerPhone, type: 'text', text: { body: awayText } };
            await sendWhatsAppMessage(customerPhone, payload, channel);
            return;
          }
        }

        // D2. WELCOME MESSAGE (Only if no specific keyword flow matched and customer greets or is new contact)
        if (!matchedFlow && settings.welcomeMessage && settings.welcomeMessage.enabled) {
          const isGreetingWord = ['hi', 'hello', 'hey', 'start', 'namaste'].includes(payloadText);
          if (isNewContact || isGreetingWord) {
            if (settings.welcomeMessage.automationId) {
              const welcomeFlow = await Automation.findById(settings.welcomeMessage.automationId);
              if (welcomeFlow && welcomeFlow.isActive) {
                matchedFlow = welcomeFlow;
                matchedTriggerNode = welcomeFlow.nodes.find(n => n.type === 'triggerNode') || welcomeFlow.nodes[0];
              }
            }
            if (!matchedFlow) {
              const welcomeText = settings.welcomeMessage.textMessage || 'Welcome! How can we help you today?';
              const payload = { messaging_product: 'whatsapp', recipient_type: 'individual', to: customerPhone, type: 'text', text: { body: welcomeText } };
              await sendWhatsAppMessage(customerPhone, payload, channel);
              return;
            }
          }
        }
      }

      if (!matchedFlow && (payloadText === 'restart' || payloadText === 'reset') && allActiveFlows.length > 0) {
        matchedFlow = allActiveFlows[0];
        matchedTriggerNode = matchedFlow.nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode') || matchedFlow.nodes[0];
      }

      activeFlow = matchedFlow;
      let triggerNode = matchedTriggerNode;

      if (!activeFlow) {
        // Fallback: check dynamic settings first
        if (settings && settings.fallbackMessage && settings.fallbackMessage.enabled) {
          if (settings.fallbackMessage.automationId) {
            activeFlow = await Automation.findById(settings.fallbackMessage.automationId);
            if (activeFlow && activeFlow.isActive) {
              triggerNode = activeFlow.nodes.find(n => n.type === 'triggerNode') || activeFlow.nodes[0];
            } else {
              activeFlow = null;
            }
          }
          if (!activeFlow) {
            const fallbackText = settings.fallbackMessage.textMessage || 'Sorry, we did not understand that. Please reply with a keyword or wait for an agent.';
            const payload = { messaging_product: 'whatsapp', recipient_type: 'individual', to: customerPhone, type: 'text', text: { body: fallbackText } };
            await sendWhatsAppMessage(customerPhone, payload, channel);
            return;
          }
        }
      }

      if (!activeFlow || !triggerNode) {
        // Global Routing FALLBACK
        const fallbackRule = rules.find(r => r.ruleType === 'FALLBACK');
        if (fallbackRule) {
           if (fallbackRule.action === 'SEND_MESSAGE' && fallbackRule.replyMessage) {
              const payload = { messaging_product: 'whatsapp', recipient_type: 'individual', to: customerPhone, type: 'text', text: { body: fallbackRule.replyMessage } };
              await sendWhatsAppMessage(customerPhone, payload, channel);
           } else if (fallbackRule.action === 'TRIGGER_FLOW' && fallbackRule.flowId) {
              await startFlowManually(customerPhone, channel._id, fallbackRule.flowId);
           }
        } else {
           logger.log(`No flow triggered for payload: ${incomingPayload} and no fallback found.`);
        }
        return;
      }

      // If triggered by a button click on a template/interactive node, advance straight along that edge!
      // If triggerNode is an actual trigger (triggerNode/eventTriggerNode), follow outgoing edge.
      // If it is a direct root node (like templateNode), start directly on that node!
      if (targetFromButtonEdge) {
        nextNodeId = targetFromButtonEdge;
      } else {
        const isTriggerType = ['triggerNode', 'eventTriggerNode'].includes(triggerNode.type);
        if (isTriggerType) {
          const activeEdges = Array.isArray(activeFlow?.edges) ? activeFlow.edges : [];
          const outgoingEdges = activeEdges.filter(e => e && e.source === triggerNode.id);
          nextNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
        } else {
          nextNodeId = triggerNode.id;
        }
      }

      if (!nextNodeId) return;

      const effectiveChannelId = channel._id ? channel._id.toString() : channelId;

      session = new CustomerSession({
        phone: customerPhone,
        channelId: effectiveChannelId,
        activeFlowId: activeFlow._id,
        currentNodeId: targetFromButtonEdge ? triggerNode.id : triggerNode.id,
        referral: referral,
        lastIncomingMessageId: incomingMessageId
      });
      await session.save();
      
      // Start processing the nodes in the flow!
      await processSpecificNode(customerPhone, effectiveChannelId, nextNodeId);
      return; // Prevent double execution

    } else {
      // 2. Existing session
      activeFlow = await Automation.findById(session.activeFlowId);
      if (!activeFlow) {
        session.status = 'FAILED';
        await session.save();
        return;
      }

      session.lastIncomingMessageId = incomingMessageId;
      if (!session) return;
  
      // If the session was waiting for an event (e.g. any_message), resume it on the "event_happened" edge
      if (session.status === 'WAITING_FOR_EVENT' && session.expectedEvent === 'any_message') {
        logger.log(`[FlowRunner] Resuming session ${session._id} from WAITING_FOR_EVENT`);
        session.status = 'ACTIVE';
        session.expectedEvent = null;
        await session.save();
        
        // Find the current wait node and move to the 'event_happened' edge
        const activeFlow = await Automation.findById(session.activeFlowId);
        if (activeFlow) {
          const waitEdge = activeFlow.edges.find(e => e.source === session.currentNodeId && e.sourceHandle === 'event_happened') ||
                           activeFlow.edges.find(e => e.source === session.currentNodeId && (!e.sourceHandle || e.sourceHandle !== 'timeout')) ||
                           activeFlow.edges.find(e => e.source === session.currentNodeId);
          if (waitEdge) {
            await processSpecificNode(customerPhone, channelId, waitEdge.target);
            return;
          }
        }
      }

      if (session.status === 'WAITING_FOR_INPUT') {
        const currentNode = activeFlow.nodes.find(n => n.id === session.currentNodeId);
        const nodeQuestion = String(currentNode?.data?.text || currentNode?.data?.question || '').toLowerCase();
        const validationType = String(session.expectedValidation || currentNode?.data?.validationType || 'text').toLowerCase().trim();

        // Check if intent is combined Name and Phone (either explicit validationType or question asking for both)
        const isExplicitNameAndPhone = ['name_and_phone', 'name_and_mobile', 'name_phone', 'name_mobile', 'name_number'].includes(validationType);
        const isQuestionAskingBoth = (nodeQuestion.includes('name') || nodeQuestion.includes('naam')) &&
                                     (nodeQuestion.includes('mobile') || nodeQuestion.includes('phone') || nodeQuestion.includes('number') || nodeQuestion.includes('no'));
        const isCombinedNamePhone = isExplicitNameAndPhone || (validationType === 'text' && isQuestionAskingBoth);

        // Check if intent is combined Date and Time / Appointment Slot
        const isExplicitDateTime = ['datetime', 'date_time', 'date_and_time', 'slot', 'appointment'].includes(validationType);
        const isQuestionAskingDateTime = (nodeQuestion.includes('date') || nodeQuestion.includes('taareekh') || nodeQuestion.includes('din')) &&
                                         (nodeQuestion.includes('time') || nodeQuestion.includes('samay') || nodeQuestion.includes('baje') || nodeQuestion.includes('slot'));
        const isCombinedDateTime = isExplicitDateTime || (validationType === 'text' && isQuestionAskingDateTime);

        let isValid = true;
        let extractedCombined = null;
        let extractedDateTime = null;

        if (isCombinedNamePhone) {
          extractedCombined = extractNameAndPhone(incomingPayload);
          isValid = !!extractedCombined;
        } else if (isCombinedDateTime) {
          extractedDateTime = extractDateAndTime(incomingPayload);
          isValid = !!(extractedDateTime && (extractedDateTime.hasDate || extractedDateTime.hasTime));
        } else if (validationType === 'name') {
          // If customer provides both name and phone, extract both gracefully
          const combined = extractNameAndPhone(incomingPayload);
          if (combined) {
            isValid = true;
            extractedCombined = combined;
          } else {
            let cleanName = (incomingPayload || '').trim();
            cleanName = cleanName.replace(/^(?:my\s+name\s+is|mera\s+naam|i\s+am|im|this\s+is)\s+/i, '').trim();
            const invalidNames = ['hi', 'hello', 'hey', 'ok', 'okay', 'yes', 'no', 'namaste', 'test', 'demo', 'none', 'na', 'n/a', 'bye', 'good morning', 'good afternoon', 'good evening'];
            const hasLetters = /[a-zA-Z\u0900-\u097F]{2,}/.test(cleanName);
            const isPureNumber = /^\d+$/.test(cleanName.replace(/[\s+-]/g, ''));
            const isDisallowedWord = invalidNames.includes(cleanName.toLowerCase());
            isValid = hasLetters && !isPureNumber && !isDisallowedWord && cleanName.length >= 2;
            if (isValid) incomingPayload = cleanName;
          }
        } else if (validationType === 'email') {
          const emailMatch = (incomingPayload || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            isValid = true;
            incomingPayload = emailMatch[0];
          } else {
            isValid = false;
          }
        } else if (validationType === 'phone' || validationType === 'mobile') {
          const combined = extractNameAndPhone(incomingPayload);
          if (combined) {
            isValid = true;
            extractedCombined = combined;
          } else {
            const phoneMatch = (incomingPayload || '').match(/(?:(?:\+|0{0,2})91[\s-]*)?([6-9]\d{4}[\s-]?\d{5}|[6-9]\d{9})\b|\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/);
            if (phoneMatch) {
              let digitsOnly = phoneMatch[0].replace(/\D/g, '');
              if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) digitsOnly = digitsOnly.substring(2);
              if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) digitsOnly = digitsOnly.substring(1);
              
              const isAllSameDigit = /^(\d)\1+$/.test(digitsOnly);
              const isSequential = '0123456789012345'.includes(digitsOnly) || '9876543210987654'.includes(digitsOnly);
              if (digitsOnly.length === 10 && !isAllSameDigit && !isSequential) {
                isValid = true;
                incomingPayload = digitsOnly;
              } else {
                isValid = false;
              }
            } else {
              const digits = (incomingPayload || '').replace(/[\s+-]/g, '');
              const isAllSame = /^(\d)\1+$/.test(digits);
              isValid = /^\d{8,15}$/.test(digits) && !isAllSame;
              if (isValid) incomingPayload = digits;
            }
          }
        } else if (validationType === 'number') {
          const stripped = (incomingPayload || '').replace(/[,₹$€£\s]|rs\.?|rupees|inr/gi, '');
          isValid = !isNaN(Number(stripped)) && stripped.trim() !== '';
          if (isValid) incomingPayload = stripped.trim();
        } else if (validationType === 'date') {
          const dt = extractDateAndTime(incomingPayload);
          if (dt && dt.hasDate) {
            isValid = true;
            extractedDateTime = dt;
          } else {
            isValid = false;
          }
        } else if (validationType === 'time') {
          const dt = extractDateAndTime(incomingPayload);
          if (dt && dt.hasTime) {
            isValid = true;
            extractedDateTime = dt;
          } else {
            isValid = false;
          }
        } else if (['url', 'website', 'link'].includes(validationType)) {
          const urlMatch = (incomingPayload || '').match(/(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
          if (urlMatch) {
            isValid = true;
            let finalUrl = urlMatch[0];
            if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
            incomingPayload = finalUrl;
          } else {
            isValid = false;
          }
        } else if (validationType === 'location') {
          isValid = incomingPayload.toLowerCase() === '[__media_location__]' || messageContext?.messageType === 'location' || !!messageContext?.location;
        } else if (['photo', 'image'].includes(validationType)) {
          isValid = incomingPayload.toLowerCase() === '[__media_image__]' || messageContext?.messageType === 'image' || !!messageContext?.mediaUrl;
        } else if (['audio', 'voice'].includes(validationType)) {
          isValid = incomingPayload.toLowerCase() === '[__media_audio__]' || ['audio', 'voice'].includes(messageContext?.messageType);
        } else if (['pdf', 'document', 'file'].includes(validationType)) {
          isValid = incomingPayload.toLowerCase() === '[__media_document__]' || messageContext?.messageType === 'document' || !!messageContext?.mediaUrl;
        } else if (validationType === 'video') {
          isValid = incomingPayload.toLowerCase() === '[__media_video__]' || messageContext?.messageType === 'video' || !!messageContext?.mediaUrl;
        } else if (validationType === 'address') {
          const cleanAddr = (incomingPayload || '').trim();
          isValid = cleanAddr.length >= 3;
        } else if (['text', 'string', 'any'].includes(validationType)) {
          isValid = incomingPayload && incomingPayload.trim().length > 0;
        }

        if (!isValid) {
          session.validationRetries = (session.validationRetries || 0) + 1;
          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;
          
          if (session.validationRetries >= 3) {
            session.status = 'HANDOFF';
            await session.save();
            await sendWhatsAppMessage(customerPhone, {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: customerPhone,
              type: 'text',
              text: 'Too many invalid attempts. I am transferring you to a human agent, or you can type *restart* anytime to start over.'
            }, channelToUse);
            return;
          }

          // Stay on current node and send error message
          let defaultErrMsg = `⚠️ Invalid input. Please provide a valid ${validationType}, or type *restart* to start over.`;
          if (isCombinedNamePhone) {
            defaultErrMsg = '⚠️ Invalid input. Please share both your full name and 10-digit mobile number, or type *restart* to start over.';
          } else if (isCombinedDateTime) {
            defaultErrMsg = '⚠️ Invalid date & time. Please share your preferred date and time (e.g. Tomorrow 4:00 PM or 15/10/2026 at 11:00 AM), or type *restart* to start over.';
          } else if (validationType === 'name') {
            defaultErrMsg = '⚠️ Invalid name. Please enter a valid full name, or type *restart* to start over.';
          } else if (validationType === 'phone' || validationType === 'mobile') {
            defaultErrMsg = '⚠️ Invalid mobile number. Please enter a valid 10-digit phone number, or type *restart* to start over.';
          } else if (validationType === 'email') {
            defaultErrMsg = '⚠️ Invalid email address. Please enter a valid email (e.g. name@example.com), or type *restart* to start over.';
          } else if (validationType === 'number') {
            defaultErrMsg = '⚠️ Invalid number. Please enter a valid numeric value, or type *restart* to start over.';
          } else if (validationType === 'date') {
            defaultErrMsg = '⚠️ Invalid date. Please provide a valid date (e.g. DD/MM/YYYY, Tomorrow, or 15 Oct), or type *restart* to start over.';
          } else if (validationType === 'time') {
            defaultErrMsg = '⚠️ Invalid time. Please provide a valid time (e.g. 10:30 AM, 4:00 PM, or 5 baje), or type *restart* to start over.';
          } else if (['url', 'website', 'link'].includes(validationType)) {
            defaultErrMsg = '⚠️ Invalid website link. Please enter a valid website URL (e.g. https://example.com), or type *restart* to start over.';
          } else if (validationType === 'location') {
            defaultErrMsg = '⚠️ Location not received. Please share your location using the WhatsApp attachment icon (📍), or type *restart* to start over.';
          } else if (['photo', 'image'].includes(validationType)) {
            defaultErrMsg = '⚠️ Image not received. Please attach a photo or image (📷), or type *restart* to start over.';
          } else if (['pdf', 'document', 'file'].includes(validationType)) {
            defaultErrMsg = '⚠️ Document not received. Please attach a valid document (PDF) (📄), or type *restart* to start over.';
          } else if (['audio', 'voice'].includes(validationType)) {
            defaultErrMsg = '⚠️ Audio not received. Please record and send a voice message (🎤), or type *restart* to start over.';
          } else if (validationType === 'video') {
            defaultErrMsg = '⚠️ Video not received. Please attach a video file (🎥), or type *restart* to start over.';
          } else if (validationType === 'address') {
            defaultErrMsg = '⚠️ Address too short. Please provide your complete delivery or office address, or type *restart* to start over.';
          }

          let errorMsg = currentNode?.data?.validationErrorMessage || defaultErrMsg;
          if (!errorMsg.toLowerCase().includes('restart')) {
            errorMsg += ' (or type *restart* to start over)';
          }

          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: errorMsg }
          };
          
          await sendWhatsAppMessage(customerPhone, payload, channelToUse);
          await session.save(); // Save incremented retry count
          return; // Stop execution, wait for user to try again
        }

        // Cancel any pending timeout jobs for this customer since they responded with valid input
        try {
          const { default: DelayedJob } = await import('../models/DelayedJob.js');
          await DelayedJob.updateMany(
            { customerPhone, status: 'PENDING' },
            { $set: { status: 'CANCELLED' } }
          );
        } catch (_) {}

        // Process input answer safely (if customer uploaded media or location, save the real URL/data)
        let valToSave = incomingPayload;
        if (extractedCombined) {
          valToSave = extractedCombined.name;
        } else if (['photo', 'image', 'pdf', 'document', 'audio', 'voice', 'video'].includes(validationType) && messageContext?.mediaUrl) {
          valToSave = messageContext.mediaUrl;
        } else if (validationType === 'location' && messageContext?.location) {
          valToSave = typeof messageContext.location === 'object' ? JSON.stringify(messageContext.location) : String(messageContext.location);
        }

        const rawVarName = session.saveVariableAs || (isCombinedNamePhone ? 'contact.name' : 'custom_field');
        if (!session.sessionVariables || typeof session.sessionVariables !== 'object') {
          session.sessionVariables = {};
        } else if (session.sessionVariables instanceof Map) {
          session.sessionVariables = Object.fromEntries(session.sessionVariables);
        }

        if (extractedCombined) {
          session.sessionVariables['name'] = extractedCombined.name;
          session.sessionVariables['contact.name'] = extractedCombined.name;
          session.sessionVariables['phone'] = extractedCombined.phone;
          session.sessionVariables['contact.phone'] = extractedCombined.phone;
          session.sessionVariables['mobile'] = extractedCombined.phone;
          session.sessionVariables['contact.mobile'] = extractedCombined.phone;
          session.sessionVariables['alternate_phone'] = extractedCombined.phone;
          session.sessionVariables['contact.alternate_phone'] = extractedCombined.phone;
          session.sessionVariables['contact.extracted_phone'] = extractedCombined.phone;

          // Also persist extracted contact phone directly to database
          try {
            const dbContact = await Contact.findOne({ phone: customerPhone, channelId });
            if (dbContact) {
              dbContact.name = extractedCombined.name;
              if (!dbContact.customFields || typeof dbContact.customFields !== 'object') {
                dbContact.customFields = {};
              }
              if (dbContact.customFields instanceof Map) {
                dbContact.customFields.set('alternate_phone', extractedCombined.phone);
              } else if (Array.isArray(dbContact.customFields)) {
                const existingIdx = dbContact.customFields.findIndex(f => f.key === 'alternate_phone');
                if (existingIdx !== -1) {
                  dbContact.customFields[existingIdx].value = extractedCombined.phone;
                } else {
                  dbContact.customFields.push({ key: 'alternate_phone', name: 'alternate_phone', value: extractedCombined.phone });
                }
                dbContact.markModified('customFields');
              } else {
                dbContact.customFields['alternate_phone'] = extractedCombined.phone;
                dbContact.markModified('customFields');
              }
              await dbContact.save();
            }
          } catch (e) {
            logger.error('Failed to sync alternate_phone from combined input:', e);
          }
        }

        if (extractedDateTime) {
          if (extractedDateTime.date) {
            session.sessionVariables['date'] = extractedDateTime.date;
            session.sessionVariables['selected_date'] = extractedDateTime.date;
            session.sessionVariables['appointment_date'] = extractedDateTime.date;
            session.sessionVariables['contact.appointment_date'] = extractedDateTime.date;
          }
          if (extractedDateTime.time) {
            session.sessionVariables['time'] = extractedDateTime.time;
            session.sessionVariables['selected_time'] = extractedDateTime.time;
            session.sessionVariables['appointment_time'] = extractedDateTime.time;
            session.sessionVariables['contact.appointment_time'] = extractedDateTime.time;
          }
          if (extractedDateTime.slot) {
            session.sessionVariables['selected_slot'] = extractedDateTime.slot;
            session.sessionVariables['appointment_slot'] = extractedDateTime.slot;
            session.sessionVariables['slot'] = extractedDateTime.slot;
            session.sessionVariables['datetime'] = extractedDateTime.slot;
          }
        }
        
        // Save both with and without prefix so {{neet_score}} and {{contact.neet_score}} both work!
        session.sessionVariables[rawVarName] = valToSave;
        if (rawVarName.startsWith('contact.')) {
          const shortName = rawVarName.replace('contact.', '');
          session.sessionVariables[shortName] = valToSave;
          
          // Also persist directly to Contact in database
          try {
            const dbContact = await Contact.findOne({ phone: customerPhone, channelId });
            if (dbContact) {
              if (['name', 'email'].includes(shortName)) {
                dbContact[shortName] = valToSave;
              } else {
                if (!dbContact.customFields || typeof dbContact.customFields !== 'object') {
                  dbContact.customFields = {};
                }
                if (dbContact.customFields instanceof Map) {
                  dbContact.customFields.set(shortName, valToSave);
                } else if (Array.isArray(dbContact.customFields)) {
                  const existingIdx = dbContact.customFields.findIndex(f => f.key === shortName || f.name === shortName);
                  if (existingIdx !== -1) {
                    dbContact.customFields[existingIdx].value = valToSave;
                  } else {
                    dbContact.customFields.push({ key: shortName, name: shortName, value: valToSave });
                  }
                  dbContact.markModified('customFields');
                } else {
                  dbContact.customFields[shortName] = valToSave;
                  dbContact.markModified('customFields');
                }
              }
              await dbContact.save();
            }
          } catch (e) {
            logger.error('Failed to sync contact field from inputNode:', e);
          }
        } else {
          session.sessionVariables[`contact.${rawVarName}`] = valToSave;
          
          // Also persist non-prefixed variable name into Contact customFields
          try {
            const dbContact = await Contact.findOne({ phone: customerPhone, channelId });
            if (dbContact) {
              if (['name', 'email'].includes(rawVarName)) {
                dbContact[rawVarName] = valToSave;
              } else {
                if (!dbContact.customFields || typeof dbContact.customFields !== 'object') {
                  dbContact.customFields = {};
                }
                if (dbContact.customFields instanceof Map) {
                  dbContact.customFields.set(rawVarName, valToSave);
                } else if (Array.isArray(dbContact.customFields)) {
                  const existingIdx = dbContact.customFields.findIndex(f => f.key === rawVarName || f.name === rawVarName);
                  if (existingIdx !== -1) {
                    dbContact.customFields[existingIdx].value = valToSave;
                  } else {
                    dbContact.customFields.push({ key: rawVarName, name: rawVarName, value: valToSave });
                  }
                  dbContact.markModified('customFields');
                } else {
                  dbContact.customFields[rawVarName] = valToSave;
                  dbContact.markModified('customFields');
                }
              }
              await dbContact.save();
            }
          } catch (e) {
            logger.error('Failed to sync non-prefixed contact field from inputNode:', e);
          }
        }
        session.markModified('sessionVariables');

        session.status = 'ACTIVE';
        session.expectedValidation = null;
        session.saveVariableAs = null;
        session.validationRetries = 0; // Reset retries on success
        await session.save();

        const outgoingEdges = activeFlow.edges.filter(e => e.source === session.currentNodeId);
        const resolvedInputEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle') ||
                                  outgoingEdges.find(e => !e.sourceHandle || e.sourceHandle !== 'timeout') ||
                                  outgoingEdges[0];
        nextNodeId = resolvedInputEdge ? resolvedInputEdge.target : null;

        if (!nextNodeId) {
          await markSessionCompleted(session, customerPhone, channelId);
          return;
        }
      } else {
        const currentNode = activeFlow.nodes.find(n => n.id === session.currentNodeId);
        if (currentNode?.type === 'delayNode') {
          // If the flow is paused at a delay, ignore incoming messages for this flow.
          // The delay queue will resume execution when the timer finishes.
          logger.log(`User ${customerPhone} sent a message during a delay node. Ignoring to preserve flow state.`);
          return;
        }

        // Move to the next node based on user's input (edges).
        const outgoingEdges = activeFlow.edges.filter(e => e.source === session.currentNodeId);
        nextNodeId = null;

        const isInteractiveNode = ['menuNode', 'catalogNode', 'pollNode', 'commerceNode', 'carouselNode', 'interactiveNode'].includes(currentNode?.type) || 
                                  (currentNode?.type === 'messageNode' && (currentNode?.data?.messageType === 'interactive' || (currentNode?.data?.buttons && currentNode.data.buttons.length > 0) || (currentNode?.data?.sections && currentNode.data.sections.length > 0))) || 
                                  (currentNode?.type === 'templateNode' && ((currentNode?.data?.buttons && currentNode.data.buttons.length > 0) || outgoingEdges.some(e => e.sourceHandle && e.sourceHandle.startsWith('btn-'))));

        if (isInteractiveNode) {
          // If the interactive node has no outgoing edges, it's terminal. Complete the session!
          if (outgoingEdges.length === 0) {
            logger.log(`[FlowRunner] Interactive node ${currentNode?.id} has no outgoing edges. Completing session.`);
            await markSessionCompleted(session, customerPhone, channelId);
            return;
          }

          // For interactive nodes, the reply MUST match a specific button/list ID (sourceHandle)
          logger.log(`[DEBUG Engine] Trying to match incomingPayload '${incomingPayload}' on node ${currentNode?.type}`);
          logger.log(`[DEBUG Engine] Available edges for ${session.currentNodeId}:`, JSON.stringify(outgoingEdges));
          
          let isExplicitChoiceRecognized = false;

          let matchedEdge = outgoingEdges.find(e => 
             e.sourceHandle === incomingPayload || 
             e.sourceHandle === `btn-${incomingPayload}` || 
             e.sourceHandle === `row-${incomingPayload}`
          );
          
          // Match by title/label case-insensitively (for both Simulator and WhatsApp)
          if (!matchedEdge) {
             const lowerIncoming = (incomingPayload || '').trim().toLowerCase();
             const candidateInputs = [
               lowerIncoming,
               messageContext?.buttonText?.trim().toLowerCase(),
               messageContext?.buttonTitle?.trim().toLowerCase(),
               messageContext?.buttonPayload?.trim().toLowerCase(),
               messageContext?.buttonId?.trim().toLowerCase(),
               messageContext?.listTitle?.trim().toLowerCase(),
               messageContext?.listId?.trim().toLowerCase(),
               messageContext?.optText?.trim().toLowerCase(),
               messageContext?.optId?.trim().toLowerCase(),
               messageContext?.optIdx !== undefined && messageContext?.optIdx !== null ? String(messageContext.optIdx) : null,
               messageContext?.optionName?.trim().toLowerCase(),
               messageContext?.rowId?.trim().toLowerCase()
             ].filter(Boolean);

             if (currentNode.type === 'interactiveNode' || currentNode.type === 'messageNode' || currentNode.type === 'templateNode' || currentNode.type === 'carouselNode') {
                 let buttons = currentNode.data?.buttons || [];
                 if (currentNode.type === 'carouselNode' && Array.isArray(currentNode.data?.cards)) {
                   buttons = currentNode.data.cards.flatMap(c => c.buttons || []);
                 }
                 if ((!buttons || buttons.length === 0) && currentNode.type === 'templateNode' && currentNode.data?.templateName) {
                   try {
                     const { default: Template } = await import('../models/Template.js');
                     const tmpl = await Template.findOne({
                       $or: [
                         { name: currentNode.data.templateName },
                         { whatsappTemplateName: currentNode.data.templateName },
                         { metaTemplateName: currentNode.data.templateName }
                       ]
                     });
                     const btnComp = tmpl?.components?.find(c => String(c.type).toUpperCase() === 'BUTTONS');
                     if (btnComp && Array.isArray(btnComp.buttons)) {
                       buttons = btnComp.buttons;
                     }
                   } catch (_) {}

                   // 🌐 DYNAMIC FALLBACK: If template is not stored in MongoDB, fetch directly from Meta WABA!
                   if (!buttons || buttons.length === 0) {
                     try {
                       const { getTenantWhatsAppService } = await import('../controllers/whatsappController.js');
                       const tenantService = await getTenantWhatsAppService(channel.tenantId);
                       if (tenantService) {
                         const metaTmpl = await tenantService.findTemplate(currentNode.data.templateName);
                         const btnComp = metaTmpl?.components?.find(c => String(c?.type || '').toUpperCase() === 'BUTTONS');
                         if (btnComp && Array.isArray(btnComp.buttons)) {
                           buttons = btnComp.buttons;
                         }
                       }
                     } catch (_) {}
                   }
                 }

                 const btnIdx = (buttons || []).findIndex((b, idx) => {
                   const bCandidates = [
                     b.text?.trim().toLowerCase(),
                     b.title?.trim().toLowerCase(),
                     b.payload?.trim().toLowerCase(),
                     b.id?.toString().trim().toLowerCase(),
                     String(idx),
                      String(idx + 1),
                      `btn-${idx + 1}`,
                      `button ${idx + 1}`,
                      `btn ${idx + 1}`
                   ].filter(Boolean);
                   return candidateInputs.some(ci => 
                     bCandidates.includes(ci) || bCandidates.some(bc => bc.includes(ci) || ci.includes(bc))
                   );
                 });

                 if (btnIdx !== -1) {
                    isExplicitChoiceRecognized = true;
                    const btn = buttons[btnIdx];
                    const btnId = (btn.id !== undefined && btn.id !== null && String(btn.id).trim() !== '') ? String(btn.id) : String(btnIdx);
                    
                    // Persist selected button into session variables
                    const chosenBtnTitle = btn.text || btn.title || btn.payload || '';
                    if (chosenBtnTitle) {
                      session.sessionVariables['selected_button'] = chosenBtnTitle;
                      session.sessionVariables['selected_option'] = chosenBtnTitle;
                      session.sessionVariables['contact.last_button_choice'] = chosenBtnTitle;

                      // 📅 Smart Date & Time extraction from button text
                      const dtBtn = extractDateAndTime(chosenBtnTitle);
                      if (dtBtn?.date) {
                        session.sessionVariables['selected_date'] = dtBtn.date;
                        session.sessionVariables['appointment_date'] = dtBtn.date;
                        session.sessionVariables['date'] = dtBtn.date;
                        session.sessionVariables['contact.appointment_date'] = dtBtn.date;
                      }
                      if (dtBtn?.time) {
                        session.sessionVariables['selected_time'] = dtBtn.time;
                        session.sessionVariables['appointment_time'] = dtBtn.time;
                        session.sessionVariables['time'] = dtBtn.time;
                        session.sessionVariables['contact.appointment_time'] = dtBtn.time;
                      }
                      if (dtBtn?.slot) {
                        session.sessionVariables['selected_slot'] = chosenBtnTitle;
                        session.sessionVariables['appointment_slot'] = chosenBtnTitle;
                        session.sessionVariables['slot'] = chosenBtnTitle;
                        session.sessionVariables['datetime'] = dtBtn.slot;
                      }

                      if (currentNode.data?.saveVariableAs) {
                        session.sessionVariables[currentNode.data.saveVariableAs] = btn.payload || btn.id || chosenBtnTitle;
                      }
                      session.markModified('sessionVariables');
                    }

                    matchedEdge = outgoingEdges.find(e => {
                      const sh = e.sourceHandle;
                      const shLower = sh?.toLowerCase();
                      return (
                        candidateInputs.includes(shLower) ||
                        candidateInputs.some(ci => shLower === `btn-${ci}`) ||
                        sh === `btn-${btnId}` || 
                        sh === `btn-${btnIdx}` ||
                        sh === `btn-btn_${btnIdx}` ||
                        (btn.text && (sh === `btn-${btn.text}` || shLower === `btn-${btn.text.toLowerCase()}`)) ||
                        (btn.title && (sh === `btn-${btn.title}` || shLower === `btn-${btn.title.toLowerCase()}`)) ||
                        sh === btnId || 
                        sh === `${btnIdx}`
                      );
                    });
                 }

                 // 🎯 100% DYNAMIC DIRECT EDGE MATCH: Even if template button metadata isn't cached or user gave custom handles,
                 // evaluate outgoing edges directly against all candidate button inputs
                 if (!matchedEdge && outgoingEdges.length > 0) {
                   matchedEdge = outgoingEdges.find(e => {
                     const sh = e.sourceHandle;
                     if (!sh) return false;
                     const shLower = sh.toLowerCase();
                     const stripped = shLower.replace(/^btn-/, '').trim();
                     return candidateInputs.some(ci => {
                       if (!ci) return false;
                       const ciLower = ci.toLowerCase().trim();
                       const ciStripped = ciLower.replace(/^btn-/, '').trim();
                       return (
                         shLower === ciLower ||
                         shLower === `btn-${ciLower}` ||
                         stripped === ciLower ||
                         stripped === ciStripped ||
                         shLower.includes(ciLower) ||
                         ciLower.includes(stripped)
                       );
                     });
                   });
                   if (matchedEdge) {
                     isExplicitChoiceRecognized = true;
                   }
                 }

                 // 🎯 SINGLE OUTGOING EDGE FALLBACK: If customer tapped ANY button and node has only 1 connected edge, route to it!
                 if (!matchedEdge && outgoingEdges.length === 1 && isButtonTap) {
                   matchedEdge = outgoingEdges[0];
                   isExplicitChoiceRecognized = true;
                 }
                 // 🎯 CAROUSEL MAIN-HANDLE FALLBACK: CarouselNode uses main-handle to proceed to next step
                 if (!matchedEdge && currentNode.type === 'carouselNode' && outgoingEdges.length > 0) {
                   matchedEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
                   if (matchedEdge) isExplicitChoiceRecognized = true;
                 }
             } else if (currentNode.type === 'menuNode' && currentNode.data?.sections) {
                let matchedRow = null;
                let matchedSecIdx = -1;
                let matchedRowIdx = -1;

                for (let sIdx = 0; sIdx < currentNode.data.sections.length; sIdx++) {
                  const sec = currentNode.data.sections[sIdx];
                  for (let rIdx = 0; rIdx < (sec.rows || []).length; rIdx++) {
                    const r = sec.rows[rIdx];
                    const rCandidates = [
                      r.title?.trim().toLowerCase(),
                      r.id?.toString().trim().toLowerCase(),
                      r.postbackId?.toString().trim().toLowerCase(),
                      `${sIdx}_${rIdx}`,
                      String(rIdx),
                      String(rIdx + 1),
                      `option ${rIdx + 1}`,
                      `opt ${rIdx + 1}`,
                      `row ${rIdx + 1}`
                    ].filter(Boolean);

                    const isMatch = candidateInputs.some(ci =>
                      rCandidates.includes(ci) || rCandidates.some(rc => rc.includes(ci) || ci.includes(rc))
                    );

                    if (isMatch) {
                      matchedRow = r;
                      matchedSecIdx = sIdx;
                      matchedRowIdx = rIdx;
                      break;
                    }
                  }
                  if (matchedRow) break;
                }

                if (matchedRow) {
                  isExplicitChoiceRecognized = true;
                  const rowId = String(matchedRow.postbackId || matchedRow.id || matchedRowIdx);
                  const rowTitle = matchedRow.title || '';

                  // Persist selected list item into session variables for downstream logic
                  session.sessionVariables['selected_menu_option'] = rowTitle;
                  session.sessionVariables['selected_option'] = rowTitle;
                  session.sessionVariables['selected_row_id'] = rowId;
                  session.sessionVariables['contact.last_menu_choice'] = rowTitle;

                  // 📅 SMART DATE & TIME SLOT EXTRACTION FROM MENU SELECTION
                  const secTitle = currentNode.data.sections[matchedSecIdx]?.title || '';
                  const dtCombined = extractDateAndTime(`${secTitle} ${rowTitle}`);
                  const dtRow = extractDateAndTime(rowTitle);
                  const dtSec = extractDateAndTime(secTitle);

                  const resolvedDate = dtCombined?.date || dtSec?.date || dtRow?.date;
                  const resolvedTime = dtCombined?.time || dtRow?.time || dtSec?.time;
                  const resolvedSlot = rowTitle;

                  if (resolvedDate) {
                    session.sessionVariables['selected_date'] = resolvedDate;
                    session.sessionVariables['appointment_date'] = resolvedDate;
                    session.sessionVariables['date'] = resolvedDate;
                    session.sessionVariables['contact.appointment_date'] = resolvedDate;
                  }
                  if (resolvedTime) {
                    session.sessionVariables['selected_time'] = resolvedTime;
                    session.sessionVariables['appointment_time'] = resolvedTime;
                    session.sessionVariables['time'] = resolvedTime;
                    session.sessionVariables['contact.appointment_time'] = resolvedTime;
                  }
                  session.sessionVariables['selected_slot'] = resolvedSlot;
                  session.sessionVariables['appointment_slot'] = resolvedSlot;
                  session.sessionVariables['slot'] = resolvedSlot;
                  if (resolvedDate && resolvedTime) {
                    session.sessionVariables['datetime'] = `${resolvedDate} at ${resolvedTime}`;
                  } else {
                    session.sessionVariables['datetime'] = resolvedSlot;
                  }

                  if (currentNode.data?.saveVariableAs) {
                    session.sessionVariables[currentNode.data.saveVariableAs] = matchedRow.postbackId || matchedRow.id || rowTitle;
                  }
                  session.markModified('sessionVariables');

                  // 1. Precise handle match (row-id, row-idx, row-title, or raw id/index)
                  matchedEdge = outgoingEdges.find(e => {
                    const sh = (e.sourceHandle || '').toLowerCase().trim();
                    if (!sh) return false;
                    const cleanRowId = rowId.toLowerCase().trim();
                    const cleanTitle = rowTitle.toLowerCase().trim();
                    const strippedSh = sh.replace(/^row-/, '').replace(/^row_/, '').trim();
                    const strippedRowId = cleanRowId.replace(/^row-/, '').replace(/^row_/, '').trim();
                    const fallbackRowId = matchedRow.id ? String(matchedRow.id).toLowerCase().trim() : '';

                    return (
                      sh === `row-${cleanRowId}` ||
                      (fallbackRowId && sh === `row-${fallbackRowId}`) ||
                      sh === `row-${matchedRowIdx}` ||
                      sh === `row-${matchedSecIdx}_${matchedRowIdx}` ||
                      sh === `row-${cleanTitle}` ||
                      sh === cleanRowId ||
                      sh === cleanTitle ||
                      sh === String(matchedRowIdx) ||
                      strippedSh === strippedRowId ||
                      candidateInputs.some(ci => {
                        const cleanCi = ci.toLowerCase().trim().replace(/^row_/, '');
                        return sh === `row-${ci}` || sh === ci || strippedSh === cleanCi;
                      })
                    );
                  });


                  console.log('[DEBUG-MENU] matchedRow:', matchedRow?.title, 'matchedRowIdx:', matchedRowIdx);
                  console.log('[DEBUG-MENU] rowId:', rowId, 'outgoingEdges.length:', outgoingEdges.length);
                  console.log('[DEBUG-MENU] outgoingEdges:', JSON.stringify(outgoingEdges.map(e => ({ sourceHandle: e.sourceHandle, target: e.target }))));
                  console.log('[DEBUG-MENU] matchedEdge after precise check:', matchedEdge?.target);

                  // 2. Positional match (if user wired option row index to edge index)
                  if (!matchedEdge && outgoingEdges[matchedRowIdx]) {
                    const indexedEdge = outgoingEdges[matchedRowIdx];
                    if (indexedEdge.sourceHandle?.startsWith('row-') || !indexedEdge.sourceHandle) {
                      matchedEdge = indexedEdge;
                    }
                  }
                }

                // 3. Fallback direct edge matching candidateInputs
                if (!matchedEdge && outgoingEdges.length > 0) {
                  matchedEdge = outgoingEdges.find(e => {
                    const sh = (e.sourceHandle || '').toLowerCase().trim();
                    if (!sh || sh === 'main-handle') return false;
                    const stripped = sh.replace(/^row-/, '').replace(/^row_/, '').trim();
                    return candidateInputs.some(ci => {
                      const cleanCi = ci.toLowerCase().trim().replace(/^row_/, '');
                      return sh === ci || sh === `row-${ci}` || stripped === cleanCi || sh.includes(cleanCi) || cleanCi.includes(stripped);
                    });
                  });
                  if (matchedEdge) isExplicitChoiceRecognized = true;
                }
             } else if (currentNode.type === 'pollNode' && currentNode.data?.options) {
                const optIdx = currentNode.data.options.findIndex((opt, idx) => {
                  const optCandidates = [
                    opt.text?.trim().toLowerCase(),
                    opt.id?.toString().trim().toLowerCase(),
                    String(idx),
                    String(idx + 1),
                    `opt-${idx}`,
                    `opt-${idx + 1}`,
                    `option ${idx + 1}`,
                    `opt ${idx + 1}`,
                    `opt-${opt.text?.trim().toLowerCase()}`
                  ].filter(Boolean);
                  return candidateInputs.some(ci => {
                    const cleanCi = ci.toLowerCase().trim();
                    const strippedCi = cleanCi.replace(/^opt-/, '');
                    return optCandidates.includes(cleanCi) || 
                           optCandidates.includes(strippedCi) ||
                           optCandidates.some(oc => oc.replace(/^opt-/, '') === strippedCi);
                  });
                });

                if (optIdx !== -1) {
                  isExplicitChoiceRecognized = true;
                  const opt = currentNode.data.options[optIdx];
                  const optText = (opt?.text || '').toLowerCase().trim();
                  
                  session.sessionVariables['selected_poll_option'] = opt.text;
                  session.sessionVariables['selected_option'] = opt.text;
                  if (currentNode.data?.saveVariableAs) {
                    session.sessionVariables[currentNode.data.saveVariableAs] = opt.id || opt.text;
                  }
                  session.markModified('sessionVariables');

                  matchedEdge = outgoingEdges.find(e => {
                    const sh = (e.sourceHandle || '').toLowerCase().trim();
                    const strippedSh = sh.replace(/^opt-/, '');
                    return (
                      sh === `opt-${optIdx}` || 
                      sh === `${optIdx}` || 
                      sh === `opt-${optText}` || 
                      sh === optText ||
                      strippedSh === String(optIdx) ||
                      strippedSh === optText ||
                      (opt.id && (sh === `opt-${opt.id}` || sh === String(opt.id) || strippedSh === String(opt.id).toLowerCase()))
                    );
                  });
                  if (!matchedEdge && outgoingEdges[optIdx]) {
                    matchedEdge = outgoingEdges[optIdx];
                  }
                }
              } else if (['catalogNode', 'commerceNode', 'carouselNode'].includes(currentNode?.type)) {
                // If customer responds after viewing catalog, carousel, or payment link, advance via main-handle
                isExplicitChoiceRecognized = true;
                if (currentNode.data?.saveVariableAs) {
                  session.sessionVariables[currentNode.data.saveVariableAs] = incomingPayload;
                  session.markModified('sessionVariables');
                }
                matchedEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle' || !e.sourceHandle) || outgoingEdges[0];
             }
          }

          // 1. Check if flow designer connected to the 'main-handle' (Next step fallback)
          if (!matchedEdge) {
            matchedEdge = outgoingEdges.find(e => e.sourceHandle === 'main-handle');
          }

          // 2. Generic edge without specific handle ('default', null, undefined, or empty)
          if (!matchedEdge) {
            matchedEdge = outgoingEdges.find(e => !e.sourceHandle || e.sourceHandle === 'default' || e.sourceHandle === '');
          }

          // 3. Fallback to a single outgoing edge: If node has only 1 connected edge, any valid interaction MUST advance through it!
          if (!matchedEdge && outgoingEdges.length === 1) {
            matchedEdge = outgoingEdges[0];
          }

          // 4. Fallback if an explicit choice was recognized or button tapped, and connected outgoing edges exist:
          // Advance via first available non-timeout edge
          if (!matchedEdge && (isExplicitChoiceRecognized || isButtonTap) && outgoingEdges.length > 0) {
            const nonTimeout = outgoingEdges.find(e => e.sourceHandle !== 'timeout');
            matchedEdge = nonTimeout || outgoingEdges[0];
            logger.log(`[FlowRunner] Choice '${incomingPayload}' on ${currentNode?.type} matched via fallback edge to target: ${matchedEdge?.target}`);
          }

          // 5. Leaf terminal node (only if no outgoing edges exist at all)
          if (isExplicitChoiceRecognized && !matchedEdge && outgoingEdges.length === 0) {
            logger.log(`[FlowRunner] Choice '${incomingPayload}' on leaf node ${currentNode?.id} has no connected outgoing edges. Completing session.`);
            await markSessionCompleted(session, customerPhone, channelId);
            return;
          }
          
          if (matchedEdge) {
            logger.log(`[DEBUG Engine] Matched edge to target: ${matchedEdge.target}`);
            nextNodeId = matchedEdge.target;
            session.validationRetries = 0;
            await session.save();

            // Cancel any pending timeout jobs since user interacted
            try {
              const { default: DelayedJob } = await import('../models/DelayedJob.js');
              await DelayedJob.updateMany({ customerPhone, status: 'PENDING' }, { $set: { status: 'CANCELLED' } });
            } catch (_) {}
          } else {
            // User typed text instead of clicking a button, or clicked unrouted option
            session.validationRetries = (session.validationRetries || 0) + 1;
            await session.save();

            let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
            if (!channelToUse) channelToUse = channel;

            // If user repeatedly fails to select an option (3 attempts), end the session gracefully
            if (session.validationRetries >= 3) {
              logger.log(`[FlowRunner] User ${customerPhone} repeatedly failed interactive choice. Ending session.`);
              await markSessionCompleted(session, customerPhone, channelId);
              await sendWhatsAppMessage(customerPhone, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: customerPhone,
                type: 'text',
                text: { body: 'Session ended due to repeated invalid inputs. You can type *hi* anytime to start again.' }
              }, channelToUse);
              return;
            }

            let optionsPrompt = '⚠️ Please select one of the available options above, or type *restart* to start over.';
            if ((currentNode.type === 'interactiveNode' || currentNode.type === 'messageNode') && Array.isArray(currentNode.data?.buttons) && currentNode.data.buttons.length > 0) {
              const btnList = currentNode.data.buttons.map((b, i) => `${i + 1}. ${b.text || b.title || b.payload}`).filter(Boolean).join('\n');
              optionsPrompt = `⚠️ Invalid selection. Please tap one of the buttons or reply with the option number:\n\n${btnList}\n\n(or type *restart* to start over)`;
            } else if (currentNode.type === 'pollNode' && Array.isArray(currentNode.data?.options) && currentNode.data.options.length > 0) {
              const pollList = currentNode.data.options.map((o, i) => `${i + 1}. ${o.text}`).filter(Boolean).join('\n');
              optionsPrompt = `⚠️ Invalid selection. Please choose from:\n\n${pollList}\n\n(or type *restart* to start over)`;
            } else if (currentNode.type === 'menuNode' && Array.isArray(currentNode.data?.sections) && currentNode.data.sections.length > 0) {
              const rowList = currentNode.data.sections.flatMap(s => (s.rows || []).map((r, i) => `${i + 1}. ${r.title}`)).filter(Boolean).slice(0, 5).join('\n');
              if (rowList) {
                optionsPrompt = `⚠️ Invalid option. Please select from the menu list or reply with the number:\n\n${rowList}\n\n(or type *restart* to start over)`;
              }
            }

            await sendWhatsAppMessage(customerPhone, {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: customerPhone,
              type: 'text',
              text: { body: optionsPrompt }
            }, channelToUse);
            return; // Halt execution and wait for valid input
          }
        } else {
          // For other nodes waiting for events, fallback to the default edge
          const matchedEdge = outgoingEdges.find(e => e.sourceHandle === incomingPayload) || 
                              outgoingEdges.find(e => e.sourceHandle === 'main-handle') ||
                              outgoingEdges.find(e => !e.sourceHandle || e.sourceHandle !== 'timeout') ||
                              outgoingEdges[0];
          if (matchedEdge) nextNodeId = matchedEdge.target;
        }

        if (!nextNodeId) {
          logger.warn(`[FlowRunner] No next node resolved for incoming input '${incomingPayload}' from ${customerPhone}.`);
          let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
          if (!channelToUse) channelToUse = channel;

          session.validationRetries = (session.validationRetries || 0) + 1;
          await session.save();

          if (session.validationRetries >= 3) {
            await sendWhatsAppMessage(customerPhone, {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: customerPhone,
              type: 'text',
              text: { body: 'Too many invalid attempts. Session ended. You can type *hi* anytime to start over.' }
            }, channelToUse);
            await markSessionCompleted(session, customerPhone, channelId);
            return;
          }

          await sendWhatsAppMessage(customerPhone, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: '⚠️ I did not understand that response. Please reply with a valid option, or type *restart* to restart.' }
          }, channelToUse);
          return;
        }
      }
    }

    // 3. Delegate to the recursive node processor
    const effectiveChannelId = channel._id ? channel._id.toString() : channelId;
    await processSpecificNode(customerPhone, effectiveChannelId, nextNodeId);

  } catch (error) {
    logger.error('Workflow Entry Error:', error);
    try {
      let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
      if (!channelToUse) channelToUse = channel;
      await sendWhatsAppMessage(customerPhone, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: customerPhone,
        type: 'text',
        text: { body: '⚠️ An unexpected error occurred. Please type *restart* to start over.' }
      }, channelToUse);
    } catch (_) {}
  }
}

/**
 * Manually injects a customer into a specific flow, bypassing trigger keyword logic.
 * Useful for API Webhooks, CRM Events, and Scheduled executions.
 */
export async function startFlowManually(customerPhone, channelId, flowId, eventData = {}) {
  try {
    const isSim = typeof customerPhone === 'string' && customerPhone.startsWith('SIMULATOR_');
    const activeFlow = await Automation.findById(flowId);
    if (!activeFlow) {
      logger.warn(`Flow ${flowId} not found. Cannot start manually.`);
      return;
    }
    if (!isSim && !activeFlow.isActive && !['active', 'published', 'enabled'].includes(activeFlow.status)) {
      logger.warn(`Flow ${flowId} is inactive. Cannot start manually.`);
      return;
    }

    const effectiveChannelId = channelId || activeFlow.channelId?.toString() || activeFlow.tenantId?.toString();

    // Find root node: prioritize triggerNode/eventTriggerNode if present, otherwise find node with no incoming edges (e.g. templateNode)
    let rootNode = activeFlow.nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
    if (!rootNode) {
      // Find node with no incoming edges
      rootNode = activeFlow.nodes.find(n => !activeFlow.edges.some(e => e.target === n.id)) || activeFlow.nodes[0];
    }

    if (!rootNode) {
      logger.warn(`Flow ${flowId} has no nodes.`);
      return;
    }

    const isTriggerType = ['triggerNode', 'eventTriggerNode'].includes(rootNode.type);
    let startNodeId = null;

    if (isTriggerType) {
      // For trigger nodes, start from their outgoing target node
      const outgoingEdges = activeFlow.edges.filter(e => e.source === rootNode.id);
      startNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;
      if (!startNodeId) {
        logger.warn(`Flow ${flowId} trigger node is not connected to anything.`);
        return;
      }
    } else {
      // For non-trigger root nodes (e.g. templateNode when starting with template), execute rootNode directly!
      startNodeId = rootNode.id;
    }

    // Terminate any existing active/waiting session for this user to restart them in the new flow
    await CustomerSession.updateMany(
      { phone: customerPhone, status: { $in: ['ACTIVE', 'WAITING_FOR_INPUT', 'WAITING_FOR_EVENT', 'PAUSED'] } },
      { $set: { status: 'COMPLETED' } }
    );

    // Initialize a new session
    const session = new CustomerSession({
      phone: customerPhone,
      channelId: effectiveChannelId,
      activeFlowId: activeFlow._id,
      currentNodeId: rootNode.id,
      sessionVariables: eventData
    });
    await session.save();

    // Begin execution
    await processSpecificNode(customerPhone, effectiveChannelId, startNodeId);

  } catch (error) {
    logger.error('Error in startFlowManually:', error);
  }
}

/**
 * Programmatically triggers a flow based on a CRM backend event (e.g. tag added)
 */
export async function triggerAutomationFromEvent(contact, triggerType, triggerValue) {
  try {
    let activeFlow;

    // Check global TenantSettings for dynamic Welcome Message routing
    if (triggerType === 'NEW_CONTACT') {
      const settings = await TenantSettings.findOne({ tenantId: contact.tenantId });
      if (settings && settings.welcomeMessage && settings.welcomeMessage.enabled && settings.welcomeMessage.automationId) {
        activeFlow = await Automation.findOne({
          _id: settings.welcomeMessage.automationId,
          channelId: contact.channelId,
          isActive: true
        });
      }
    }

    // Fallback to static trigger matching if no dynamic global rule was matched
    if (!activeFlow) {
      activeFlow = await Automation.findOne({
        channelId: contact.channelId,
        isActive: true,
        'triggers.type': triggerType,
        'triggers.value': triggerValue
      });
    }

    if (!activeFlow) return;

    // Seed variables from CRM
    const eventData = {};
    if (contact.customFields) {
      if (typeof contact.customFields.entries === 'function') {
        for (const [key, val] of contact.customFields.entries()) {
          eventData[key] = val;
          eventData[`contact.${key}`] = val;
        }
      } else if (Array.isArray(contact.customFields)) {
        for (const field of contact.customFields) {
          const k = field.key || field.name;
          if (k) {
            eventData[k] = field.value;
            eventData[`contact.${k}`] = field.value;
          }
        }
      } else if (typeof contact.customFields === 'object') {
        for (const [key, val] of Object.entries(contact.customFields)) {
          eventData[key] = val;
          eventData[`contact.${key}`] = val;
        }
      }
    }
    if (contact.name) {
      eventData['name'] = contact.name;
      eventData['contact.name'] = contact.name;
    }
    if (contact.phone) {
      eventData['phone'] = contact.phone;
      eventData['contact.phone'] = contact.phone;
    }

    await startFlowManually(contact.phone, contact.channelId, activeFlow._id, eventData);
  } catch (error) {
    logger.error('Error triggering automation from event:', error);
  }
}

