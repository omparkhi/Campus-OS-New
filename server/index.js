require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

console.log(process.env.MONGO_URI)

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));

const allowedOrigins = [
  "https://campus-os-bpdcgexln-om-parkhi.vercel.app",
  "https://campus-os-new.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket handler
socketHandler(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CampusOS API is running 🚀', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 CampusOS Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});
