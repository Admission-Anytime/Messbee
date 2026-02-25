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
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join user to their room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    // Join specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`💬 User joined chat room: ${chatId}`);
    });

    // Handle chat messages (for P2P communication)
    socket.on('send_message', (data) => {
      console.log('📤 Message sent:', data);
      // Broadcast to all clients in the chat room
      io.to(data.chatId).emit('receive_message', data);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.recipientId).emit('user-typing', data);
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
