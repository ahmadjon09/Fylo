import { verifyAccessToken } from '../utils/jwt.js';
import { redis } from './redis.js';
import User from '../modules/users/user.model.js';

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const socketId = socket.id;
    console.log(`[Socket] connected: ${userId} - ${socketId}`);

    // Multi-socket presence: track all socket ids per user
    try {
      await redis.sadd(`presence:sockets:${userId}`, socketId);
      await redis.sadd('presence:online', userId);
      await redis.set(`presence:last:${userId}`, Date.now().toString(), 'EX', 3600);
      await User.findByIdAndUpdate(userId, { isOnline: true, lastActiveAt: new Date() }, { timestamps: false }).catch(()=>{});
      socket.join(`user:${userId}`);
      if (socket.userRole === 'admin') socket.join('admins');

      // Broadcast immediately
      const onlineIds = await redis.smembers('presence:online').catch(()=>[]);
      io.emit('onlineUsers', onlineIds);
      io.emit('presence:update', { userId, status: 'online' });
      io.emit('user:online', { id: userId });
    } catch (err) {
      console.error('[Socket] presence error', err.message);
    }

    socket.on('user:heartbeat', async () => {
      try {
        await redis.set(`presence:last:${userId}`, Date.now().toString(), 'EX', 3600);
        await redis.set(`presence:user:${userId}`, socketId, 'EX', 3600);
        // Don't hit DB on every heartbeat — throttle to 1 per minute per user via cache
        const lastDbUpdate = await redis.get(`presence:db:${userId}`);
        if (!lastDbUpdate) {
          await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }, { timestamps: false }).catch(()=>{});
          await redis.set(`presence:db:${userId}`, '1', 'EX', 60);
        }
      } catch {}
    });

    // Request current online list
    socket.on('presence:get', async () => {
      try {
        const ids = await redis.smembers('presence:online');
        socket.emit('onlineUsers', ids);
      } catch {}
    });

    // WebRTC signaling
    socket.on('webrtc:offer', ({ to, offer }) => {
      io.to(`user:${to}`).emit('webrtc:offer', { from: userId, offer });
    });
    socket.on('webrtc:answer', ({ to, answer }) => {
      io.to(`user:${to}`).emit('webrtc:answer', { from: userId, answer });
    });
    socket.on('webrtc:ice-candidate', ({ to, candidate }) => {
      io.to(`user:${to}`).emit('webrtc:ice-candidate', { from: userId, candidate });
    });
    socket.on('call:request', ({ to }) => {
      io.emit('call:incoming', { from: userId, to });
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] disconnected: ${userId} - ${socketId}`);
      try {
        await redis.srem(`presence:sockets:${userId}`, socketId);
        // Only mark offline if no more sockets for this user
        const remaining = await redis.scard(`presence:sockets:${userId}`).catch(()=>0);
        if (remaining <= 0) {
          await redis.srem('presence:online', userId);
          await redis.del(`presence:user:${userId}`);
          await redis.del(`presence:sockets:${userId}`);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastActiveAt: new Date() }, { timestamps: false }).catch(()=>{});
          io.emit('presence:update', { userId, status: 'offline' });
          io.emit('user:offline', { id: userId });
        }
        const onlineIds = await redis.smembers('presence:online').catch(()=>[]);
        io.emit('onlineUsers', onlineIds);
      } catch (err) {
        console.error('[Socket] disconnect error', err.message);
      }
    });
  });
};
