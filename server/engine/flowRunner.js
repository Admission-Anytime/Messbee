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

async function markSessionCompleted(session, customerPhone, channelId) {
  session.status = 'COMPLETED';
  await session.save();
  try {
    const contact = await Contact.findOne({ phone: customerPhone, channelId });
    if (contact) {
      for (let [key, value] of session.sessionVariables.entries()) {
        contact.customFields.set(key, value);
      }
      
      // Sync tags
      if (session.tags && session.tags.length > 0) {
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
          const payload = {
            event: 'flow_completed',
            phone: contact.phone,
            name: contact.name,
            tags: contact.tags,
            customFields: Object.fromEntries(contact.customFields),
            sessionVariables: Object.fromEntries(session.sessionVariables)
          };
          await axios.post(settings.crmSync.webhookUrl, payload, { timeout: 5000 }).catch(e => console.error('CRM Webhook Post error:', e.message));
        }
      } catch (err) {
        console.error('Failed to execute CRM sync:', err.message);
      }
    }
  } catch(e) {
    console.error('Failed to sync CRM fields:', e);
  }
}

export async function sendWhatsAppMessage(toPhone, payload, channel, forceBypassOptOut = false) {
  try {
    // ---- SIMULATOR INTERCEPTION ----
    if (toPhone.startsWith('SIMULATOR_')) {
      console.log(`[SIMULATOR] Intercepted outbound message to ${toPhone}`);
      const io = getIO();
      if (io) {
        io.to(channel._id.toString()).emit('simulator_message', { 
          direction: 'OUTBOUND', 
          payload,
          timestamp: new Date()
        });
      }
      return null;
    }
    // --------------------------------

    const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v20.0'}/${channel.activeWhatsappPhoneNumberId}/messages`;

    // 1. Meta Opt-Out Compliance Check
    const contact = await Contact.findOne({ phone: toPhone, tenantId: channel.tenantId });
    if (!forceBypassOptOut) {
      if (contact && contact.isOptedOut) {
        console.log(`[Compliance] Blocked outbound message to ${toPhone} because they are opted out.`);
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
          console.log(`[Delivery Rules] Blocked message to ${toPhone} due to Quiet Hours (${settings.deliveryRules.quietHoursStart} - ${settings.deliveryRules.quietHoursEnd})`);
          return null; // Don't send the message
        }
      }
    } catch (e) {
      console.error('Error checking delivery rules:', e.message);
    }

    // 2. 24-Hour Rule Compliance (Meta blocks non-templates after 24h)
    if (payload.type !== 'template' && contact && contact.lastInteractionAt) {
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const timeSinceInteraction = Date.now() - new Date(contact.lastInteractionAt).getTime();
      if (timeSinceInteraction > TWENTY_FOUR_HOURS) {
        console.warn(`[Compliance] Blocked free-form message to ${toPhone}. Last interaction > 24h ago.`);
        return null;
      }
    }

    let metaMessageId = null;

    if (toPhone.startsWith('SIMULATOR_')) {
      console.log(`\n[SIMULATION MODE] Intercepted message to ${toPhone}:`);
      console.log(JSON.stringify(payload, null, 2));
      
      const io = getIO();
      if (io) {
        io.to(channel._id.toString()).emit('simulator_message', {
          direction: 'OUTBOUND',
          payload: payload,
          timestamp: new Date()
        });
        console.log(`[SIMULATOR] Emitted simulator_message to room ${channel._id.toString()}`);
      } else {
        console.warn('[SIMULATOR] Socket.io not initialized, cannot send simulator message to frontend');
      }
      
      metaMessageId = `sim_${Date.now()}`;
    } else {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${channel.metaAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Log the outbound message inside Inbox/Contact
      metaMessageId = response.data?.messages?.[0]?.id || null;
    }

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

  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
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

  const { messageType, text, mediaUrl, interactiveButtons, buttons, headerType, headerText } = nodeData;
  const parsedText = parseDynamicVariables(text, contextData);
  const btns = buttons || interactiveButtons || [];

  if (messageType === 'text') {
    return {
      ...basePayload,
      type: 'text',
      text: { body: parsedText || ' ' }
    };
  }

  if (messageType === 'interactive') {
    if (btns.length === 0) {
      return { ...basePayload, type: 'text', text: { body: parsedText || 'Please configure buttons.' } };
    }
    const interactive = {
      type: 'button',
      body: { text: parsedText || 'Select an option' },
      action: {
        buttons: btns.slice(0, 3).map(btn => ({
          type: 'reply',
          reply: { 
            id: parseDynamicVariables(btn.id, contextData) || btn.id || 'btn', 
            title: parseDynamicVariables(btn.title, contextData) || 'Button'
          }
        }))
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

  if (messageType === 'menu') {
    const validSections = (nodeData.sections || []).filter(sec => sec.rows && sec.rows.length > 0);
    if (validSections.length === 0) {
      return { ...basePayload, type: 'text', text: { body: parsedText || 'Please configure menu options.' } };
    }
    return {
      ...basePayload,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: nodeData.headerType && nodeData.headerText ? { type: 'text', text: parseDynamicVariables(nodeData.headerText, contextData) } : undefined,
        body: { text: parsedText || 'Please select an option' },
        footer: nodeData.footer ? { text: parseDynamicVariables(nodeData.footer, contextData) } : undefined,
        action: {
          button: parseDynamicVariables(nodeData.menuButtonText, contextData) || 'View Menu',
          sections: validSections.map(sec => ({
            title: parseDynamicVariables(sec.title, contextData) || 'Options',
            rows: (sec.rows || []).slice(0, 10).map(row => ({
              id: parseDynamicVariables(row.postbackId, contextData) || row.id || `row_${Date.now()}`,
              title: parseDynamicVariables(row.title, contextData) || 'Option',
              description: parseDynamicVariables(row.description, contextData) || undefined
            }))
          }))
        }
      }
    };
  }

  if (messageType === 'input') {
    return {
      ...basePayload,
      type: 'text',
      text: { body: parsedText }
    };
  }

  if (nodeType === 'mediaNode') {
    const parsedMediaUrl = parseDynamicVariables(nodeData.mediaUrl, contextData);
    if (!parsedMediaUrl) {
      return { ...basePayload, type: 'text', text: { body: 'Missing media URL.' } };
    }
    
    let metaType = nodeData.messageType || 'image';
    if (metaType === 'voice') metaType = 'audio';
    if (metaType === 'gif') metaType = 'video';

    const isAudioOrSticker = metaType === 'audio' || metaType === 'sticker';
    
    return {
      ...basePayload,
      type: metaType,
      [metaType]: {
        link: parsedMediaUrl,
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

    if (nodeData.variables && nodeData.variables.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters: nodeData.variables.map(v => ({
            type: 'text',
            text: parseDynamicVariables(v.value, contextData) || ' '
          }))
        }
      ];
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
      return {
        ...basePayload,
        type: 'contacts',
        contacts: [{
          name: { formatted_name: parseDynamicVariables(nodeData.contactName, contextData) || 'Contact' },
          phones: [{ phone: parseDynamicVariables(nodeData.contactPhone, contextData) || '0000000000' }]
        }]
      };
    } else if (nodeData.utilityType === 'calendar') {
      const eventName = parseDynamicVariables(nodeData.eventName, contextData) || 'Event';
      const eventTime = parseDynamicVariables(nodeData.eventTime, contextData) || 'TBA';
      return { ...basePayload, type: 'text', text: { body: `📅 *Calendar Invite:*\n${eventName}\n⏰ ${eventTime}` }};
    }
    return { ...basePayload, type: 'text', text: { body: `Utility message` }};
  }

  if (nodeType === 'catalogNode') {
    if (!nodeData.catalogId) {
      return { ...basePayload, type: 'text', text: { body: 'Missing Catalog ID configuration.' } };
    }
    return {
      ...basePayload,
      type: 'interactive',
      interactive: {
        type: nodeData.catalogType === 'single_product' ? 'product' : 'product_list',
        body: { text: parseDynamicVariables(nodeData.text, contextData) || 'Check out our products!' },
        action: {
          catalog_id: nodeData.catalogId,
          product_retailer_id: parseDynamicVariables(nodeData.productId, contextData) || 'product_1'
        }
      }
    };
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
        action: { buttons: [{ type: 'reply', reply: { id: `btn_${card.id || Date.now()}`, title: 'Select' } }] }
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
    const session = await CustomerSession.findOne({ phone: customerPhone, channelId, status: 'ACTIVE' });
    if (!session) return;

    const activeFlow = await Automation.findById(session.activeFlowId);
    if (!activeFlow) {
      session.status = 'FAILED';
      await session.save();
      return;
    }

    let channel = await Channel.findById(channelId).select('+metaAccessToken');

    if (!channel) {
      if (customerPhone.startsWith('SIMULATOR_')) {
        channel = { _id: channelId, tenantId: '000000000000000000000000', activeWhatsappPhoneNumberId: 'mock_phone' };
      } else {
        console.error(`[Error] Channel with ID ${channelId} not found in DB! Cannot process flow.`);
        return;
      }
    }
    const contact = await Contact.findOne({ phone: customerPhone, channelId });

    let currentNodeId = startNodeId;
    let keepRunning = true;
    let steps = 0;
    const MAX_STEPS = 30; // Prevent infinite loops from cyclic graphs

    const { default: TenantSettings } = await import('../models/TenantSettings.js');
    const tenantSettings = channel.tenantId ? await TenantSettings.findOne({ tenantId: channel.tenantId }).lean() : null;

    console.log(`[DEBUG Engine] processSpecificNode started for ${customerPhone} on node ${startNodeId}`);

    while (keepRunning && currentNodeId && steps < MAX_STEPS) {
      steps++;
      
      // Build a rich contextData combining CRM Contact Data and Session Variables
      const contextData = {
        contact: contact ? {
          id: contact._id.toString(),
          tenantId: contact.tenantId ? contact.tenantId.toString() : null,
          phone: contact.phone,
          name: contact.name || '',
          email: contact.email || '',
          tags: contact.tags || [],
          ...Object.fromEntries(contact.customFields || new Map())
        } : { phone: customerPhone, id: session._id },
        tenantSettings: tenantSettings || {},
        ...Object.fromEntries(session.sessionVariables)
      };
      
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

      console.log(`Executing node: ${currentNode.type} (${currentNode.id})`);
      
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
        console.error('Failed to emit debug event:', e);
      }
      
      // Determine the default next node by following an outgoing edge with no specific handle (e.g. text message output)
      const outgoingEdges = activeFlow.edges.filter(e => e.source === currentNodeId);
      let nextNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;

      // Handle specific node types
      if (['messageNode', 'interactiveNode', 'menuNode', 'inputNode', 'mediaNode', 'templateNode', 'utilityNode', 'reactionNode', 'catalogNode', 'pollNode', 'commerceNode', 'carouselNode'].includes(currentNode.type)) {
        const payload = buildMessagePayload(customerPhone, currentNode.type, currentNode.data, contextData);
        
        // Inject full template text for Simulator UI if it's a template node
        if (customerPhone.startsWith('SIMULATOR_') && currentNode.type === 'templateNode') {
          try {
            const { default: Template } = await import('../models/Template.js');
            const tmpl = await Template.findOne({ name: currentNode.data.templateName });
            if (tmpl) {
              const bodyComponent = tmpl.components.find(c => c.type === 'BODY');
              if (bodyComponent && bodyComponent.text) {
                payload._sim_template_text = bodyComponent.text;
              }
              
              const headerComponent = tmpl.components.find(c => c.type === 'HEADER');
              if (headerComponent && headerComponent.format === 'IMAGE') {
                let imgUrl = headerComponent.example?.header_url?.[0] || headerComponent.example?.header_handle?.[0];
                // If it's a Meta handle (not starting with http), provide a nice placeholder image for the simulator
                if (imgUrl && !imgUrl.startsWith('http')) {
                  imgUrl = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop'; // University / Generic aesthetic image
                }
                if (imgUrl) {
                  payload._sim_template_image = imgUrl;
                }
              }
            }
          } catch (e) {
            console.error('Failed to inject simulator template data:', e);
          }
        }
        
        try {
          await sendWhatsAppMessage(customerPhone, payload, channel);
        } catch (err) {
          console.error(`Failed to send message at node ${currentNode.id}, aborting flow. Exact Error:`, err);
          keepRunning = false;
          break;
        }

        let isBlockingNode = false;

        if (currentNode.type === 'inputNode') {
          session.status = 'WAITING_FOR_INPUT';
          session.expectedValidation = currentNode.data.validationType || 'text';
          session.saveVariableAs = currentNode.data.variableName || 'contact.custom_field';
          await session.save();
          isBlockingNode = true;
          keepRunning = false;
        } else if (currentNode.data.messageType === 'interactive' || currentNode.data.messageType === 'menu' || currentNode.type === 'catalogNode' || currentNode.type === 'pollNode' || (currentNode.type === 'commerceNode' && currentNode.data.commerceType === 'payment')) {
          // Interactive nodes block execution and wait for user reply
          isBlockingNode = true;
          keepRunning = false;
        } else {
          // Non-interactive text messages: implement a 500ms delay to respect rate limits
          // and prevent messages from arriving out of order.
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
        // Find the specific edge that matches the condition result (true_path or false_path)
        const conditionEdge = outgoingEdges.find(e => e.sourceHandle === handle);
        nextNodeId = conditionEdge ? conditionEdge.target : null;
      }
      else if (currentNode.type === 'apiNode') {
        const status = await executeApiCallNode(session, currentNode, contextData);
        const apiEdge = outgoingEdges.find(e => e.sourceHandle === status) || outgoingEdges[0];
        nextNodeId = apiEdge ? apiEdge.target : null;
      }
      else if (currentNode.type === 'actionNode') {
        const result = await executeActionNode(session, currentNode, contextData);
        const edge = outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'aiNode') {
        const result = await executeAiNode(session, currentNode, contextData);
        // Refresh context data with potentially new session variables
        for (const [k, v] of session.sessionVariables.entries()) {
          contextData[k] = v;
        }
        
        const edge = outgoingEdges.find(e => e.sourceHandle === `ai-${result}`) || outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'googleSheetsNode') {
        const status = await executeGoogleSheetsNode(session, currentNode, contextData);
        const edge = outgoingEdges.find(e => e.sourceHandle === status) || outgoingEdges[0];
        nextNodeId = edge ? edge.target : null;
      }
      else if (currentNode.type === 'randomizerNode') {
        const handle = await executeRandomizerNode(session, currentNode);
        const randEdge = outgoingEdges.find(e => e.sourceHandle === handle) || outgoingEdges[0];
        nextNodeId = randEdge ? randEdge.target : null;
      }
      else if (currentNode.type === 'shopifyNode') {
        const status = await executeShopifyNode(session, currentNode, contextData);
        const edge = outgoingEdges.find(e => e.sourceHandle === status) || outgoingEdges[0];
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

        if (nextNodeId) {
          await scheduleDelayedNode(customerPhone, channelId, nextNodeId, delayMs);
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
             const triggerNode = targetFlow.nodes.find(n => n.type === 'triggerNode') || targetFlow.nodes[0];
             if (triggerNode) {
               const targetEdges = targetFlow.edges.filter(e => e.source === triggerNode.id);
               const newNextNodeId = targetEdges.length > 0 ? targetEdges[0].target : null;
               
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
          await markSessionCompleted(session, customerPhone, channelId);
          keepRunning = false;
        }
      }
    }

    if (steps >= MAX_STEPS) {
      console.warn(`Maximum execution steps (${MAX_STEPS}) reached for session ${session._id}. Possible infinite loop detected.`);
    }

  } catch (error) {
    console.error('Error in processSpecificNode:', error);
  }
}

/**
 * Evaluates the incoming message against the current active flow or initiates a new one.
 */
export async function executeWorkflowStep(customerPhone, incomingPayload, channelId, referral = null, incomingMessageId = null, simulatorTargetFlowId = null, isNewContact = false) {
  try {
    let channel = await Channel.findById(channelId);

    if (!channel) {
      if (simulatorTargetFlowId || customerPhone.startsWith('SIMULATOR_')) {
        channel = { _id: channelId, tenantId: '000000000000000000000000', activeWhatsappPhoneNumberId: 'mock_phone' };
      } else {
        console.error(`[Error] Channel with ID ${channelId} not found in DB! Cannot process flow.`);
        return;
      }
    }

    let session = await CustomerSession.findOne({ phone: customerPhone, channelId, status: 'ACTIVE' });
    
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

    let activeFlow;
    let nextNodeId;

    if (!session) {
      let allActiveFlows = [];
      if (simulatorTargetFlowId) {
        const simFlow = await Automation.findById(simulatorTargetFlowId);
        if (simFlow) allActiveFlows = [simFlow];
      } else {
        allActiveFlows = await Automation.find({ channelId, isActive: true });
      }
      let matchedFlow = null;
      let matchedTriggerNode = null;

      const settings = await TenantSettings.findOne({ tenantId: channel.tenantId });
      
      // 0. WELCOME MESSAGE PRIORITY
      if (isNewContact && settings && settings.welcomeMessage && settings.welcomeMessage.enabled && settings.welcomeMessage.automationId) {
        const welcomeFlow = await Automation.findById(settings.welcomeMessage.automationId);
        if (welcomeFlow && welcomeFlow.isActive) {
          matchedFlow = welcomeFlow;
          matchedTriggerNode = welcomeFlow.nodes.find(n => n.type === 'triggerNode') || welcomeFlow.nodes[0];
        }
      }

      // 1. AWAY MESSAGE PRIORITY
      let isOutOfOffice = false;
      let configuredAwayAutomationId = null;

      if (!matchedFlow && settings && settings.awayMessage && settings.awayMessage.enabled) {
        configuredAwayAutomationId = settings.awayMessage.automationId;
        
        if (settings.awayMessage.holidayMode) {
          isOutOfOffice = true;
        } else {
          // Calculate time based on timezone
          const tz = settings.awayMessage.timezone || 'UTC';
          const nowStr = new Date().toLocaleString('en-US', { timeZone: tz, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
          const parts = nowStr.split(', ');
          const dayName = parts[0].toLowerCase(); // e.g. "monday"
          const timeStr = parts[1]; // e.g. "14:30"

          const dayConfig = settings.awayMessage.workingHours?.get(dayName);
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
      
      if (isOutOfOffice && !matchedFlow) {
        if (configuredAwayAutomationId) {
          const awayFlow = await Automation.findById(configuredAwayAutomationId);
          if (awayFlow && awayFlow.isActive) {
            matchedFlow = awayFlow;
            matchedTriggerNode = awayFlow.nodes.find(n => n.type === 'triggerNode') || awayFlow.nodes[0];
          }
        }
      }

      // 2. NORMAL TRIGGERS
      if (!matchedFlow) {
        const payloadText = incomingPayload.trim().toLowerCase();
        for (const flow of allActiveFlows) {
          const tNode = flow.nodes.find(n => n.type === 'triggerNode');
          if (tNode) {
            const matchType = tNode.data.triggerType || 'exact_match';
            const kw = (tNode.data.keyword || '').toLowerCase();
            
            let isMatch = false;

            // Text Triggers
            if (matchType === 'exact_match' && kw !== '') {
              const keywords = kw.split(',').map(k => k.trim());
              if (keywords.includes(payloadText)) isMatch = true;
            } else if (matchType === 'contains' && kw !== '') {
              const keywords = kw.split(',').map(k => k.trim());
              if (keywords.some(k => payloadText.includes(k))) isMatch = true;
            } else if (matchType === 'starts_with' && kw !== '') {
              const keywords = kw.split(',').map(k => k.trim());
              if (keywords.some(k => payloadText.startsWith(k))) isMatch = true;
            } else if (matchType === 'ends_with' && kw !== '') {
              const keywords = kw.split(',').map(k => k.trim());
              if (keywords.some(k => payloadText.endsWith(k))) isMatch = true;
            }
          
          // Media & Action Triggers
          else if (matchType === 'image_received' && payloadText === '[__media_image__]') isMatch = true;
          else if (matchType === 'video_received' && payloadText === '[__media_video__]') isMatch = true;
          else if (matchType === 'document_received' && payloadText === '[__media_document__]') isMatch = true;
          else if (matchType === 'voice_received' && payloadText === '[__media_audio__]') isMatch = true;
          else if (matchType === 'location_received' && payloadText === '[__media_location__]') isMatch = true;
          else if (matchType === 'contact_shared' && payloadText === '[__media_contact__]') isMatch = true;
          else if (matchType === 'reaction' && payloadText === '[__reaction__]') isMatch = true;
          else if (matchType === 'media_any' && ['[__media_image__]', '[__media_video__]', '[__media_document__]', '[__media_audio__]'].includes(payloadText)) isMatch = true;

          if (isMatch) {
            matchedFlow = flow;
            matchedTriggerNode = tNode;
            break;
          }
        }
      }
    }

      activeFlow = matchedFlow;
      let triggerNode = matchedTriggerNode;

      if (!activeFlow) {
        // Fallback: check dynamic settings first
        if (settings && settings.fallbackMessage && settings.fallbackMessage.enabled && settings.fallbackMessage.automationId) {
          activeFlow = await Automation.findById(settings.fallbackMessage.automationId);
          if (activeFlow && activeFlow.isActive) {
            triggerNode = activeFlow.nodes.find(n => n.type === 'triggerNode') || activeFlow.nodes[0];
          } else {
            activeFlow = null;
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
           console.log(`No flow triggered for payload: ${incomingPayload} and no fallback found.`);
        }
        return;
      }

      // Follow the trigger node's outgoing edge
      const outgoingEdges = activeFlow.edges.filter(e => e.source === triggerNode.id);
      nextNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;

      if (!nextNodeId) return;

      session = new CustomerSession({
        phone: customerPhone,
        channelId,
        activeFlowId: activeFlow._id,
        currentNodeId: triggerNode.id,
        referral: referral,
        lastIncomingMessageId: incomingMessageId
      });
      await session.save();
      
      // Start processing the nodes in the flow!
      await processSpecificNode(customerPhone, channelId, nextNodeId);
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
        console.log(`[FlowRunner] Resuming session ${session._id} from WAITING_FOR_EVENT`);
        session.status = 'ACTIVE';
        session.expectedEvent = null;
        await session.save();
        
        // Find the current wait node and move to the 'event_happened' edge
        const activeFlow = await Automation.findById(session.activeFlowId);
        if (activeFlow) {
          const waitEdge = activeFlow.edges.find(e => e.source === session.currentNodeId && e.sourceHandle === 'event_happened');
          if (waitEdge) {
            await processSpecificNode(customerPhone, channelId, waitEdge.target);
            return;
          }
        }
      }

      if (session.status === 'WAITING_FOR_INPUT') {
        // Validation Logic
        let isValid = true;
        const validationType = session.expectedValidation || 'text';
        
        if (validationType === 'email') {
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(incomingPayload);
        } else if (validationType === 'phone' || validationType === 'mobile') {
          isValid = /^\+?[\d\s-]{8,15}$/.test(incomingPayload);
        } else if (validationType === 'number') {
          isValid = !isNaN(incomingPayload) && incomingPayload.trim() !== '';
        } else if (validationType === 'date') {
          isValid = !isNaN(Date.parse(incomingPayload));
        } else if (validationType === 'url') {
          isValid = /^(https?:\/\/)?([\w\-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(incomingPayload);
        } else if (validationType === 'location') {
          isValid = incomingPayload.toLowerCase() === '[__media_location__]';
        } else if (validationType === 'photo') {
          isValid = incomingPayload.toLowerCase() === '[__media_image__]';
        } else if (validationType === 'audio') {
          isValid = incomingPayload.toLowerCase() === '[__media_audio__]';
        } else if (validationType === 'pdf') {
          isValid = incomingPayload.toLowerCase() === '[__media_document__]';
        } else if (validationType === 'address') {
          isValid = incomingPayload.trim().length > 5;
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
              text: { body: 'Too many invalid attempts. I am transferring you to a human agent for assistance.' }
            }, channelToUse);
            return;
          }

          // Stay on current node and send error message
          const currentNode = activeFlow.nodes.find(n => n.id === session.currentNodeId);
          const errorMsg = currentNode?.data?.validationErrorMessage || `Please provide a valid ${validationType}.`;
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

        // Process input answer
        const varName = session.saveVariableAs || 'custom_field';
        session.sessionVariables.set(varName, incomingPayload);
        session.status = 'ACTIVE';
        session.expectedValidation = null;
        session.saveVariableAs = null;
        session.validationRetries = 0; // Reset retries on success
        await session.save();

        const outgoingEdges = activeFlow.edges.filter(e => e.source === session.currentNodeId);
        nextNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;

        if (!nextNodeId) {
          await markSessionCompleted(session, customerPhone, channelId);
          return;
        }
      } else {
        const currentNode = activeFlow.nodes.find(n => n.id === session.currentNodeId);
        if (currentNode?.type === 'delayNode') {
          // If the flow is paused at a delay, ignore incoming messages for this flow.
          // The delay queue will resume execution when the timer finishes.
          console.log(`User ${customerPhone} sent a message during a delay node. Ignoring to preserve flow state.`);
          return;
        }

        // Move to the next node based on user's input (edges).
        const outgoingEdges = activeFlow.edges.filter(e => e.source === session.currentNodeId);
        nextNodeId = null;

        const isInteractiveNode = ['menuNode', 'catalogNode', 'pollNode', 'commerceNode'].includes(currentNode?.type) || 
                                  (currentNode?.type === 'messageNode' && currentNode?.data?.messageType === 'interactive') || 
                                  (currentNode?.type === 'interactiveNode');

        if (isInteractiveNode) {
          // For interactive nodes, the reply MUST match a specific button/list ID (sourceHandle)
          console.log(`[DEBUG Engine] Trying to match incomingPayload '${incomingPayload}' on node ${currentNode?.type}`);
          console.log(`[DEBUG Engine] Available edges for ${session.currentNodeId}:`, JSON.stringify(outgoingEdges));
          
          let matchedEdge = outgoingEdges.find(e => 
             e.sourceHandle === incomingPayload || 
             e.sourceHandle === `btn-${incomingPayload}` || 
             e.sourceHandle === `row-${incomingPayload}`
          );
          
          if (!matchedEdge && customerPhone.startsWith('SIMULATOR_')) {
             if ((currentNode.type === 'interactiveNode' || currentNode.type === 'messageNode') && currentNode.data?.buttons) {
                 const btnIdx = currentNode.data.buttons.findIndex(b => b.title && b.title.toLowerCase() === incomingPayload.toLowerCase());
                 if (btnIdx !== -1) {
                    const btnId = currentNode.data.buttons[btnIdx].id || btnIdx;
                    matchedEdge = outgoingEdges.find(e => e.sourceHandle === `btn-${btnId}`);
                 }
             } else if (currentNode.type === 'menuNode' && currentNode.data?.sections) {
                for (const sec of currentNode.data.sections) {
                   const rowIdx = (sec.rows || []).findIndex(r => r.title && r.title.toLowerCase() === incomingPayload.toLowerCase());
                   if (rowIdx !== -1) {
                      const rowId = sec.rows[rowIdx].id || rowIdx;
                      matchedEdge = outgoingEdges.find(e => e.sourceHandle === `row-${rowId}`);
                      break;
                   }
                }
             }
          }
          
          if (matchedEdge) {
            console.log(`[DEBUG Engine] Matched edge to target: ${matchedEdge.target}`);
            nextNodeId = matchedEdge.target;
          } else {
            // User typed text instead of clicking a button. Re-prompt them.
            let channelToUse = await Channel.findById(channelId).select('+metaAccessToken');
            if (!channelToUse) channelToUse = channel;
            await sendWhatsAppMessage(customerPhone, {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: customerPhone,
              type: 'text',
              text: { body: 'Please select an option from the menu above.' }
            }, channelToUse);
            return; // Halt execution and wait for valid input
          }
        } else {
          // For other nodes waiting for events, fallback to the default edge
          const matchedEdge = outgoingEdges.find(e => e.sourceHandle === incomingPayload) || outgoingEdges[0];
          if (matchedEdge) nextNodeId = matchedEdge.target;
        }

        if (!nextNodeId) {
          await markSessionCompleted(session, customerPhone, channelId);
          return;
        }
      }
    }

    // 3. Delegate to the recursive node processor
    await processSpecificNode(customerPhone, channelId, nextNodeId);

  } catch (error) {
    console.error('Workflow Entry Error:', error);
  }
}

/**
 * Manually injects a customer into a specific flow, bypassing trigger keyword logic.
 * Useful for API Webhooks, CRM Events, and Scheduled executions.
 */
export async function startFlowManually(customerPhone, channelId, flowId, eventData = {}) {
  try {
    const activeFlow = await Automation.findOne({ _id: flowId, channelId, isActive: true });
    if (!activeFlow) {
      console.warn(`Flow ${flowId} not found or inactive. Cannot start manually.`);
      return;
    }

    // Find the trigger node or the first node in the flow
    const triggerNode = activeFlow.nodes.find(n => n.type === 'triggerNode') || activeFlow.nodes[0];
    if (!triggerNode) {
      console.warn(`Flow ${flowId} has no nodes.`);
      return;
    }

    const outgoingEdges = activeFlow.edges.filter(e => e.source === triggerNode.id);
    const nextNodeId = outgoingEdges.length > 0 ? outgoingEdges[0].target : null;

    if (!nextNodeId) {
      console.warn(`Flow ${flowId} trigger node is not connected to anything.`);
      return;
    }

    // Terminate any existing active session for this user to restart them in the new flow
    await CustomerSession.updateMany(
      { phone: customerPhone, channelId, status: 'ACTIVE' },
      { $set: { status: 'COMPLETED' } }
    );

    // Initialize a new session
    const session = new CustomerSession({
      phone: customerPhone,
      channelId,
      activeFlowId: activeFlow._id,
      currentNodeId: triggerNode.id,
      sessionVariables: eventData
    });
    await session.save();

    // Begin execution
    await processSpecificNode(customerPhone, channelId, nextNodeId);

  } catch (error) {
    console.error('Error in startFlowManually:', error);
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
      for (const [key, val] of contact.customFields.entries()) {
        eventData[key] = val;
      }
    }

    await startFlowManually(contact.phone, contact.channelId, activeFlow._id, eventData);
  } catch (error) {
    console.error('Error triggering automation from event:', error);
  }
}

