const { Server } = require('socket.io');

let io;

const initializeSocket = (httpServer) => {
  // Skip Socket.IO in serverless environments
  if (!httpServer) {
    console.log('⚠️  Socket.IO disabled in serverless environment');
    return null;
  }

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    // Join specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`💬 Socket ${socket.id} joined chat room: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`🚪 Socket ${socket.id} left chat room: ${chatId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      // Broadcast to others in the chat room (not back to sender)
      socket.to(data.chatId).emit('user-typing', { chatId: data.chatId, socketId: socket.id });
    });

    // Handle stopped typing
    socket.on('stop_typing', (data) => {
      socket.to(data.chatId).emit('user-stop-typing', { chatId: data.chatId, socketId: socket.id });
    });

    // Handle user status (online/offline)
    socket.on('user_status', (data) => {
      io.emit('status_update', {
        userId: data.userId,
        status: data.status,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('⚠️  Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('⚠️  Socket.io not available (serverless environment)');
    return null;
  }
  return io;
};

module.exports = { initializeSocket, getIO };
