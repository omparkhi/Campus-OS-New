const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.role}) — ${socket.id}`);

    // Join role-based rooms
    if (user.role === 'student') {
      socket.join(`student:${user._id}`);
      console.log(`   Joined room: student:${user._id}`);
    } else if (user.role === 'admin') {
      socket.join('admin_room');
      console.log(`   Joined room: admin_room`);
    }

    // Ping/pong for connection health
    socket.on('ping', () => socket.emit('pong'));

    socket.on('disconnect', () => {
      console.log(`🔴 Socket disconnected: ${user.name} — ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
