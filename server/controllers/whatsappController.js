const whatsappService = require('../services/whatsappService');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');

const { getIO } = require('../config/socket');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const { hasActiveCustomerWindow } = require('../utils/conversationWindow');
const Template = require('../models/Template');
const { logAPICall, getRecentLogs } = require('../utils/apiLogger');
const { createAndEmitNotification } = require('../services/notificationService');
const automationService = require('../services/automationService');

/**
 * WhatsApp Webhook Controller
 * Handles incoming webhooks from WhatsApp Business API
 */

// @desc    Test WhatsApp API connection
// @route   GET /api/whatsapp/test-connection
// @access  Private
exports.testConnection = async (req, res, next) => {
  try {
    // Sync configuration from database first
    await whatsappService.syncConfig();

    // Validate configuration
    whatsappService.validateConfig();
    
    res.status(200).json({
      success: true,
      message: 'WhatsApp API configuration is valid',
      config: {
        phoneNumberId: whatsappService.phoneNumberId,
        hasAccessToken: !!whatsappService.accessToken,
        businessAccountId: whatsappService.businessAccountId,
        apiVersion: whatsappService.apiVersion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'WhatsApp API configuration error',
      error: error.message
    });
  }
};

// @desc    Connect via OAuth Token
// @route   POST /api/whatsapp/connect-oauth
// @access  Private
exports.connectOAuthToken = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'OAuth code is required' });
    }

    const axios = require('axios');
    
    // 1. Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${process.env.WHATSAPP_APP_ID}&client_secret=${process.env.WHATSAPP_APP_SECRET}&code=${code}`;
    let accessToken;
    try {
      const tokenRes = await axios.get(tokenUrl);
      accessToken = tokenRes.data.access_token;
    } catch (err) {
      console.error("Token exchange failed:", err.response?.data || err.message);
      return res.status(400).json({ success: false, message: 'Failed to exchange OAuth code' });
    }
    
    // 2. Fetch user info to verify token
    const userRes = await axios.get(`https://graph.facebook.com/v20.0/me?access_token=${accessToken}`);
    
    if (!userRes.data || !userRes.data.id) {
      return res.status(400).json({ success: false, message: 'Invalid Meta access token' });
    }
    
    let wabaId = null;
    try {
        // Attempt to auto-fetch the first WhatsApp Business Account ID associated with the user's businesses
        const bizRes = await axios.get(`https://graph.facebook.com/v20.0/me/businesses?access_token=${accessToken}`);
        if (bizRes.data && bizRes.data.data && bizRes.data.data.length > 0) {
            const bizId = bizRes.data.data[0].id;
            const wabaRes = await axios.get(`https://graph.facebook.com/v20.0/${bizId}/owned_whatsapp_business_accounts?access_token=${accessToken}`);
            if (wabaRes.data && wabaRes.data.data && wabaRes.data.data.length > 0) {
                wabaId = wabaRes.data.data[0].id;
            } else {
               // Also check client_whatsapp_business_accounts
               const clientWabaRes = await axios.get(`https://graph.facebook.com/v20.0/${bizId}/client_whatsapp_business_accounts?access_token=${accessToken}`);
               if (clientWabaRes.data && clientWabaRes.data.data && clientWabaRes.data.data.length > 0) {
                  wabaId = clientWabaRes.data.data[0].id;
               }
            }
        }
    } catch (e) {
        console.error("Could not auto-fetch WABA ID", e.response?.data || e.message);
    }

    const Setting = require('../models/Setting');
    
    // Save token and WABA ID to settings
    let setting = await Setting.findOne({ key: 'whatsapp_config' });
    if (!setting) {
        setting = new Setting({ key: 'whatsapp_config', value: {} });
    }
    
    setting.value = {
        ...setting.value,
        accessToken: accessToken,
        businessAccountId: wabaId || setting.value.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    };
    
    await setting.save();
    
    // Update service config in memory
    const whatsappService = require('../services/whatsappService');
    whatsappService.accessToken = accessToken;
    if (wabaId) whatsappService.businessAccountId = wabaId;

    res.status(200).json({
      success: true,
      message: 'WhatsApp account connected successfully',
      wabaId: wabaId,
      metaUserId: userRes.data.id
    });

  } catch (error) {
    console.error('OAuth Connection Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect WhatsApp account via OAuth',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

// @desc    Register WhatsApp Number
// @route   POST /api/whatsapp/register
// @access  Private
exports.registerNumber = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required to register the number'
      });
    }

    // Await the WhatsApp service registration
    const response = await whatsappService.register(pin);

    if (response.success) {
      res.status(200).json({
        success: true,
        message: 'Number registered successfully',
        data: response.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: response.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration process failed',
      error: error.message
    });
  }
};

// @desc    Deregister WhatsApp Number
// @route   POST /api/whatsapp/deregister
// @access  Private
exports.deregisterNumber = async (req, res, next) => {
  try {
    // Await the WhatsApp service deregistration
    const response = await whatsappService.deregister();

    if (response.success) {
      res.status(200).json({
        success: true,
        message: 'Number deregistered successfully',
        data: response.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Deregistration failed',
        error: response.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Deregistration process failed',
      error: error.message
    });
  }
};

// @desc    Get message delivery status from database
// @route   GET /api/whatsapp/message-status/:messageId
// @access  Private
exports.getMessageStatus = async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    
    // Find message by WhatsApp message ID or MongoDB ID
    const message = await Message.findOne({
      $or: [
        { whatsappMessageId: messageId },
        { _id: messageId }
      ]
    }).populate('chatId');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        messageId: message._id,
        whatsappMessageId: message.whatsappMessageId,
        text: message.text,
        status: message.status,
        statusTimestamp: message.statusTimestamp,
        createdAt: message.createdAt,
        chat: message.chatId ? {
          name: message.chatId.name,
          phone: message.chatId.phone
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message status',
      error: error.message
    });
  }
};

// @desc    Verify webhook (GET request from WhatsApp)
// @route   GET /api/whatsapp/webhook
// @access  Public
exports.verifyWebhook = async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  try {
    const Setting = require('../models/Setting');
    const setting = await Setting.findOne({ key: 'whatsapp_config' });
    const VERIFY_TOKEN = (setting && setting.value && setting.value.verifyToken) || 
                        process.env.WHATSAPP_VERIFY_TOKEN || 
                        'your_verify_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      res.status(200).send(challenge);
    } else {
      console.error('❌ Webhook verification failed');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    res.sendStatus(500);
  }
};

// @desc    Handle incoming WhatsApp messages and status updates
// @route   POST /api/whatsapp/webhook
// @access  Public (but should verify signature in production)
exports.handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && process.env.WHATSAPP_APP_SECRET) {
      const signature = req.headers['x-hub-signature-256'];
      const isValid = whatsappService.verifyWebhookSignature(
        signature,
        req.rawBody || JSON.stringify(req.body),
        process.env.WHATSAPP_APP_SECRET
      );
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return res.sendStatus(403);
      }
    }

    const webhookData = req.body;
    
    // Log incoming webhook for debugging
    console.log("📥 Received Webhook from Meta:", JSON.stringify(webhookData, null, 2));
    
    // Acknowledge immediately so WhatsApp does not retry while we process.
    res.sendStatus(200);

    setImmediate(async () => {
      try {
        const entries = Array.isArray(webhookData.entry) ? webhookData.entry : [];

        for (const entry of entries) {
          const changes = Array.isArray(entry?.changes) ? entry.changes : [];

          for (const change of changes) {
            const value = change?.value;
            if (!value) continue;

            if (Array.isArray(value.messages) && value.messages.length > 0) {
            }

            if (Array.isArray(value.statuses) && value.statuses.length > 0) {
            }

            const result = whatsappService.processWebhook({ entry: [{ changes: [change] }] });

            if (!result.success || !Array.isArray(result.results)) {
              continue;
            }

            for (const item of result.results) {
              if (item.type === 'message') {
                await handleIncomingMessage(item.data);
              }

              if (item.type === 'status') {
                await handleStatusUpdate(item.data);
              }
            }
          }
        }
      } catch (backgroundError) {
      }
    });
  } catch (error) {
    // Always return 200 to prevent WhatsApp from retrying
    res.sendStatus(200);
  }
};

/**
 * Process incoming WhatsApp message
 */
async function handleIncomingMessage(data) {
  try {
    const { from, contact, message, messageId, messageType, timestamp, phoneNumberId } = data;

    // Resolve Channel ID
    let resolvedChannelId = null;
    if (phoneNumberId) {
      const Channel = require('../models/Channel');
      const channelRecord = await Channel.findOne({ activeWhatsappPhoneNumberId: phoneNumberId });
      if (channelRecord) {
        resolvedChannelId = channelRecord._id.toString();
      }
    }

    if (!resolvedChannelId) {
      console.warn(`[Webhook] Ignored message for unknown phoneNumberId: ${phoneNumberId}`);
      return;
    }

    // Normalize the phone number
    const normalizedFrom = normalizePhoneNumber(from);
    const contactName = contact?.name || contact?.profile?.name || normalizedFrom;

    // Find or create chat (check both phone and whatsappId with normalized number)
    // We sort by 'user' desc to prefer chats that already have an owner assigned
    let chat = await Chat.findOne({ 
      $or: [
        { phone: normalizedFrom },
        { whatsappId: normalizedFrom },
        { phone: from },
        { whatsappId: from }
      ]
    }).sort({ user: -1 });

    if (!chat) {
      // Try to find if this contact belongs to any user in the CRM (Contact model)
      const crmContact = await Contact.findOne({ 
        $or: [
          { whatsapp: normalizedFrom },
          { phone: normalizedFrom },
          { whatsapp: from },
          { phone: from }
        ]
      }).sort({ updatedAt: -1 });

      const assignedUserId = crmContact ? crmContact.user : null;

      chat = await Chat.create({
        name: contactName,
        phone: normalizedFrom,
        status: 'active',
        chatStatus: 'open',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random`,
        teamMember: 'Unassigned',
        whatsappId: normalizedFrom,
        source: 'whatsapp',
        lastActivity: new Date(),
        user: assignedUserId // Link to the user who owns the contact in CRM
      });
      
      // Emit chat_created event
      try {
        const io = getIO();
        if (io) {
          io.emit('chat_created', chat);
        }
      } catch (socketError) {
      }
    } else {
      // If found chat has NO user assigned, but we find a CRM contact with a user, assign it
      if (!chat.user) {
        const crmContact = await Contact.findOne({ 
          $or: [
            { whatsapp: normalizedFrom },
            { phone: normalizedFrom }
          ]
        }).sort({ updatedAt: -1 });
        
        if (crmContact) {
          chat.user = crmContact.user;
        }
      }

      
      // Update with normalized phone if needed
      if (chat.phone !== normalizedFrom || chat.whatsappId !== normalizedFrom) {
        chat.phone = normalizedFrom;
        chat.whatsappId = normalizedFrom;
      }
      
      // Update chat status if it was closed
      if (chat.chatStatus === 'closed') {
        chat.chatStatus = 'open';
      }
      chat.status = 'active';
      chat.lastActivity = new Date();
      chat.lastInboundAt = new Date(parseInt(timestamp) * 1000);
      // Ensure whatsappId is set (for older chats)
      if (!chat.whatsappId) {
        chat.whatsappId = from;
      }
    }

    // Create message based on type
    let messageText = '';
    let lastMsgText = '';
    let mediaUrl = null;
    let mediaId = null;
    let mediaTypeStr = null;
    let caption = null;
    let fileName = null;
    let location = null;

    switch (messageType) {
      case 'text':
        messageText = message.text || '';
        lastMsgText = messageText;
        break;
        
      case 'image':
        caption = message.caption;
        messageText = caption || '';
        lastMsgText = caption || '📷 Image';
        mediaId = message.mediaId;
        mediaTypeStr = message.mimeType;
        
        // Optionally download and store media locally
        if (mediaId) {
          const mediaInfo = await whatsappService.getMediaUrl(mediaId);
          if (mediaInfo.success) {
            mediaUrl = mediaInfo.url;
          }
        }
        break;
        
      case 'video':
        caption = message.caption;
        messageText = caption || '';
        lastMsgText = caption || '🎥 Video';
        mediaId = message.mediaId;
        mediaTypeStr = message.mimeType;
        
        if (mediaId) {
          const mediaInfo = await whatsappService.getMediaUrl(mediaId);
          if (mediaInfo.success) {
            mediaUrl = mediaInfo.url;
          }
        }
        break;
        
      case 'audio':
        messageText = '';
        lastMsgText = '🎵 Audio message';
        mediaId = message.mediaId;
        mediaTypeStr = message.mimeType;
        
        if (mediaId) {
          const mediaInfo = await whatsappService.getMediaUrl(mediaId);
          if (mediaInfo.success) {
            mediaUrl = mediaInfo.url;
          }
        }
        break;
        
      case 'document':
        fileName = message.filename;
        caption = message.caption;
        messageText = caption || '';
        lastMsgText = fileName || caption || '📄 Document';
        mediaId = message.mediaId;
        mediaTypeStr = message.mimeType;
        
        if (mediaId) {
          const mediaInfo = await whatsappService.getMediaUrl(mediaId);
          if (mediaInfo.success) {
            mediaUrl = mediaInfo.url;
          }
        }
        break;
        
      case 'location':
        location = {
          latitude: message.latitude,
          longitude: message.longitude,
          name: message.name,
          address: message.address
        };
        messageText = caption || '';
        lastMsgText = `📍 ${message.name || message.address || 'Location'}`;
        break;
        
      case 'contacts':
        messageText = '';
        lastMsgText = '👤 Contact Card';
        break;
        
      case 'sticker':
        messageText = '';
        lastMsgText = '😊 Sticker';
        mediaId = message.mediaId;
        break;
        
      default:
        messageText = '';
        lastMsgText = 'Unsupported message type';
    }

    // Create message record
    const newMessage = await Message.create({
      chatId: chat._id,
      user: chat.user, // Associate message with chat's owner
      text: messageText,
      sender: 'them',
      time: new Date(parseInt(timestamp) * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }).toLowerCase(),
      whatsappMessageId: messageId,
      messageType: messageType,
      mediaUrl: mediaUrl,
      mediaId: mediaId,
      mediaType: mediaTypeStr,
      caption: caption,
      fileName: fileName,
      location: location,
      status: 'delivered'
    });

    // Update chat metadata
    chat.lastMsg = lastMsgText || messageText || '📎 Media';
    chat.lastMsgTime = newMessage.time;
    chat.unread = (chat.unread || 0) + 1;
    chat.lastInboundAt = new Date(parseInt(timestamp) * 1000);
    await chat.save();

    // Create notification for incoming message if chat has an owner
    if (chat.user) {
      await createAndEmitNotification(
        chat.user,
        'chat',
        `New message from ${contactName}`,
        lastMsgText || messageText || '📎 Media',
        {
          meta: [
            { label: 'From', value: contactName },
            { label: 'Type', value: messageType }
          ],
          relatedId: chat._id,
          data: {
            chatId: chat._id.toString(),
            messageId: newMessage._id.toString(),
            from: contactName,
            messageType: messageType
          }
        }
      );
    }

    // Emit to socket for real-time update
    try {
      const io = getIO();
      if (io) {
        io.emit('receive_message', {
          chatId: chat._id,
          message: newMessage,
          chat: chat
        });
        
        // Also emit chat list update
        io.emit('chat_updated', chat);
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError.message);
    }

    // Mark message as read on WhatsApp (optional - you may want to do this manually)
    // await whatsappService.markMessageAsRead(messageId);

    // 🚀 Trigger Automation Engine for all types of messages
    await automationService.processAutomationTrigger(
      'message',
      {
        message: messageText || lastMsgText, // Send text or media caption/fallback
        contactPhone: normalizedFrom,
        messageId: newMessage._id,
        messageType: messageType,
        mediaUrl: mediaUrl
      },
      resolvedChannelId // MUST pass channelId, not userId!
    );

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}

/**
 * Process message status update
 */
async function handleStatusUpdate(data) {
  try {
    const { messageId, status, timestamp, recipientId, errors } = data;

    const firstError = Array.isArray(errors) && errors.length > 0 ? errors[0] : null;
    const errorCode = firstError?.code;
    const errorMessage = firstError?.title || firstError?.message || firstError?.details || null;

    // First, find the message to know its previous status
    const message = await Message.findOne({ whatsappMessageId: messageId });

    if (!message) {
      console.warn(`⚠️  Message not found in database: ${messageId}`);
      return;
    }

    const oldStatus = message.status;
    const newStatus = status;

    // Update message status in database
    const updatePayload = {
      status: newStatus,
      statusTimestamp: new Date(parseInt(timestamp) * 1000)
    };

    if (newStatus === 'failed' && errorMessage) {
      updatePayload.error = errorCode ? `[${errorCode}] ${errorMessage}` : errorMessage;
    }

    const updatedMessage = await Message.findOneAndUpdate(
      { whatsappMessageId: messageId },
      updatePayload,
      { new: true }
    );

    // Check if this message belongs to a campaign and update stats
    const campaignId = updatedMessage.metadata?.campaignId || message.metadata?.campaignId;
    if (campaignId) {
      console.log(`📊 Message belongs to campaign: ${campaignId}. Processing status: ${newStatus} (from ${oldStatus})`);
      
      let incUpdate = {};
      let statsUpdated = false;

      // Ensure campaignId is a string for the query
      const campaignIdStr = String(campaignId);

      // Status transition logic for accuracy using $inc
      if (newStatus === 'delivered' && oldStatus !== 'delivered' && oldStatus !== 'read') {
        incUpdate['stats.delivered'] = 1;
        statsUpdated = true;
      } 
      else if (newStatus === 'read' && oldStatus !== 'read') {
        incUpdate['stats.read'] = 1;
        if (oldStatus !== 'delivered') {
          incUpdate['stats.delivered'] = 1;
        }
        statsUpdated = true;
      } 
      else if (newStatus === 'failed' && oldStatus !== 'failed') {
        incUpdate['stats.failed'] = 1;
        statsUpdated = true;
      }

      if (statsUpdated) {
        const updatedCampaign = await Campaign.findByIdAndUpdate(
          campaignIdStr,
          { $inc: incUpdate },
          { new: true }
        );

        if (updatedCampaign) {
          console.log(`✅ Campaign stats incremented for ${campaignIdStr}:`, incUpdate);
          
          // Emit campaign update via socket to the user who owns it
          try {
            const io = getIO();
            if (io && updatedCampaign.user) {
              const userId = updatedCampaign.user.toString();
              console.log(`📢 Emitting campaign_stats_updated to user ${userId} for campaign ${updatedCampaign._id}`);
              io.to(userId).emit('campaign_stats_updated', {
                campaignId: updatedCampaign._id,
                stats: updatedCampaign.stats,
                status: updatedCampaign.status
              });
            }
          } catch (socketError) {
            console.error('❌ Socket emit error (campaign):', socketError.message);
          }
        }
      } else {
        console.log(`ℹ️  No stat increment needed for campaign ${campaignId} (transition: ${oldStatus} -> ${newStatus})`);
      }
    }

    // Emit message status update to frontend (existing)
    try {
      const io = getIO();
      if (io) {
        io.emit('message_status_update', {
          messageId: updatedMessage._id,
          status: newStatus,
          whatsappMessageId: messageId,
          error: updatedMessage.error,
          errorCode: errorCode
        });
      }
    } catch (socketError) {
      console.error('❌ Socket emit error:', socketError.message);
    }
  } catch (error) {
    console.error('❌ Error handling status update:', error);
  }
}

// @desc    Send WhatsApp message from dashboard
// @route   POST /api/whatsapp/send
// @access  Private (add auth middleware)
exports.sendWhatsAppMessage = async (req, res, next) => {
  try {
    const { chatId, text, to } = req.body;

    // Log the incoming request
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send',
      userId: req.user?.id,
      userName: req.user?.name,
      requestBody: { chatId, text, to },
      headers: req.headers
    });

    if (!text || (!chatId && !to)) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send',
        userId: req.user?.id,
        statusCode: 400,
        errorMessage: 'Missing required fields: text and either chatId or to'
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find chat
    const chat = chatId ? await Chat.findById(chatId) : await Chat.findOne({ phone: to });

    if (!chat) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send',
        userId: req.user?.id,
        statusCode: 404,
        errorMessage: 'Chat not found'
      });
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const canSendFreeText = await hasActiveCustomerWindow(chat);
    if (!canSendFreeText) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send',
        userId: req.user?.id,
        statusCode: 500,
        errorMessage: '24-hour window expired'
      });
      return res.status(500).json({
        success: false,
        message: '24-hour window expired — the contact must message you first, then you can reply within 24 hours. Use an approved template message to initiate.',
        errorCode: 131047
      });
    }

    // Send via WhatsApp API
    const result = await whatsappService.sendTextMessage(chat.phone, text);

    if (!result.success) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send',
        userId: req.user?.id,
        statusCode: 500,
        responseStatus: 'FAILED',
        errorMessage: result.error,
        responseBody: result
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: result.error
      });
    }

    // Save message to database
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    const newMessage = await Message.create({
      chatId: chat._id,
      text: text,
      sender: 'me',
      time: time,
      whatsappMessageId: result.messageId,
      messageType: 'text',
      status: 'sent'
    });

    // Update chat metadata
    chat.lastMsg = text;
    chat.lastMsgTime = time;
    await chat.save();

    // Emit to socket
    try {
      const io = getIO();
      if (io) {
        io.emit('message_sent', {
          chatId: chat._id,
          message: newMessage,
          chat: chat
        });
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError.message);
    }

    // Log successful send
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send',
      userId: req.user?.id,
      statusCode: 200,
      responseStatus: 'SUCCESS',
      responseBody: { messageId: result.messageId, chatId: chat._id }
    });

    res.status(200).json({
      success: true,
      data: {
        message: newMessage,
        whatsappMessageId: result.messageId
      }
    });
  } catch (error) {
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send',
      userId: req.user?.id,
      statusCode: 500,
      errorMessage: error.message
    });
    next(error);
  }
};

// @desc    Send WhatsApp template message
// @route   POST /api/whatsapp/send-template
// @access  Private
exports.sendTemplateMessage = async (req, res, next) => {
  try {
    const {
      chatId,
      to,
      phoneNumber,
      templateName,
      languageCode,
      components = []
    } = req.body;

    // Log the incoming request
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send-template',
      userId: req.user?.id,
      userName: req.user?.name,
      requestBody: { chatId, templateName, languageCode, phoneNumber, to },
      headers: req.headers
    });

    if (!templateName) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send-template',
        userId: req.user?.id,
        statusCode: 400,
        errorMessage: 'Template name is required'
      });
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }

    let chat = null;
    let recipientPhone = '';

    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        logAPICall({
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/api/whatsapp/send-template',
          userId: req.user?.id,
          statusCode: 404,
          errorMessage: 'Chat not found'
        });
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      recipientPhone = normalizePhoneNumber(chat.phone || chat.whatsappId);
    } else {
      const rawPhone = to || phoneNumber;
      if (!rawPhone) {
        logAPICall({
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/api/whatsapp/send-template',
          userId: req.user?.id,
          statusCode: 400,
          errorMessage: 'Either chatId or recipient phone number is required'
        });
        return res.status(400).json({
          success: false,
          message: 'Either chatId or recipient phone number is required'
        });
      }

      recipientPhone = normalizePhoneNumber(rawPhone);
      if (!recipientPhone) {
        logAPICall({
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/api/whatsapp/send-template',
          userId: req.user?.id,
          statusCode: 400,
          errorMessage: 'Invalid recipient phone number'
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient phone number'
        });
      }

      chat = await Chat.findOne({
        $or: [
          { phone: recipientPhone },
          { whatsappId: recipientPhone }
        ]
      });

      if (!chat) {
        const displayName = recipientPhone;
        chat = await Chat.create({
          name: displayName,
          phone: recipientPhone,
          status: 'active',
          chatStatus: 'open',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
          teamMember: 'Unassigned',
          whatsappId: recipientPhone,
          source: 'whatsapp',
          lastActivity: new Date()
        });
      }
    }

    // Extract media info from components if present (to show in chat history)
    let mediaUrl = null;
    let mediaType = null;
    let fileName = null;

    if (Array.isArray(components)) {
      const headerComponent = components.find(c => String(c.type).toLowerCase() === 'header');
      if (headerComponent && Array.isArray(headerComponent.parameters) && headerComponent.parameters.length > 0) {
        const param = headerComponent.parameters[0];
        const pType = String(param.type).toLowerCase();
        
        if (['image', 'video', 'document'].includes(pType)) {
          mediaUrl = param[pType]?.link || param[pType]?.url;
          mediaType = pType;
          if (pType === 'document') {
            fileName = param.document?.filename || 'Document';
          }
        }
      }
    }

    // Fallback: Try to find template in database to get media URL if not in request
    if (!mediaUrl) {
      try {
        const Template = require('../models/Template');
        const dbTemplate = await Template.findOne({ name: templateName });
        if (dbTemplate && Array.isArray(dbTemplate.components)) {
          const headerComp = dbTemplate.components.find(c => String(c.type).toUpperCase() === 'HEADER');
          if (headerComp && headerComp.format && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp.format)) {
            mediaType = headerComp.format.toLowerCase();
            // Look for example URL in component
            if (headerComp.example && headerComp.example.header_handle) {
               // If it's a handle, we still can't show it directly, but maybe there's a link elsewhere
            }
            // Check if our own system stored a preview URL
            mediaUrl = headerComp.headerMediaUrl || headerComp.headerMediaUrlPreview;
          }
        }
      } catch (err) {
        console.error('Error fetching template for media fallback:', err.message);
      }
    }

    const result = await whatsappService.sendTemplateMessage(
      recipientPhone,
      templateName,
      languageCode,
      components
    );

    if (!result.success) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/send-template',
        userId: req.user?.id,
        statusCode: 500,
        responseStatus: 'FAILED',
        errorMessage: result.error,
        responseBody: result
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to send template',
        error: result.error
      });
    }

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    const newMessage = await Message.create({
      chatId: chat._id,
      text: result.displayText || `Template: ${templateName}`,
      sender: 'me',
      time,
      whatsappMessageId: result.messageId,
      messageType: 'template',
      templateName,
      templateLanguage: languageCode || 'en_US',
      mediaUrl,
      mediaType,
      fileName,
      metadata: {
        components
      },
      status: 'sent'
    });

    chat.phone = recipientPhone;
    chat.whatsappId = recipientPhone;
    chat.source = 'whatsapp';
    chat.status = 'active';
    chat.lastMsg = `Template: ${templateName}`;
    chat.lastMsgTime = time;
    chat.lastActivity = new Date();
    await chat.save();

    try {
      const io = getIO();
      if (io) {
        io.emit('message_sent', {
          chatId: chat._id,
          message: newMessage,
          chat
        });
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError.message);
    }

    // Log successful send
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send-template',
      userId: req.user?.id,
      statusCode: 200,
      responseStatus: 'SUCCESS',
      responseBody: { messageId: result.messageId, templateName, chatId: chat._id }
    });

    res.status(200).json({
      success: true,
      data: {
        message: newMessage,
        whatsappMessageId: result.messageId,
        chat
      }
    });
  } catch (error) {
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/send-template',
      userId: req.user?.id,
      statusCode: 500,
      errorMessage: error.message
    });
    next(error);
  }
};

// @desc    Get WhatsApp message templates
// @route   GET /api/whatsapp/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {

    
    const data = await whatsappService.getTemplates();
    const allTemplates = Array.isArray(data?.data) ? data.data : [];
    

    
    // Get templates owned by this user from our DB
    const userTemplates = await Template.find({ user: req.user.id });
    const userTemplatesMap = {};
    userTemplates.forEach(t => {
      userTemplatesMap[String(t.name).trim()] = t;
    });

    // Merge Graph API templates with local metadata (to restore media URLs)
    const filteredTemplates = allTemplates
      .map(t => {
        const localTemplate = userTemplatesMap[String(t.name).trim()] || {};
        
        // Deep merge components to restore 'example' fields that Meta often strips after approval
        const mergedComponents = (t.components || []).map(apiComp => {
          const localComp = (localTemplate.components || []).find(lc => lc.type === apiComp.type);
          
          if (localComp && localComp.example && (!apiComp.example || Object.keys(apiComp.example).length === 0)) {
            return { ...apiComp, example: localComp.example };
          }
          return apiComp;
        });

        return {
          ...t,
          components: mergedComponents,
          // Persist our local status if API status is missing
          status: t.status || localTemplate.status 
        };
      });

    const approvedTemplates = filteredTemplates.filter((template) => template.status === 'APPROVED');
    const nonApprovedTemplates = filteredTemplates.filter((template) => template.status !== 'APPROVED');
    
    res.status(200).json({
      success: true,
      data: { data: filteredTemplates },
      summary: {
        total: filteredTemplates.length,
        approved: approvedTemplates.length,
        nonApproved: nonApprovedTemplates.length
      },
      approvedTemplates,
      nonApprovedTemplates
    });
  } catch (error) {
    console.error('❌ [Server] Error in getTemplates controller:', error.message);
    
    // Fallback: If we can't reach WhatsApp, return the templates stored in our database
    try {
      const userTemplates = await Template.find({ user: req.user.id });
      
      const approvedTemplates = userTemplates.filter((template) => template.status === 'APPROVED');
      const nonApprovedTemplates = userTemplates.filter((template) => template.status !== 'APPROVED');

      return res.status(200).json({
        success: true,
        isOfflineFallback: true,
        message: 'Could not connect to WhatsApp API. Showing locally saved templates.',
        data: { data: userTemplates },
        summary: {
          total: userTemplates.length,
          approved: approvedTemplates.length,
          nonApproved: nonApprovedTemplates.length
        },
        approvedTemplates,
        nonApprovedTemplates
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server Error fetching templates',
        error: error.message
      });
    }
  }
};

// @desc    Create a new WhatsApp template
// @route   POST /api/whatsapp/templates
// @access  Private
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, category, language, components } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }

    const result = await whatsappService.createTemplate({
      name,
      category: category || 'MARKETING',
      language: language || 'en_US',
      components: components || []
    });

    if (!result.success) {
      const detailedMessage =
        result?.error?.message ||
        result?.error?.error?.message ||
        result?.error?.error_user_msg ||
        result?.error?.error?.error_user_msg ||
        result?.error?.error_data?.details ||
        result?.error?.error?.error_data?.details ||
        'Failed to create template';
      return res.status(400).json({
        success: false,
        message: detailedMessage,
        error: result.error
      });
    }

    // Save template ownership to our DB
    const templateName = result.templateName || name;
    await Template.create({
      name: templateName,
      whatsappTemplateId: result.data?.id,
      category: category || 'MARKETING',
      language: language || 'en_US',
      components: components || [],
      user: req.user.id,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: result.data,
      templateName: templateName,
      originalTemplateName: result.originalTemplateName || name,
      usedFallbackName: !!result.usedFallbackName
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get template details
// @route   GET /api/whatsapp/templates/:templateId
// @access  Private
exports.getTemplateDetails = async (req, res, next) => {
  try {
    const { templateId } = req.params;

    const result = await whatsappService.getTemplateDetails(templateId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test send a template message
// @route   POST /api/whatsapp/test-template
// @access  Private
exports.testSendTemplate = async (req, res, next) => {
  try {
    const { phoneNumber, templateName, languageCode, testData } = req.body;

    if (!phoneNumber || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and template name are required'
      });
    }

    const result = await whatsappService.testSendTemplate(
      phoneNumber,
      templateName,
      languageCode || 'en_US',
      testData || {}
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test template',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test template sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a template
// @route   DELETE /api/whatsapp/templates/:templateId
// @access  Private
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { templateName } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    if (!templateName) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required to delete a template'
      });
    }

    console.log('🗑️ [Controller] Attempting to delete template:', { templateId, templateName });
    const result = await whatsappService.deleteTemplate(templateId, templateName);

    // Check if this is a Meta permission error (code 100 - BSP/WABA ownership restriction)
    // In this case we soft-delete: remove from our local DB so it disappears from the UI
    const isMetaPermissionError =
      !result.success &&
      (result.error?.code === 100 ||
        (typeof result.error?.message === 'string' &&
          result.error.message.includes('Need permission on either WhatsApp Business Account')));

    if (!result.success && !isMetaPermissionError) {
      // A genuine failure (network error, invalid name, etc.) — surface it to the user
      console.error('❌ [Controller] Delete failed:', result.error);
      return res.status(400).json({
        success: false,
        message: 'Failed to delete template',
        error: result.error
      });
    }

    // Remove from local DB regardless (hard delete from Meta or soft delete)
    try {
      await Template.findOneAndDelete({ name: templateName, user: req.user.id });
      console.log('✅ [Controller] Template removed from local DB:', templateName);
    } catch (dbError) {
      console.warn('⚠️ [Controller] Could not remove template from local DB:', dbError.message);
    }

    if (isMetaPermissionError) {
      console.warn('⚠️ [Controller] Meta API rejected delete (permission), but template removed from local view.');
      return res.status(200).json({
        success: true,
        message: 'Template removed from your account. Note: It may still appear in WhatsApp Manager due to BSP permission restrictions — you can delete it directly from Meta Business Manager.',
        softDeleted: true
      });
    }

    console.log('✅ [Controller] Template deleted successfully from WhatsApp + local DB:', templateName);
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ [Controller] Delete template error:', error.message);
    next(error);
  }
};


// @desc    Update template
// @route   PUT /api/whatsapp/templates/:templateId
// @access  Private
exports.updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const updateData = req.body;

    const result = await whatsappService.updateTemplate(templateId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update template',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload image/document for use in a template header
// @route   POST /api/whatsapp/templates/upload-media
// @access  Private
exports.uploadTemplateMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { getPublicUrl } = require('../middleware/upload');
    const publicUrl = getPublicUrl(req.file.filename);

    let filePathToUpload = req.file.path;
    let mimeTypeToUpload = req.file.mimetype;

    const isSupportedImage = mimeTypeToUpload === 'image/jpeg' || mimeTypeToUpload === 'image/png';
    const isSupportedVideo = mimeTypeToUpload === 'video/mp4';
    const isSupportedPdf = mimeTypeToUpload === 'application/pdf';

    // If it is NOT a supported format for template headers (JPG, PNG, MP4, PDF),
    // Meta will reject the handle for template creation. 
    // We fallback to a dummy PDF for the template review sample so the template can still be created.
    if (!isSupportedImage && !isSupportedVideo && !isSupportedPdf) {
      const fs = require('fs');
      const dummyPdfPath = req.file.path + '.dummy.pdf';
      const minimalPdfBuffer = Buffer.from(
        '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n',
        'binary'
      );
      fs.writeFileSync(dummyPdfPath, minimalPdfBuffer);
      filePathToUpload = dummyPdfPath;
      mimeTypeToUpload = 'application/pdf';
    }

    // Upload directly to Meta's servers to get a handle (no public URL needed)
    const metaUploadResult = await whatsappService.uploadMediaForTemplateHandle(
      filePathToUpload,
      mimeTypeToUpload
    );

    // Clean up dummy PDF if created
    const fs = require('fs');
    if (filePathToUpload !== req.file.path && fs.existsSync(filePathToUpload)) {
      try { fs.unlinkSync(filePathToUpload); } catch (e) {}
    }

    const metaHandle = metaUploadResult.success ? metaUploadResult.handle : null;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: publicUrl,
        metaHandle: metaHandle  // <-- Frontend uses this for header_handle
      }
    });
  } catch (error) {
    console.error('❌ [uploadTemplateMedia] Error:', error.message);
    next(error);
  }
};

// @desc    Upload media from a URL for use in a template header
// @route   POST /api/whatsapp/templates/upload-media-by-url
// @access  Private
exports.uploadTemplateMediaByUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Media URL is required'
      });
    }

    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { uploadDir } = require('../middleware/upload');

    // 1. Get the file content (either from disk if it's our own URL, or from the web)
    let buffer;
    let mimeType;
    const isOurUrl = url.includes('documents.messbee.com');

    if (isOurUrl) {
      const filename = url.split('/').pop();
      const localPath = path.join(uploadDir, filename);
      
      console.log(`📂 [uploadTemplateMediaByUrl] Internal URL detected. Reading from disk: ${localPath}`);
      
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        // Try to guess mime type from extension
        const ext = path.extname(filename).toLowerCase();
        const mimeMap = {
          '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
          '.mp4': 'video/mp4', '.pdf': 'application/pdf'
        };
        mimeType = mimeMap[ext] || 'application/octet-stream';
      } else {
        console.warn(`⚠️ [uploadTemplateMediaByUrl] Local file not found at ${localPath}, falling back to fetch.`);
      }
    }

    if (!buffer) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      buffer = Buffer.from(response.data, 'binary');
      mimeType = response.headers['content-type'] || 'application/octet-stream';
    }

    // Download the file from the URL to a temporary location
    const tempFilePath = path.join(os.tmpdir(), `temp_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log(`📥 [uploadTemplateMediaByUrl] Downloaded file from URL. Size: ${buffer.length} bytes, MIME: ${mimeType}`);

    let filePathToUpload = tempFilePath;
    let mimeTypeToUpload = mimeType;

    const isSupportedImage = mimeTypeToUpload === 'image/jpeg' || mimeTypeToUpload === 'image/png';
    const isSupportedVideo = mimeTypeToUpload === 'video/mp4';
    const isSupportedPdf = mimeTypeToUpload === 'application/pdf';

    // If it is NOT a supported format for template headers (JPG, PNG, MP4, PDF),
    // Meta will reject the handle for template creation.
    // We MUST upload a dummy PDF to Meta to get a valid PDF handle for the template review sample.
    if (!isSupportedImage && !isSupportedVideo && !isSupportedPdf) {
      console.log(`📄 [uploadTemplateMediaByUrl] Unsupported format (${mimeTypeToUpload}) detected. Creating dummy PDF for Meta handle.`);
      const dummyPdfPath = tempFilePath + '.dummy.pdf';
      const minimalPdfBuffer = Buffer.from(
        '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n',
        'binary'
      );
      fs.writeFileSync(dummyPdfPath, minimalPdfBuffer);
      filePathToUpload = dummyPdfPath;
      mimeTypeToUpload = 'application/pdf';
    }

    // 2. Upload to Meta's servers to get a handle
    const metaUploadResult = await whatsappService.uploadMediaForTemplateHandle(
      filePathToUpload,
      mimeTypeToUpload
    );

    // 3. Clean up the temporary files
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (filePathToUpload !== tempFilePath && fs.existsSync(filePathToUpload)) {
      fs.unlinkSync(filePathToUpload);
    }

    if (!metaUploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload media to Meta servers',
        error: metaUploadResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Media processed successfully',
      data: {
        url: url,
        metaHandle: metaUploadResult.handle
      }
    });
  } catch (error) {
    console.error('❌ [uploadTemplateMediaByUrl] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing media URL',
      error: error.message
    });
  }
};

// @desc    Temporary test endpoint for WhatsApp API testing
// @route   POST /api/whatsapp/test-temp-path
// @access  Private
exports.testTempPath = async (req, res, next) => {
  try {
    const { testMessage = 'Test message from temporary path', testNumber } = req.body;
    
    // Log the incoming request
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/test-temp-path',
      userId: req.user?.id,
      userName: req.user?.name,
      requestBody: { testMessage, testNumber },
      headers: req.headers
    });

    if (!testNumber) {
      logAPICall({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/whatsapp/test-temp-path',
        userId: req.user?.id,
        statusCode: 400,
        errorMessage: 'testNumber is required'
      });
      return res.status(400).json({
        success: false,
        message: 'testNumber is required for testing'
      });
    }

    const normalized = normalizePhoneNumber(testNumber);
    console.log(`🔬 TEST-TEMP-PATH: testNumber="${testNumber}" → Normalized="${normalized}"`);

    // Send the test message
    const result = await whatsappService.sendTextMessage(normalized, testMessage);

    // Log the response
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/test-temp-path',
      userId: req.user?.id,
      statusCode: 200,
      responseStatus: result.success ? 'SUCCESS' : 'FAILED',
      responseBody: result
    });

    console.log('🔬 TEST-TEMP-PATH RESULT:', JSON.stringify(result, null, 2));

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test message sent successfully' : 'Failed to send test message',
      data: {
        input: testNumber,
        normalized,
        result
      }
    });
  } catch (error) {
    console.error('❌ [testTempPath] Error:', error.message);
    
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/whatsapp/test-temp-path',
      userId: req.user?.id,
      statusCode: 500,
      errorMessage: error.message
    });

    next(error);
  }
};

// @desc    Get recent API call logs (for testing/debugging)
// @route   GET /api/whatsapp/logs/recent
// @access  Private
exports.getRecentAPILogs = async (req, res, next) => {
  try {
    const { lines = 50 } = req.query;
    const logs = getRecentLogs(parseInt(lines));

    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'GET',
      path: '/api/whatsapp/logs/recent',
      userId: req.user?.id,
      statusCode: 200,
      responseStatus: 'SUCCESS'
    });

    res.status(200).json({
      success: true,
      message: 'Recent API logs retrieved',
      data: {
        total: logs.length,
        logs
      }
    });
  } catch (error) {
    console.error('❌ [getRecentAPILogs] Error:', error.message);
    
    logAPICall({
      timestamp: new Date().toISOString(),
      method: 'GET',
      path: '/api/whatsapp/logs/recent',
      userId: req.user?.id,
      statusCode: 500,
      errorMessage: error.message
    });

    next(error);
  }
};

module.exports = exports;

