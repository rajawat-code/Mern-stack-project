const socketIO = require('socket.io');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'https://linkedin-project-eta.vercel.app',
          'http://localhost:3000'
        ]
          .filter(Boolean)
          .map(url => url.trim().replace(/^["']|["']$/g, '').replace(/\/$/, ''));
        
        const normalizedOrigin = origin.trim().replace(/\/$/, '');
        if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('vercel.app') || normalizedOrigin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Setup user
    socket.on('setup', (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        onlineUsers.set(userData._id.toString(), socket.id);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`User registered in socket: ${userData._id}`);
      }
    });

    // Join chat room
    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, senderId, receiverId }) => {
      io.to(receiverId).emit('typing', { conversationId, senderId });
    });

    socket.on('stop_typing', ({ conversationId, senderId, receiverId }) => {
      io.to(receiverId).emit('stop_typing', { conversationId, senderId });
    });

    // Mark message seen
    socket.on('message_seen', ({ messageId, conversationId, senderId, receiverId }) => {
      io.to(senderId).emit('message_seen_update', { messageId, conversationId, receiverId });
    });

    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log('Client disconnected:', socket.id, 'User:', disconnectedUserId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const getOnlineUsers = () => {
  return onlineUsers;
};

module.exports = {
  initSocket,
  getIO,
  getOnlineUsers,
};
