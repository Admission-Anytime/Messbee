const whatsappService = require('../services/whatsappService');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { getIO } = require('../config/socket');

/**
 * WhatsApp Webhook Controller
 * Handles incoming webhooks from WhatsApp Business API
 */

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
    // const signature = req.headers['x-hub-signature-256'];
    // const isValid = whatsappService.verifyWebhookSignature(
    //   signature,
    //   JSON.stringify(req.body),
    //   process.env.WHATSAPP_APP_SECRET
    // );
    // if (!isValid) {
    //   return res.sendStatus(403);
    // }

    const webhookData = req.body;
    console.log('📱 Received WhatsApp Webhook:', JSON.stringify(webhookData, null, 2));

    // Process the webhook
    const result = whatsappService.processWebhook(webhookData);

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return res.sendStatus(200); // Still return 200 to acknowledge receipt
    }

    // Handle incoming message
    if (result.type === 'message') {
      await handleIncomingMessage(result.data);
    }

    // Handle status update (delivered, read, etc.)
    if (result.type === 'status') {
      await handleStatusUpdate(result.data);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
};

/**
 * Process incoming WhatsApp message
 */
async function handleIncomingMessage(data) {
  try {
    const { from, contact, message, messageId, messageType, timestamp } = data;

    // Find or create chat
    let chat = await Chat.findOne({ phone: from });

    if (!chat) {
      chat = await Chat.create({
        name: contact.name,
        phone: from,
        status: 'active',
        chatStatus: 'open',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`,
        teamMember: 'Unassigned',
        whatsappId: from,
        source: 'whatsapp'
      });
    } else {
      // Update chat status if it was closed
      if (chat.chatStatus === 'closed') {
        chat.chatStatus = 'open';
      }
      chat.status = 'active';
    }

    // Create message based on type
    let messageText = '';
    let mediaUrl = null;
    let mediaType = null;

    switch (messageType) {
      case 'text':
        messageText = message.text;
        break;
      case 'image':
        messageText = message.caption || '📷 Image';
        mediaUrl = message.mediaId;
        mediaType = 'image';
        break;
      case 'video':
        messageText = message.caption || '🎥 Video';
        mediaUrl = message.mediaId;
        mediaType = 'video';
        break;
      case 'audio':
        messageText = '🎵 Audio';
        mediaUrl = message.mediaId;
        mediaType = 'audio';
        break;
      case 'document':
        messageText = message.filename || '📄 Document';
        mediaUrl = message.mediaId;
        mediaType = 'document';
        break;
      case 'location':
        messageText = `📍 Location: ${message.name || message.address}`;
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
      mediaType: mediaType,
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
      io.emit('receive_message', {
        chatId: chat._id,
        message: newMessage,
        chat: chat
      });
      
      // Also emit chat list update
      io.emit('chat_updated', chat);
    } catch (socketError) {
      console.error('Socket emit error:', socketError.message);
    }

    // Mark message as read on WhatsApp
    await whatsappService.markMessageAsRead(messageId);

    console.log('✅ Message processed successfully:', messageId);
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

/**
 * Process message status update
 */
async function handleStatusUpdate(data) {
  try {
    const { messageId, status, timestamp } = data;

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
      // Emit status update to frontend
      try {
        const io = getIO();
        io.emit('message_status_update', {
          messageId: message._id,
          status: status,
          whatsappMessageId: messageId
        });
      } catch (socketError) {
        console.error('Socket emit error:', socketError.message);
      }
    }

    console.log(`✅ Status updated for message ${messageId}: ${status}`);
  } catch (error) {
    console.error('Error handling status update:', error);
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
      io.emit('message_sent', {
        chatId: chat._id,
        message: newMessage,
        chat: chat
      });
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
