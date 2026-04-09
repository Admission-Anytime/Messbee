const whatsappService = require('../services/whatsappService');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { getIO } = require('../config/socket');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const { hasActiveCustomerWindow } = require('../utils/conversationWindow');

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
      console.log('✅ Webhook verified successfully');
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
      chat.lastInboundAt = new Date(parseInt(timestamp) * 1000);
      // Ensure whatsappId is set (for older chats)
      if (!chat.whatsappId) {
        chat.whatsappId = from;
        console.log(`   ✓ Updated whatsappId to ${from}`);
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
    chat.lastMsg = lastMsgText || messageText || '📎 Media';
    chat.lastMsgTime = newMessage.time;
    chat.unread = (chat.unread || 0) + 1;
    chat.lastInboundAt = new Date(parseInt(timestamp) * 1000);
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
    const { messageId, status, timestamp, recipientId, errors } = data;

    const firstError = Array.isArray(errors) && errors.length > 0 ? errors[0] : null;
    const errorCode = firstError?.code;
    const errorMessage = firstError?.title || firstError?.message || firstError?.details || null;

    console.log(`📊 Processing status update: ${status} for message ${messageId}`);
    console.log(`   Recipient: ${recipientId}, Time: ${new Date(parseInt(timestamp) * 1000).toISOString()}`);

    // Update message status in database
    const updatePayload = {
      status: status,
      statusTimestamp: new Date(parseInt(timestamp) * 1000)
    };

    if (status === 'failed' && errorMessage) {
      updatePayload.error = errorCode ? `[${errorCode}] ${errorMessage}` : errorMessage;
    }

    const message = await Message.findOneAndUpdate(
      { whatsappMessageId: messageId },
      updatePayload,
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
            whatsappMessageId: messageId,
            error: message.error,
            errorCode: errorCode
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

    const canSendFreeText = await hasActiveCustomerWindow(chat);
    if (!canSendFreeText) {
      return res.status(500).json({
        success: false,
        message: '24-hour window expired — the contact must message you first, then you can reply within 24 hours. Use an approved template message to initiate.',
        errorCode: 131047
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
    const {
      chatId,
      to,
      phoneNumber,
      templateName,
      languageCode,
      components = []
    } = req.body;

    if (!templateName) {
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
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      recipientPhone = normalizePhoneNumber(chat.phone || chat.whatsappId);
    } else {
      const rawPhone = to || phoneNumber;
      if (!rawPhone) {
        return res.status(400).json({
          success: false,
          message: 'Either chatId or recipient phone number is required'
        });
      }

      recipientPhone = normalizePhoneNumber(rawPhone);
      if (!recipientPhone) {
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
          source: 'whatsapp'
        });
      }
    }

    const result = await whatsappService.sendTemplateMessage(
      recipientPhone,
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

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newMessage = await Message.create({
      chatId: chat._id,
      text: `Template: ${templateName}`,
      sender: 'me',
      time,
      whatsappMessageId: result.messageId,
      messageType: 'template',
      templateName,
      templateLanguage: languageCode || 'en_US',
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

    res.status(200).json({
      success: true,
      data: {
        message: newMessage,
        whatsappMessageId: result.messageId,
        chat
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WhatsApp message templates
// @route   GET /api/whatsapp/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {
    console.log('📡 [Server] getTemplates called');
    
    const data = await whatsappService.getTemplates();
    
    console.log('📡 [Server] WhatsApp service returned:', {
      hasData: !!data,
      dataType: typeof data,
      isArray: Array.isArray(data?.data),
      arrayLength: data?.data?.length || 'N/A'
    });
    
    if (data?.data && Array.isArray(data.data)) {
      console.log('📡 [Server] Template details:');
      data.data.forEach((template, idx) => {
        console.log(`  [${idx + 1}] ${template.name}:`, {
          id: template.id,
          status: template.status,
          status_type: typeof template.status,
          category: template.category,
          created_timestamp: template.created_timestamp,
          rejected_reason: template.rejected_reason
        });
      });
    }

    const templates = Array.isArray(data?.data) ? data.data : [];
    const approvedTemplates = templates.filter((template) => template.status === 'APPROVED');
    const nonApprovedTemplates = templates.filter((template) => template.status !== 'APPROVED');
    
    res.status(200).json({
      success: true,
      data: data,
      summary: {
        total: templates.length,
        approved: approvedTemplates.length,
        nonApproved: nonApprovedTemplates.length
      },
      approvedTemplates,
      nonApprovedTemplates
    });
  } catch (error) {
    console.error('❌ [Server] Error in getTemplates controller:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error fetching templates',
      error: error.message
    });
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
      return res.status(400).json({
        success: false,
        message: 'Failed to create template',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: result.data
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

    if (!result.success) {
      console.error('❌ [Controller] Delete failed:', result.error);
      return res.status(400).json({
        success: false,
        message: 'Failed to delete template',
        error: result.error
      });
    }

    console.log('✅ [Controller] Template deleted successfully:', templateName);
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

module.exports = exports;
