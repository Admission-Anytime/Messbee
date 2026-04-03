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

const resolveMessageType = (messageType, mediaType) => {
  const typeCandidate = (messageType || mediaType || '').toLowerCase();

  if (['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'template'].includes(typeCandidate)) {
    return typeCandidate;
  }

  if (typeCandidate.includes('image')) return 'image';
  if (typeCandidate.includes('video')) return 'video';
  if (typeCandidate.includes('audio')) return 'audio';
  if (typeCandidate.includes('pdf') || typeCandidate.includes('doc') || typeCandidate.includes('sheet') || typeCandidate.includes('presentation')) {
    return 'document';
  }

  return 'text';
};

// Protect all chat routes
router.use(protect);

// 1. Get All Chats (Sidebar)
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ isPinned: -1, updatedAt: -1 });
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

    // Determine message time
    const msgTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const normalizedMessageType = resolveMessageType(null, mediaType);

    // If message is from 'me' (agent) and chat source is WhatsApp, send via WhatsApp API
    if (sender === "me" && chat.source === "whatsapp" && chat.whatsappId) {
      let whatsappResult = null;
      let displayText = text;
      let whatsappError = null;

      // Handle media messages
      if (media && mediaType) {
        const mediaId = media.id || media.mediaId;

        if (!mediaId) {
          return res.status(400).json({
            error: "Media ID required. Please upload media to WhatsApp first using /api/chats/upload-file"
          });
        }

        // Determine media type for WhatsApp API
        let whatsappMediaType = 'document';
        if (mediaType.includes('image')) whatsappMediaType = 'image';
        else if (mediaType.includes('video')) whatsappMediaType = 'video';
        else if (mediaType.includes('audio')) whatsappMediaType = 'audio';

        const result = await whatsappService.sendMediaMessage(
          chat.whatsappId,
          whatsappMediaType,
          mediaId,
          text || ''
        );

        if (result.success) {
          whatsappResult = result;
        } else {
          whatsappError = result.error;
          console.error("⚠️  WhatsApp media send failed (saving to DB anyway):", result.error);
        }

        displayText = text || `📎 ${whatsappMediaType.charAt(0).toUpperCase() + whatsappMediaType.slice(1)}`;

      } else if (text && text.trim()) {
        // Send text message via WhatsApp
        const result = await whatsappService.sendTextMessage(chat.whatsappId, text);
        if (result.success) {
          whatsappResult = result;
        } else {
          whatsappError = result.error;
          console.error("⚠️  WhatsApp text send failed (saving to DB anyway):", result.error);
        }
      } else {
        return res.status(400).json({ error: "Message text or media is required" });
      }

      // Save message to DB regardless of WhatsApp result
      const msgStatus = whatsappResult ? "sent" : "failed";
      const newMessage = await Message.create({
        chatId,
        text: displayText,
        sender,
        time: msgTime,
        whatsappMessageId: whatsappResult?.messageId,
        messageType: media ? normalizedMessageType : "text",
        mediaUrl: media?.url || media?.fileUrl,
        mediaType: mediaType,
        mediaId: media?.id || media?.mediaId,
        fileName: media?.fileName,
        caption: text,
        status: msgStatus,
        error: whatsappError ? JSON.stringify(whatsappError).substring(0, 200) : undefined
      });

      // Update Chat metadata
      await Chat.findByIdAndUpdate(chatId, {
        lastMsg: displayText,
        lastMsgTime: msgTime,
        lastActivity: new Date()
      });

      // Emit socket event to all clients in the chat room
      try {
        const io = getIO();
        if (io) {
          io.to(chatId.toString()).emit("message_sent", {
            chatId: chatId.toString(),
            message: newMessage
          });
          // Also update chat list for all clients
          io.emit("chat_updated", await Chat.findById(chatId));
        }
      } catch (socketError) {
        console.error("❌ Socket error:", socketError.message);
      }

      return res.json({
        success: true,
        data: newMessage,
        whatsappMessageId: whatsappResult?.messageId,
        whatsappError: whatsappError || undefined
      });
    }

    // ── Regular message (non-WhatsApp or from customer / 'them') ──
    if (!text && !media) {
      return res.status(400).json({ error: "Message text or media is required" });
    }

    const newMessage = await Message.create({
      chatId,
      text,
      sender,
      time: msgTime,
      messageType: media ? normalizedMessageType : "text",
      mediaUrl: media?.url,
      mediaType: mediaType,
      mediaId: media?.id || media?.mediaId,
      fileName: media?.fileName,
      status: sender === "them" ? "delivered" : "sent"
    });

    // Update Chat Metadata — fix: use proper $inc operator
    const chatUpdate = {
      lastMsg: text || '📎 Media',
      lastMsgTime: msgTime,
      lastActivity: new Date()
    };
    if (sender === "them") {
      await Chat.findByIdAndUpdate(chatId, { ...chatUpdate, $inc: { unread: 1 } });
    } else {
      await Chat.findByIdAndUpdate(chatId, chatUpdate);
    }

    // Emit socket event to everyone (for non-WhatsApp chats)
    try {
      const io = getIO();
      if (io) {
        io.emit("receive_message", {
          chatId: chatId.toString(),
          message: newMessage
        });
        io.emit("chat_updated", await Chat.findById(chatId));
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

// 5b. Toggle Pin Status
router.put("/:chatId/pin", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle pin status", details: error.message });
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

// 9. Clear Chat History (Soft delete all messages)
router.delete("/:chatId/messages", async (req, res) => {
  try {
    await Message.updateMany(
      { chatId: req.params.chatId },
      { isDeleted: true, deletedAt: new Date() }
    );

    // Update chat last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMsg: "Chat history cleared",
      unread: 0
    });

    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear chat history", details: error.message });
  }
});

// 10. Delete Chat/Contact
router.delete("/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Delete all messages associated with this chat
    await Message.deleteMany({ chatId });

    // Delete the chat itself
    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ success: true, message: "Chat and associated messages deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chat", details: error.message });
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