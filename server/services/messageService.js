const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Chat = require('../models/Chat');
const whatsappService = require('./whatsappService');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const { getIO } = require('../config/socket');

const formatMessageTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const resolveContactPhone = (contact) => {
  const rawPhone = contact?.whatsapp || contact?.phone;
  return normalizePhoneNumber(rawPhone);
};

const buildTemplateComponents = (template, contact, campaign) => {
  const components = [];

  const templateComponents = Array.isArray(template?.components) ? template.components : [];
  const headerComponent = templateComponents.find(c => String(c?.type || '').toUpperCase() === 'HEADER');
  const headerFormat = String(headerComponent?.format || '').toUpperCase();
  const requiresMediaHeader = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerFormat);

  // Fallback to template's own example URL if campaign doesn't have it saved
  const fallbackMediaUrl = 
      headerComponent?.example?.header_handle?.[0] ||
      headerComponent?.example?.header_url?.[0] ||
      headerComponent?.example?.url?.[0] ||
      '';

  const resolvedMediaUrl = campaign?.headerMediaUrl || fallbackMediaUrl;

  // Add Header Component if template requires media and media URL is present
  if (requiresMediaHeader && resolvedMediaUrl) {
    let headerParamType = 'image';
    if (headerFormat === 'DOCUMENT') headerParamType = 'document';
    else if (headerFormat === 'VIDEO') headerParamType = 'video';
    
    components.push({
      type: 'header',
      parameters: [
        {
          type: headerParamType,
          [headerParamType]: {
            link: resolvedMediaUrl
          }
        }
      ]
    });
  }

  // Add Body Component
  const bodyParamCount = whatsappService.getBodyTemplateParamCount(template);
  if (bodyParamCount > 0) {
    const fallbackValue = contact?.name || campaign?.name || 'there';
    components.push({
      type: 'body',
      parameters: Array.from({ length: bodyParamCount }, (_value, index) => ({
        type: 'text',
        text: index === 0 ? (contact?.name || fallbackValue) : fallbackValue
      }))
    });
  }

  return components;
};

const findOrCreateChatForContact = async (contact) => {
  const normalizedPhone = resolveContactPhone(contact);

  if (!normalizedPhone) {
    throw new Error('Contact has no valid WhatsApp number');
  }

  let chat = await Chat.findOne({
    $or: [{ phone: normalizedPhone }, { whatsappId: normalizedPhone }]
  });

  if (!chat) {
    chat = await Chat.create({
      name: contact.name || normalizedPhone,
      phone: normalizedPhone,
      whatsappId: normalizedPhone,
      source: 'whatsapp',
      status: 'offline',
      chatStatus: 'open',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name || normalizedPhone)}&background=random`,
      teamMember: 'Unassigned',
      unread: 0,
      lastMsg: '',
      lastMsgTime: ''
    });
  }

  return { chat, normalizedPhone };
};

/**
 * Send message service
 */
exports.sendMessageToContact = async (userId, contactId, messageData) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, user: userId });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const { chat, normalizedPhone } = await findOrCreateChatForContact(contact);
    const text = messageData?.content || '';
    const messageType = messageData?.messageType || 'text';
    const msgTime = formatMessageTime();

    let status = 'sent';
    let whatsappMessageId;
    let error;

    if (messageType === 'text' && text.trim()) {
      const result = await whatsappService.sendTextMessage(normalizedPhone, text);
      if (result.success) {
        whatsappMessageId = result.messageId;
      } else {
        status = 'failed';
        error = JSON.stringify(result.error || { message: 'Unknown WhatsApp error' }).substring(0, 200);
      }
    }

    const message = await Message.create({
      chatId: chat._id,
      text,
      sender: 'me',
      time: msgTime,
      whatsappMessageId,
      messageType,
      mediaUrl: messageData?.mediaUrl,
      status,
      error
    });

    await Chat.findByIdAndUpdate(chat._id, {
      lastMsg: text,
      lastMsgTime: msgTime,
      lastActivity: new Date()
    });

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Send bulk messages (for campaigns)
 */
exports.sendBulkMessages = async (userId, campaignId, contacts, messageTemplate) => {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const messages = [];
    let sentCount = 0;
    let failedCount = 0;
    const templateName = String(messageTemplate || '').trim();
    const templateLanguage = campaign.templateLanguage || 'en_US';

    if (!templateName) {
      throw new Error('Campaign template name is required');
    }

    for (const contact of contacts) {
      try {
        const { chat, normalizedPhone } = await findOrCreateChatForContact(contact);
        const template = await whatsappService.findTemplate(templateName, templateLanguage);
        const components = buildTemplateComponents(template, contact, campaign);
        const msgTime = formatMessageTime();

        const sendResult = await whatsappService.sendTemplateMessage(
          normalizedPhone,
          templateName,
          templateLanguage,
          components
        );

        const isSent = Boolean(sendResult?.success);
        const message = await Message.create({
          chatId: chat._id,
          text: sendResult?.displayText || templateName,
          sender: 'me',
          time: msgTime,
          whatsappMessageId: sendResult?.messageId,
          messageType: 'template',
          templateName,
          templateLanguage,
          status: isSent ? 'sent' : 'failed',
          error: isSent
            ? undefined
            : JSON.stringify(sendResult?.error || { message: 'Unknown WhatsApp error' }).substring(0, 200),
          metadata: {
            campaignId: campaign._id.toString(),
            contactId: contact._id.toString(),
            components
          }
        });

        messages.push(message);

        if (isSent) {
          sentCount += 1;
          campaign.stats.sent += 1;

          await Chat.findByIdAndUpdate(chat._id, {
            lastMsg: sendResult?.displayText || templateName,
            lastMsgTime: msgTime,
            lastActivity: new Date()
          });
        } else {
          failedCount += 1;
          campaign.stats.failed += 1;
        }
      } catch (error) {
        failedCount += 1;
        campaign.stats.failed += 1;
        console.error(`Failed to send campaign message to ${contact?.whatsapp || contact?.phone || contact?._id}:`, error.message);
      }
    }

    await campaign.save();

    // Emit campaign update via socket to the user who owns it
    try {
      const io = getIO();
      if (io && campaign.user) {
        io.to(campaign.user.toString()).emit('campaign_stats_updated', {
          campaignId: campaign._id,
          stats: campaign.stats,
          status: campaign.status
        });
      }
    } catch (socketError) {
      console.error('❌ Socket emit error (bulk campaign):', socketError.message);
    }

    return {
      success: true,
      totalProcessed: contacts.length,
      totalSent: sentCount,
      failed: failedCount,
      messages
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread message count
 */
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      user: userId,
      sender: 'contact',
      status: { $ne: 'read' }
    });

    return count;
  } catch (error) {
    throw error;
  }
};
