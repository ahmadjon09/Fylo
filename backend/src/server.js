import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/database.js';
import { setupSocket } from './config/socket.js';
import { redis } from './config/redis.js';
import './modules/telegram/telegram.service.js';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET','POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket','polling'],
});

app.set('io', io);
setupSocket(io);

const start = async () => {
  try {
    await connectDB();
    // Test redis
    try { await redis.ping(); } catch (e) { console.warn('Redis not available, continuing without cache', e.message); }

    server.listen(env.PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 Socket.IO ready`);
    });
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
});

start();
