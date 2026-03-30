const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const whatsappService = require("../services/whatsappService");
const { getIO } = require("../config/socket");
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const router = express.Router();

// Protect all chat routes
router.use(protect);

// 1. Get All Chats (Sidebar)
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 1b. Create New Chat/Contact
router.post("/", async (req, res) => {
  try {
    const { name, phone, whatsappId, source = "whatsapp" } = req.body;

    if (!whatsappId && !phone) {
      return res.status(400).json({ 
        error: "Phone number or WhatsApp ID is required" 
      });
    }

    // Normalize phone numbers
    const normalizedPhone = normalizePhoneNumber(phone || whatsappId);
    
    console.log(`📝 Creating/finding chat for: ${normalizedPhone} (original: ${phone || whatsappId})`);

    // Check if chat already exists (check both normalized and original)
    const existingChat = await Chat.findOne({ 
      $or: [
        { phone: normalizedPhone },
        { whatsappId: normalizedPhone },
        { phone: phone || whatsappId },
        { whatsappId: whatsappId || phone }
      ]
    });

    if (existingChat) {
      console.log(`✅ Chat already exists for ${normalizedPhone}: ${existingChat._id}`);
      
      // Update the chat with normalized phone if needed
      if (existingChat.phone !== normalizedPhone) {
        existingChat.phone = normalizedPhone;
        existingChat.whatsappId = normalizedPhone;
        await existingChat.save();
        console.log(`   ✓ Updated phone to normalized format: ${normalizedPhone}`);
      }
      
      return res.json({
        success: true,
        data: existingChat,
        message: "Chat already exists"
      });
    }

    // Create new chat with normalized phone
    const newChat = await Chat.create({
      name: name || normalizedPhone,
      phone: normalizedPhone,
      whatsappId: normalizedPhone,
      source: source,
      status: "offline",
      chatStatus: "open",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedPhone)}&background=random`,
      teamMember: "Unassigned",
      unread: 0,
      lastMsg: "",
      lastMsgTime: ""
    });

    console.log(`✅ Created new chat for ${normalizedPhone}: ${newChat._id}`);

    // Emit socket event for new chat
    try {
      const io = getIO();
      if (io) {
        io.emit("chat_created", newChat);
        console.log(`📡 Emitted chat_created event`);
      }
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }

    res.status(201).json({
      success: true,
      data: newChat
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ 
      error: "Failed to create chat",
      details: error.message 
    });
  }
});

// 2. Get Messages for a specific Chat
router.get("/messages/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ 
      chatId: req.params.chatId,
      isDeleted: false 
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 3. Send a Message (Updated to support WhatsApp with media)
router.post("/message", async (req, res) => {
  const { chatId, text, sender, time, media, mediaType } = req.body;
  
  try {
    console.log(`📨 Sending message to chat ${chatId}:`, {
      sender,
      hasText: !!text,
      hasMedia: !!media,
      mediaType
    });

    // Get chat info
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.error(`❌ Chat not found: ${chatId}`);
      return res.status(404).json({ error: "Chat not found" });
    }

    console.log(`💬 Chat found: ${chat.name} (${chat.phone}), Source: ${chat.source}`);

    // If message is from 'me' (agent) and chat source is WhatsApp, send via WhatsApp API
    if (sender === "me" && chat.source === "whatsapp" && chat.whatsappId) {
      let whatsappResult;
      let displayText = text;

      // Handle media messages
      if (media && mediaType) {
        const mediaId = media.id || media.mediaId;
        
        if (!mediaId) {
          return res.status(400).json({ 
            error: "Media ID required. Please upload media to WhatsApp first using /api/chats/upload-file" 
          });
        }
        
        // Determine media type for WhatsApp API
        let whatsappMediaType = mediaType;
        if (mediaType.includes('image')) {
          whatsappMediaType = 'image';
        } else if (mediaType.includes('video')) {
          whatsappMediaType = 'video';
        } else if (mediaType.includes('audio')) {
          whatsappMediaType = 'audio';
        } else {
          whatsappMediaType = 'document';
        }
        
        whatsappResult = await whatsappService.sendMediaMessage(
          chat.whatsappId, 
          whatsappMediaType, 
          mediaId,
          text || '' // Caption
        );
        
        // Set display text for message
        displayText = text || `📎 ${whatsappMediaType.charAt(0).toUpperCase() + whatsappMediaType.slice(1)}`;
      } else if (text && text.trim()) {
        // Send text message
        whatsappResult = await whatsappService.sendTextMessage(chat.whatsappId, text);
      } else {
        return res.status(400).json({ error: "Message text or media is required" });
      }
      
      if (!whatsappResult.success) {
        console.error("Failed to send WhatsApp message:", whatsappResult.error);
        return res.status(500).json({ 
          error: "Failed to send WhatsApp message",
          details: whatsappResult.error 
        });
      }

      // Create Message with WhatsApp message ID
      const newMessage = await Message.create({ 
        chatId, 
        text: displayText, 
        sender, 
        time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        whatsappMessageId: whatsappResult.messageId,
        messageType: mediaType || "text",
        mediaUrl: media?.url || media?.fileUrl,
        caption: text,
        status: "sent"
      });

      // Update Chat Metadata
      await Chat.findByIdAndUpdate(chatId, {
        lastMsg: displayText,
        lastMsgTime: newMessage.time,
        lastActivity: new Date()
      });

      // Emit socket event
      try {
        const io = getIO();
        if (io) {
          console.log(`📡 Emitting message_sent event for chat ${chatId}`);
          io.emit("message_sent", {
            chatId: chatId,
            message: newMessage
          });
          console.log(`✅ Socket event emitted successfully`);
        } else {
          console.warn(`⚠️  Socket.IO not initialized`);
        }
      } catch (socketError) {
        console.error("❌ Socket error:", socketError.message);
      }

      return res.json({
        success: true,
        data: newMessage,
        whatsappMessageId: whatsappResult.messageId,
        warning: 'Message sent to WhatsApp. If recipient doesn\'t receive it within a few minutes, they may not have WhatsApp installed or active on this number.'
      });
    }

    // Regular message (non-WhatsApp or from customer)
    const newMessage = await Message.create({ 
      chatId, 
      text, 
      sender, 
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: mediaType || "text",
      mediaUrl: media?.url,
      status: sender === "them" ? "delivered" : "sent"
    });
    
    // Update Chat Metadata
    await Chat.findByIdAndUpdate(chatId, {
      lastMsg: text,
      lastMsgTime: newMessage.time,
      unread: sender === "them" ? { $inc: 1 } : 0,
      lastActivity: new Date()
    });

    // Emit socket event
    try {
      const io = getIO();
      if (io) {
        io.emit("receive_message", {
          chatId: chatId,
          message: newMessage
        });
      }
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }

    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      error: "Failed to send message",
      details: error.message 
    });
  }
});

// 4. Mark messages as read
router.put("/:chatId/read", async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { unread: 0 },
      { new: true }
    );
    
    // Mark all unread messages as read
    await Message.updateMany(
      { chatId: req.params.chatId, sender: "them", status: { $ne: "read" } },
      { status: "read" }
    );

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json(error);
  }
});

// 5. Upload file and get media for WhatsApp
router.post("/upload-file", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded" 
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    
    console.log(`📁 File uploaded: ${filePath}, Type: ${mimeType}`);

    // Upload to WhatsApp servers
    const result = await whatsappService.uploadMedia(filePath, mimeType);

    if (!result.success) {
      // Clean up local file on failure
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(500).json({
        error: "Failed to upload media to WhatsApp",
        details: result.error
      });
    }

    // Get file URL for preview (optional - can delete after upload to WhatsApp)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      mediaId: result.mediaId,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      mimeType: mimeType,
      size: req.file.size
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // Clean up local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: "Failed to upload file",
      details: error.message 
    });
  }
});

// 5b. Upload media to WhatsApp (from URL - legacy support)
router.post("/upload-media", async (req, res) => {
  try {
    const { fileUrl, mimeType } = req.body;

    if (!fileUrl || !mimeType) {
      return res.status(400).json({ 
        error: "File URL and mime type are required" 
      });
    }

    const result = await whatsappService.uploadMediaFromUrl(fileUrl, mimeType);

    if (!result.success) {
      return res.status(500).json({
        error: "Failed to upload media to WhatsApp",
        details: result.error
      });
    }

    res.json({
      success: true,
      mediaId: result.mediaId
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ 
      error: "Failed to upload media",
      details: error.message 
    });
  }
});

// 6. Send template message
router.post("/send-template", async (req, res) => {
  try {
    const { chatId, templateName, languageCode, components } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (chat.source !== "whatsapp" || !chat.whatsappId) {
      return res.status(400).json({ 
        error: "This chat is not a WhatsApp conversation" 
      });
    }

    const result = await whatsappService.sendTemplateMessage(
      chat.whatsappId,
      templateName,
      languageCode || 'en',
      components || []
    );

    if (!result.success) {
      return res.status(500).json({
        error: "Failed to send template",
        details: result.error
      });
    }

    // Save template message to database
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newMessage = await Message.create({
      chatId: chatId,
      text: `Template: ${templateName}`,
      sender: 'me',
      time: time,
      whatsappMessageId: result.messageId,
      messageType: 'template',
      status: 'sent'
    });

    // Update chat metadata
    await Chat.findByIdAndUpdate(chatId, {
      lastMsg: `Template: ${templateName}`,
      lastMsgTime: time,
      lastActivity: new Date()
    });

    res.json({
      success: true,
      data: newMessage,
      whatsappMessageId: result.messageId
    });
  } catch (error) {
    console.error("Error sending template:", error);
    res.status(500).json({ 
      error: "Failed to send template",
      details: error.message 
    });
  }
});

// 5. Update chat status
router.put("/:chatId/status", async (req, res) => {
  try {
    const { chatStatus } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { chatStatus },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 6. Assign team member
router.put("/:chatId/assign", async (req, res) => {
  try {
    const { teamMember } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { teamMember },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 7. Add/remove labels
router.put("/:chatId/labels", async (req, res) => {
  try {
    const { labels } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { labels },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 8. Create Dummy Data (Run once to populate DB)
router.post("/seed", async (req, res) => {
  await Chat.create({
    name: "Priyanshu Raghuvanshi",
    phone: "+91 98765 43210",
    status: "active",
    teamMember: "Akshay Tomar",
    labels: ["Warm Lead"],
    avatar: "https://i.pravatar.cc/150?u=1",
    lastMsg: "Hello",
    lastMsgTime: "12:00 PM",
    source: "whatsapp",
    whatsappId: "+919876543210"
  });
  res.send("Seeded");
});

module.exports = router;