const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const whatsappService = require("../services/whatsappService");
const { getIO } = require("../config/socket");
const { protect } = require('../middleware/auth');
const router = express.Router();

// Protect all chat routes
router.use(protect);

// 1. Get All Chats (Sidebar)
router.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json(error);
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

// 3. Send a Message (Updated to support WhatsApp)
router.post("/message", async (req, res) => {
  const { chatId, text, sender, time } = req.body;
  
  try {
    // Get chat info
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // If message is from 'me' (agent) and chat source is WhatsApp, send via WhatsApp API
    if (sender === "me" && chat.source === "whatsapp" && chat.whatsappId) {
      const whatsappResult = await whatsappService.sendTextMessage(chat.whatsappId, text);
      
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
        text, 
        sender, 
        time,
        whatsappMessageId: whatsappResult.messageId,
        messageType: "text",
        status: "sent"
      });

      // Update Chat Metadata
      await Chat.findByIdAndUpdate(chatId, {
        lastMsg: text,
        lastMsgTime: time,
        lastActivity: new Date()
      });

      // Emit socket event
      try {
        const io = getIO();
        io.emit("message_sent", {
          chatId: chatId,
          message: newMessage
        });
      } catch (socketError) {
        console.error("Socket error:", socketError.message);
      }

      return res.json(newMessage);
    }

    // Regular message (non-WhatsApp or from customer)
    const newMessage = await Message.create({ 
      chatId, 
      text, 
      sender, 
      time,
      messageType: "text",
      status: sender === "them" ? "delivered" : "sent"
    });
    
    // Update Chat Metadata
    await Chat.findByIdAndUpdate(chatId, {
      lastMsg: text,
      lastMsgTime: time,
      unread: sender === "them" ? { $inc: 1 } : 0,
      lastActivity: new Date()
    });

    // Emit socket event
    try {
      const io = getIO();
      io.emit("receive_message", {
        chatId: chatId,
        message: newMessage
      });
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }

    res.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json(error);
  }
});

// 4. Mark messages as read
router.put("/chats/:chatId/read", async (req, res) => {
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

// 5. Update chat status
router.put("/chats/:chatId/status", async (req, res) => {
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
router.put("/chats/:chatId/assign", async (req, res) => {
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
router.put("/chats/:chatId/labels", async (req, res) => {
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