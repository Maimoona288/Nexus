const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const authRoutes = require('./routes/auth');
const collaborationRoutes = require('./routes/collaborationRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const documentRoutes = require('./routes/documentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// ─── Socket.IO for WebRTC Signaling & Chat ─────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Track online users: userId -> socketId
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // User comes online
  socket.on('user:online', (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit('users:online', Object.keys(onlineUsers));
  });

  // ─── Chat Messaging ──────────────────────────────────────────────────────
  socket.on('chat:message', (data) => {
    const { toUserId, message } = data;
    const targetSocket = onlineUsers[toUserId];
    if (targetSocket) {
      io.to(targetSocket).emit('chat:message', message);
    }
  });

  // ─── WebRTC Signaling ────────────────────────────────────────────────────
  socket.on('webrtc:join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('webrtc:user-joined', { userId, socketId: socket.id });
    console.log(`📞 User ${userId} joined room ${roomId}`);
  });

  socket.on('webrtc:offer', ({ roomId, offer, toSocketId }) => {
    io.to(toSocketId).emit('webrtc:offer', { offer, fromSocketId: socket.id });
  });

  socket.on('webrtc:answer', ({ roomId, answer, toSocketId }) => {
    io.to(toSocketId).emit('webrtc:answer', { answer, fromSocketId: socket.id });
  });

  socket.on('webrtc:ice-candidate', ({ roomId, candidate, toSocketId }) => {
    io.to(toSocketId).emit('webrtc:ice-candidate', { candidate, fromSocketId: socket.id });
  });

  socket.on('webrtc:leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('webrtc:user-left', { userId, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(onlineUsers).find(k => onlineUsers[k] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      io.emit('users:online', Object.keys(onlineUsers));
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in route handlers
app.set('io', io);

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ─── Swagger Docs ───────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nexus Platform API',
      version: '1.0.0',
      description: 'Full-stack API: Auth, Meetings, Documents, Payments, Video'
    },
    servers: [{ url: process.env.API_URL || 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./routes/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/v1/collaboration', collaborationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── MongoDB ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedDemoAccounts();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

async function seedDemoAccounts() {
  try {
    const User = require('./models/User');
    const demos = [
      { name: 'Sarah Jenkins', email: 'sarah@techwave.io', password: 'password123', role: 'entrepreneur',
        bio: 'Founder of TechWave — building AI-driven supply chain solutions.',
        entrepreneurDetails: { startupName: 'TechWave', industry: 'AI & Supply Chain', fundingStage: 'Series A' }
      },
      { name: 'Michael Chang', email: 'michael@vcinnovate.com', password: 'password123', role: 'investor',
        bio: 'Partner at VC Innovate — investing in early-stage tech startups.',
        investorDetails: { companyName: 'VC Innovate', investmentBudget: '$500K - $5M', preferredIndustries: ['AI', 'FinTech', 'SaaS'] }
      }
    ];
    for (const u of demos) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({ ...u, avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random` });
        console.log(`🌱 Seeded: ${u.email}`);
      }
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
});
