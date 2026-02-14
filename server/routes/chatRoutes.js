const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const router = express.Router();

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
    const messages = await Message.find({ chatId: req.params.chatId });
    res.json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 3. Send a Message
router.post("/message", async (req, res) => {
  const { chatId, text, sender, time } = req.body;
  
  try {
    // Create Message
    const newMessage = await Message.create({ chatId, text, sender, time });
    
    // Update Chat Metadata (Last message preview)
    await Chat.findByIdAndUpdate(chatId, {
      lastMsg: text,
      lastMsgTime: time,
      unread: sender === "them" ? { $inc: 1 } : 0 // Increment unread if from user
    });

    res.json(newMessage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// 4. Create Dummy Data (Run once to populate DB)
router.post("/seed", async (req, res) => {
  await Chat.create({
    name: "Priyanshu Raghuvanshi",
    phone: "+91 98765 43210",
    status: "active",
    teamMember: "Akshay Tomar",
    labels: ["Warm Lead"],
    avatar: "https://i.pravatar.cc/150?u=1",
    lastMsg: "Hello",
    lastMsgTime: "12:00 PM"
  });
  res.send("Seeded");
});

module.exports = router;