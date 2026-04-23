const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Media = require("../models/Media");
const mongoose = require("mongoose");
const whatsappService = require("../services/whatsappService");
const { getIO } = require("../config/socket");
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { normalizePhoneNumber } = require('../utils/phoneHelper');
const { hasActiveCustomerWindow } = require('../utils/conversationWindow');
const router = express.Router();

/**
 * Map WhatsApp API error codes to user-friendly messages
 */
function parseWhatsAppError(errorObj) {
  // Meta Graph API error structure: { error: { message, code, error_data: { details } } }
  const inner = errorObj?.error || errorObj;
  const code = inner?.code;
  const details = inner?.error_data?.details || inner?.message || '';

  const codeMessages = {
    131047: '24-hour window expired — the contact must message you first, then you can reply within 24 hours. Use a template message to initiate.',
    131030: 'Phone number not in allowed list — your WhatsApp account is in TEST MODE. Add this number as a test recipient in Meta Developer Console.',
    131026: 'Message could not be delivered — the number may not have WhatsApp installed or has blocked your number.',
    131000: 'Something went wrong on WhatsApp servers. Please try again.',
    131005: 'Permission denied — your WhatsApp Business Account does not have permission to perform this action.',
    131008: 'Required parameter is missing from the API request.',
    131009: 'Parameter value is invalid.',
    131051: 'Message type not supported for this recipient.',
    131052: 'Media download error.',
    131053: 'Media upload error.',
    100:    'Invalid parameter — check your phone number format. It must include country code (e.g. 919XXXXXXXXX).',
    190:    'WhatsApp access token has expired. Please update WHATSAPP_ACCESS_TOKEN in your .env file.',
    4:      'API call limit reached. Please try again later.',
    80007:  'Rate limit — too many messages sent too quickly.'
  };

  const userMessage = codeMessages[code] || details || inner?.message || 'Unknown WhatsApp API error';
  return { code, userMessage };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveMimeType(extension) {
  const ext = extension.toLowerCase().replace('.', '');
  const mimeMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    '3gp': 'video/3gpp',
    'mov': 'video/mp4',
    'mp3': 'audio/mpeg',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'wav': 'audio/mpeg',
    'pdf': 'application/pdf',
    'csv': 'text/plain',
    'txt': 'text/plain',
    'zip': 'application/pdf',
    'rar': 'application/pdf',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return mimeMap[ext] || 'application/pdf';
}

/**
 * WhatsApp supported MIME types. Any type not in this set must be
 * mapped to the closest supported alternative before uploading.
 */
const WHATSAPP_SUPPORTED_MIMES = new Set([
  'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg', 'audio/opus',
  'application/vnd.ms-powerpoint', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf', 'text/plain', 'application/vnd.ms-excel',
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/3gpp'
]);

/**
 * Convert unsupported MIME types to WhatsApp-compatible alternatives.
 */
function sanitizeMimeForWhatsApp(mime) {
  if (WHATSAPP_SUPPORTED_MIMES.has(mime)) return mime;

  // Fallback mapping for common unsupported types
  if (mime === 'text/csv') return 'text/plain';
  if (mime === 'image/gif') return 'image/png';
  if (mime === 'video/quicktime') return 'video/mp4';
  if (mime === 'audio/wav' || mime === 'audio/x-wav') return 'audio/mpeg';
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'application/pdf';
  if (mime === 'application/vnd.rar' || mime === 'application/x-rar-compressed') return 'application/pdf';
  if (mime === 'application/octet-stream') return 'application/pdf';

  // Generic fallbacks by prefix
  if (mime.startsWith('image/')) return 'image/png';
  if (mime.startsWith('video/')) return 'video/mp4';
  if (mime.startsWith('audio/')) return 'audio/mpeg';
  if (mime.startsWith('text/')) return 'text/plain';

  return 'application/pdf';
}

function determineAssetType(mimetype) {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('video/')) return 'VIDEO';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  if (mimetype === 'application/pdf') return 'PDF';
  return 'ARCHIVE';
}

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
    // Show chats belonging to this user OR all WhatsApp chats (shared inbox)
    const chats = await Chat.find({
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ]
    }).sort({ isPinned: -1, updatedAt: -1 });
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



    // Check if chat already exists for THIS user OR is a shared WhatsApp chat
    const existingChat = await Chat.findOne({
      $and: [
        {
          $or: [
            { user: req.user.id },
            { source: 'whatsapp' }
          ]
        },
        {
          $or: [
            { phone: normalizedPhone },
            { whatsappId: normalizedPhone },
            { phone: phone || whatsappId },
            { whatsappId: whatsappId || phone }
          ]
        }
      ]
    });

    if (existingChat) {


      // Update the chat with normalized phone if needed
      if (existingChat.phone !== normalizedPhone) {
        existingChat.phone = normalizedPhone;
        existingChat.whatsappId = normalizedPhone;
        await existingChat.save();

      }

      return res.json({
        success: true,
        data: existingChat,
        message: "Chat already exists"
      });
    }

    // Create new chat with normalized phone and current userId
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
      lastMsgTime: "",
      user: req.user.id
    });



    // Emit socket event for new chat
    try {
      const io = getIO();
      if (io) {
        io.emit("chat_created", newChat);

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

    // Handle Mongoose duplicate key error (11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A contact with this phone number already exists in your list.",
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create chat",
      details: error.message
    });
  }
});

// 2. Get Messages for a specific Chat
router.get("/messages/:chatId", async (req, res) => {
  try {
    // Step 1: Verify this chat belongs to the user OR is a shared WhatsApp chat
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ]
    });
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });


    // Step 2: Fetch messages
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


    // Get chat info and verify ownership (or shared WhatsApp access)
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ]
    });
    if (!chat) {
      console.error(`❌ Chat not found or access denied: ${chatId}`);
      return res.status(404).json({ error: "Chat not found or access denied" });
    }




    // Determine message time
    const msgTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const normalizedMessageType = resolveMessageType(null, mediaType);

    // Determine the WhatsApp recipient number (prefer whatsappId, fallback to phone)
    const whatsappRecipient = chat.whatsappId || chat.phone;

    // If message is from 'me' (agent) and chat source is WhatsApp, send via WhatsApp API
    if (sender === "me" && chat.source === "whatsapp" && whatsappRecipient) {
      let whatsappResult = null;
      let displayText = text;
      let whatsappError = null;
      let outboundMessageType = media ? normalizedMessageType : 'text';
      let whatsappMediaType = 'document'; // default, overridden below if media present

      const canSendFreeText = await hasActiveCustomerWindow(chat);

      if (!canSendFreeText && (text?.trim() || media)) {
        return res.status(500).json({
          success: false,
          error: '24-hour window expired — the contact must message you first, then you can reply within 24 hours. Use an approved template message to initiate.',
          errorCode: 131047
        });
      }



      // Handle media messages
      if (media && mediaType) {
        let mediaIdToUse = media.whatsappMediaId || media.id || media.mediaId;

        // If the mediaId looks like a MongoDB ObjectId, it's likely a local gallery image
        // We MUST use its whatsappMediaId instead, or upload it to WhatsApp if missing.
        if (mediaIdToUse && (mongoose.Types.ObjectId.isValid(mediaIdToUse) || (mediaIdToUse.length === 24 && /^[0-9a-fA-F]+$/.test(mediaIdToUse)))) {

          const dbMedia = await Media.findById(mediaIdToUse);
          if (dbMedia) {
             if (dbMedia.whatsappMediaId) {
                mediaIdToUse = dbMedia.whatsappMediaId;

             } else {

                // Try to find the file locally and upload it
                const uploadDir = process.env.UPLOAD_PATH || path.resolve(__dirname, '../../uploads');
                const localFilePath = path.join(uploadDir, dbMedia.filename);
                

                if (fs.existsSync(localFilePath)) {
                   const rawMimeType = resolveMimeType(dbMedia.ext || '');
                   const determinedMimeType = sanitizeMimeForWhatsApp(rawMimeType);

                   
                   const uploadResult = await whatsappService.uploadMedia(localFilePath, determinedMimeType);
                   if (uploadResult.success) {
                      mediaIdToUse = uploadResult.mediaId;
                      // Cache it for next time
                      dbMedia.whatsappMediaId = mediaIdToUse;
                      await dbMedia.save();

                   } else {
                      console.error(`   ✗ WhatsApp upload failed:`, JSON.stringify(uploadResult.error));
                      return res.status(500).json({ error: "Failed to upload gallery asset to WhatsApp", details: uploadResult.error });
                   }
                } else {
                   console.error(`   ✗ Local file not found at: ${localFilePath}`);
                   // Fallback check: maybe it's in the root uploads folder
                   const rootUploadDir = path.resolve(process.cwd(), 'uploads');
                   const fallbackPath = path.join(rootUploadDir, dbMedia.filename);
                   if (fs.existsSync(fallbackPath)) {

                      const determinedMimeType = sanitizeMimeForWhatsApp(resolveMimeType(dbMedia.ext || ''));
                      const uploadResult = await whatsappService.uploadMedia(fallbackPath, determinedMimeType);
                      if (uploadResult.success) {
                         mediaIdToUse = uploadResult.mediaId;
                         dbMedia.whatsappMediaId = mediaIdToUse;
                         await dbMedia.save();
                         // Found and uploaded, now proceed to send
                      } else {
                         return res.status(500).json({ error: "Failed to upload gallery asset to WhatsApp", details: uploadResult.error });
                      }
                   } else {
                      return res.status(404).json({ error: "Media file not found. Please try re-uploading to the gallery." });
                   }
                }
             }
          }
        }

        if (!mediaIdToUse) {
          return res.status(400).json({
            error: "Media ID required. Please upload media to WhatsApp first using /api/chats/upload-file"
          });
        }

        // Determine media type for WhatsApp API
        if (mediaType.includes('image')) whatsappMediaType = 'image';
        else if (mediaType.includes('video')) whatsappMediaType = 'video';
        else if (mediaType.includes('audio')) whatsappMediaType = 'audio';
        else whatsappMediaType = 'document';

        const sidebarText = text || `📎 ${whatsappMediaType.charAt(0).toUpperCase() + whatsappMediaType.slice(1)}`;
        displayText = text || '';

        const result = await whatsappService.sendMediaMessage(
          whatsappRecipient,
          whatsappMediaType,
          mediaIdToUse,
          text || ''
        );

        if (result.success) {
          whatsappResult = result;
        } else {
          whatsappError = result.error;
          console.error("❌ WhatsApp media send failed:", JSON.stringify(result.error));
        }

      } else if (text && text.trim()) {
        // Send text message via WhatsApp
        const result = await whatsappService.sendTextMessage(whatsappRecipient, text);
        if (result.success) {
          whatsappResult = result;

        } else {
          whatsappError = result.error;
          console.error(`❌ WhatsApp text send failed for ${whatsappRecipient}:`, JSON.stringify(result.error));
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
        messageType: outboundMessageType,
        mediaUrl: media?.url || media?.fileUrl,
        mediaType: mediaType,
        mediaId: media?.id || media?.mediaId,
        fileName: media?.fileName,
        caption: text,
        status: msgStatus,
        user: req.user.id,
        error: whatsappError ? JSON.stringify(whatsappError).substring(0, 200) : undefined
      });

      // Update Chat metadata
      await Chat.findByIdAndUpdate(chatId, {
        lastMsg: displayText || (media ? `📎 ${whatsappMediaType.charAt(0).toUpperCase() + whatsappMediaType.slice(1)}` : ''),
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

      // If WhatsApp send failed, return error details to the frontend
      if (whatsappError) {
        const { code, userMessage } = parseWhatsAppError(whatsappError);
        console.error(`❌ WhatsApp error [${code}]: ${userMessage}`);

        return res.status(500).json({
          success: false,
          data: newMessage,
          error: userMessage,
          errorCode: code,
          rawError: whatsappError
        });
      }

      return res.json({
        success: true,
        data: newMessage,
        whatsappMessageId: whatsappResult?.messageId
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
      status: sender === "them" ? "delivered" : "sent",
      user: req.user.id
    });

    // Update Chat Metadata — fix: use proper $inc operator
    const chatUpdate = {
      lastMsg: text || '📎 Media',
      lastMsgTime: msgTime,
      lastActivity: new Date()
    };
    if (sender === "them") {
      await Chat.findByIdAndUpdate(chatId, {
        ...chatUpdate,
        lastInboundAt: new Date(),
        $inc: { unread: 1 }
      });
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
    const chat = await Chat.findOneAndUpdate(
      { 
        _id: req.params.chatId, 
        $or: [
          { user: req.user.id },
          { source: 'whatsapp' }
        ] 
      },
      { unread: 0 },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });

    // Mark all unread messages as read
    await Message.updateMany(
      { chatId: req.params.chatId, sender: "them", status: { $ne: "read" } },
      { status: "read" }
    );

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Error marking messages as read:", error);
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
    const rawMimeType = req.file.mimetype;
    const mimeType = sanitizeMimeForWhatsApp(rawMimeType);



    // Upload to WhatsApp servers with sanitized MIME type
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

    // Generate asset preview URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // IMPORTANT: Save to permanent Media Gallery as requested
    const assetType = determineAssetType(mimeType);
    const media = await Media.create({
      name: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
      size: formatBytes(req.file.size),
      ext: path.extname(req.file.originalname),
      type: assetType,
      user: req.user.id,
      thumb: assetType === 'IMAGE' ? fileUrl : null,
      whatsappMediaId: result.mediaId
    });



    res.json({
      success: true,
      mediaId: media._id, // Use Database ID so it can be resolved properly later
      whatsappMediaId: result.mediaId,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      mimeType: mimeType,
      size: formatBytes(req.file.size)
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

    const chat = await Chat.findOne({ 
      _id: chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found or access denied" });
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
      const { code, userMessage } = parseWhatsAppError(result.error);
      return res.status(500).json({
        success: false,
        error: userMessage || "Failed to send template",
        errorCode: code,
        rawError: result.error
      });
    }

    // Save template message to database
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newMessage = await Message.create({
      chatId: chatId,
      text: result.displayText || `Template: ${templateName}`,
      sender: 'me',
      time: time,
      whatsappMessageId: result.messageId,
      messageType: 'template',
      templateName: result.templateName || templateName,
      templateLanguage: result.templateLanguage || (languageCode || 'en_US'),
      metadata: {
        components: components || []
      },
      status: 'sent'
    });

    // Update chat metadata
    await Chat.findByIdAndUpdate(chatId, {
      lastMsg: result.displayText || `Template: ${templateName}`,
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
    const chat = await Chat.findOneAndUpdate(
      { 
        _id: req.params.chatId, 
        $or: [
          { user: req.user.id },
          { source: 'whatsapp' }
        ] 
      },
      { chatStatus },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 5b. Toggle Pin Status
router.put("/:chatId/pin", async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });

    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle pin status", details: error.message });
  }
});

// 5c. Toggle Mute Status
router.put("/:chatId/mute", async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });

    chat.isMuted = !chat.isMuted;
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle mute status", details: error.message });
  }
});

// 5d. Toggle Archive Status
router.put("/:chatId/archive", async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });

    chat.chatStatus = chat.chatStatus === "archived" ? "open" : "archived";
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle archive status", details: error.message });
  }
});

// 6. Assign team member
router.put("/:chatId/assign", async (req, res) => {
  try {
    const { teamMember } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { 
        _id: req.params.chatId, 
        $or: [
          { user: req.user.id },
          { source: 'whatsapp' }
        ] 
      },
      { teamMember },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 7. Update profile details
router.put("/:chatId/profile", async (req, res) => {
  try {
    const { name, phone, whatsappId, email, chatStatus, customFields, notes, isVerified } = req.body;
    
    const existingChat = await Chat.findOne({ 
      _id: req.params.chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!existingChat) return res.status(404).json({ error: "Chat not found or access denied" });

    // If verified, block core identity updates
    if (existingChat.isVerified) {
      const coreFieldsEdit = (name !== undefined && name !== existingChat.name) || 
                           (phone !== undefined && phone !== existingChat.phone) || 
                           (whatsappId !== undefined && whatsappId !== existingChat.whatsappId);
      
      if (coreFieldsEdit) {
        return res.status(403).json({ error: "This chat is verified and locked. Core details cannot be changed." });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsappId !== undefined) updateData.whatsappId = whatsappId;
    if (email !== undefined) updateData.email = email;
    if (chatStatus !== undefined) updateData.chatStatus = chatStatus;
    if (customFields !== undefined) updateData.customFields = customFields;
    if (notes !== undefined) updateData.notes = notes;
    if (isVerified !== undefined) {
      // Prevent un-verifying once verified
      if (!(existingChat.isVerified && isVerified === false)) {
        updateData.isVerified = isVerified;
      }
    }

    const chat = await Chat.findOneAndUpdate(
      { 
        _id: req.params.chatId, 
        $or: [
          { user: req.user.id },
          { source: 'whatsapp' }
        ] 
      },
      { $set: updateData },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });
    
    // Emit socket event to notify other clients
    try {
      const io = getIO();
      if (io) {
        io.emit("chat_updated", chat);
      }
    } catch (socketError) {
      console.error("Socket error on profile update:", socketError.message);
    }

    res.json(chat);
  } catch (error) {
    console.error("Error updating chat profile:", error);
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

// 7b. Add/remove labels
router.put("/:chatId/labels", async (req, res) => {
  try {
    const { labels } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { 
        _id: req.params.chatId, 
        $or: [
          { user: req.user.id },
          { source: 'whatsapp' }
        ] 
      },
      { labels },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });
    res.json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 9. Clear Chat History (Soft delete all messages)
router.delete("/:chatId/messages", async (req, res) => {
  try {
    // Verify ownership first
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });
    if (!chat) return res.status(404).json({ error: "Chat not found or access denied" });

    await Message.updateMany(
      { chatId: req.params.chatId }, // Allow clearing all messages in shared chat
      { isDeleted: true, deletedAt: new Date() }
    );

    // Update chat last message
    chat.lastMsg = "Chat history cleared";
    chat.unread = 0;
    await chat.save();

    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear chat history", details: error.message });
  }
});

// 10. Delete Chat/Contact
router.delete("/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Verify ownership and delete
    const deletedChat = await Chat.findOneAndDelete({ 
      _id: chatId, 
      $or: [
        { user: req.user.id },
        { source: 'whatsapp' }
      ] 
    });

    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found or access denied" });
    }

    // Delete all messages associated with this chat for this user
    await Message.deleteMany({ chatId }); // Delete all messages for everyone if shared chat is deleted

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