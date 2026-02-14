const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/messbee")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// API Routes
app.use("/api", chatRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React URL
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  socket.on("send_message", (data) => {
    // Broadcast to everyone in the room EXCEPT sender
    socket.to(data.chatId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));