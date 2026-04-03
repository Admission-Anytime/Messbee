const whatsappService = require('../services/whatsappService');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { getIO } = require('../config/socket');
const { normalizePhoneNumber } = require('../utils/phoneHelper');

/**
 * WhatsApp Webhook Controller
 * Handles incoming webhooks from WhatsApp Business API
 */

// @desc    Test WhatsApp API connection
// @route   GET /api/whatsapp/test-connection
// @access  Private
exports.testConnection = async (req, res, next) => {
  try {
    // Validate configuration
    whatsappService.validateConfig();
    
    res.status(200).json({
      success: true,
      message: 'WhatsApp API configuration is valid',
      config: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        apiVersion: process.env.WHATSAPP_API_VERSION
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
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed');
    res.sendStatus(403);
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
      console.log('✅ Webhook signature verified');
    }

    const webhookData = req.body;
    console.log('📱 Received WhatsApp Webhook:', JSON.stringify(webhookData, null, 2));
    
    // Log webhook type for debugging
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
              console.log('📥 INCOMING MESSAGE detected');
            }

            if (Array.isArray(value.statuses) && value.statuses.length > 0) {
              console.log('📊 MESSAGE STATUS UPDATE detected:', value.statuses[0]);
            }

            const result = whatsappService.processWebhook({ entry: [{ changes: [change] }] });

            if (!result.success) {
              console.error('Webhook processing failed:', result.error);
              continue;
            }

            if (result.type === 'message') {
              await handleIncomingMessage(result.data);
            }

            if (result.type === 'status') {
              await handleStatusUpdate(result.data);
            }
          }
        }
      } catch (backgroundError) {
        console.error('❌ Async webhook processing error:', backgroundError);
      }
    });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    console.error('   Stack:', error.stack);
    // Always return 200 to prevent WhatsApp from retrying
    res.sendStatus(200);
  }
};

/**
 * Process incoming WhatsApp message
 */
async function handleIncomingMessage(data) {
  try {
    const { from, contact, message, messageId, messageType, timestamp } = data;

    // Normalize the phone number
    const normalizedFrom = normalizePhoneNumber(from);
    const contactName = contact?.name || contact?.profile?.name || normalizedFrom;

    console.log(`📥 Processing incoming WhatsApp message from ${normalizedFrom} (original: ${from}), type: ${messageType}`);
    console.log(`   Message ID: ${messageId}`);
    console.log(`   Contact: ${contactName}`);

    // Find or create chat (check both phone and whatsappId with normalized number)
    let chat = await Chat.findOne({ 
      $or: [
        { phone: normalizedFrom },
        { whatsappId: normalizedFrom },
        { phone: from },
        { whatsappId: from }
      ]
    });

    if (!chat) {
      console.log(`📝 Creating new chat for ${normalizedFrom}`);
      chat = await Chat.create({
        name: contactName,
        phone: normalizedFrom,
        status: 'active',
        chatStatus: 'open',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random`,
        teamMember: 'Unassigned',
        whatsappId: normalizedFrom,
        source: 'whatsapp'
      });
      
      console.log(`✅ Created new chat for ${normalizedFrom}, Chat ID: ${chat._id}`);
      
      // Emit chat_created event
      try {
        const io = getIO();
        if (io) {
          io.emit('chat_created', chat);
          console.log(`📡 Emitted chat_created event for new chat`);
        }
      } catch (socketError) {
        console.error('Socket emit error:', socketError.message);
      }
    } else {
      console.log(`💬 Found existing chat for ${normalizedFrom}, Chat ID: ${chat._id}`);
      
      // Update with normalized phone if needed
      if (chat.phone !== normalizedFrom || chat.whatsappId !== normalizedFrom) {
        chat.phone = normalizedFrom;
        chat.whatsappId = normalizedFrom;
        console.log(`   ✓ Updated to normalized phone: ${normalizedFrom}`);
      }
      
      // Update chat status if it was closed
      if (chat.chatStatus === 'closed') {
        chat.chatStatus = 'open';
        console.log(`   ✓ Reopened closed chat`);
      }
      chat.status = 'active';
      chat.lastActivity = new Date();
      // Ensure whatsappId is set (for older chats)
      if (!chat.whatsappId) {
        chat.whatsappId = from;
        console.log(`   ✓ Updated whatsappId to ${from}`);
      }
    }

    // Create message based on type
    let messageText = '';
    let mediaUrl = null;
    let mediaId = null;
    let mediaTypeStr = null;
    let caption = null;
    let fileName = null;
    let location = null;

    switch (messageType) {
      case 'text':
        messageText = message.text || '';
        break;
        
      case 'image':
        caption = message.caption;
        messageText = caption || '📷 Image';
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
        messageText = caption || '🎥 Video';
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
        messageText = '🎵 Audio message';
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
        messageText = fileName || caption || '📄 Document';
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
        messageText = `📍 ${message.name || message.address || 'Location'}`;
        break;
        
      case 'contacts':
        messageText = '👤 Contact Card';
        break;
        
      case 'sticker':
        messageText = '😊 Sticker';
        mediaId = message.mediaId;
        break;
        
      default:
        messageText = 'Unsupported message type';
    }

    // Create message record
    const newMessage = await Message.create({
      chatId: chat._id,
      text: messageText,
      sender: 'them',
      time: new Date(parseInt(timestamp) * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
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
    chat.lastMsg = messageText;
    chat.lastMsgTime = newMessage.time;
    chat.unread = (chat.unread || 0) + 1;
    await chat.save();

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

    console.log(`✅ Message processed successfully: ${messageId}`);
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}

/**
 * Process message status update
 */
async function handleStatusUpdate(data) {
  try {
    const { messageId, status, timestamp, recipientId } = data;

    console.log(`📊 Processing status update: ${status} for message ${messageId}`);
    console.log(`   Recipient: ${recipientId}, Time: ${new Date(parseInt(timestamp) * 1000).toISOString()}`);

    // Update message status in database
    const message = await Message.findOneAndUpdate(
      { whatsappMessageId: messageId },
      { 
        status: status,
        statusTimestamp: new Date(parseInt(timestamp) * 1000)
      },
      { new: true }
    );

    if (message) {
      console.log(`✅ Database updated: Message ${message._id} now has status: ${status}`);
      
      // Emit status update to frontend
      try {
        const io = getIO();
        if (io) {
          io.emit('message_status_update', {
            messageId: message._id,
            status: status,
            whatsappMessageId: messageId
          });
          console.log(`📡 Status update emitted to frontend`);
        }
      } catch (socketError) {
        console.error('❌ Socket emit error:', socketError.message);
      }
    } else {
      console.warn(`⚠️  Message not found in database: ${messageId}`);
    }

    console.log(`✅ Status updated for message ${messageId}: ${status}`);
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

    if (!text || (!chatId && !to)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find chat
    const chat = chatId ? await Chat.findById(chatId) : await Chat.findOne({ phone: to });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Send via WhatsApp API
    const result = await whatsappService.sendTextMessage(chat.phone, text);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: result.error
      });
    }

    // Save message to database
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

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

    res.status(200).json({
      success: true,
      data: {
        message: newMessage,
        whatsappMessageId: result.messageId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send WhatsApp template message
// @route   POST /api/whatsapp/send-template
// @access  Private
exports.sendTemplateMessage = async (req, res, next) => {
  try {
    const { chatId, templateName, languageCode, components } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const result = await whatsappService.sendTemplateMessage(
      chat.phone,
      templateName,
      languageCode,
      components
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send template',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
