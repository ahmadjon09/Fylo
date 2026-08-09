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
      socket.fullName = payload.fullName || '';
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const socketId = socket.id;
    console.log(`[Fylo Socket] connected: ${userId} - ${socketId}`);

    try {
      await redis.sadd(`presence:sockets:${userId}`, socketId);
      await redis.sadd('presence:online', userId);
      await redis.set(`presence:last:${userId}`, Date.now().toString(), 'EX', 3600);
      await User.findByIdAndUpdate(userId, { isOnline: true, lastActiveAt: new Date() }, { timestamps: false }).catch(()=>{});
      socket.join(`user:${userId}`);
      if (socket.userRole === 'admin' || socket.userRole === 'super_admin') socket.join('admins');

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
        const lastDbUpdate = await redis.get(`presence:db:${userId}`);
        if (!lastDbUpdate) {
          await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }, { timestamps: false }).catch(()=>{});
          await redis.set(`presence:db:${userId}`, '1', 'EX', 60);
        }
      } catch {}
    });

    socket.on('presence:get', async () => {
      try {
        const ids = await redis.smembers('presence:online');
        socket.emit('onlineUsers', ids);
      } catch {}
    });

    // ===== Fylo Messaging System — Telegram-like =====
    socket.on('message:send', async ({ to, text }) => {
      try {
        if (!to || !text?.trim()) return;
        // Lazy import to avoid circular
        const { default: Message } = await import('../modules/messages/message.model.js');
        const UserModel = (await import('../modules/users/user.model.js')).default;
        
        const recipient = await UserModel.findById(to).select('fullName').lean();
        if (!recipient) return;

        const ids = [userId, to].sort();
        const conversationKey = ids.join('_');

        const message = await Message.create({
          from: userId,
          to,
          text: text.trim(),
          conversationKey,
        });

        const populated = await Message.findById(message._id).populate('from to', 'fullName avatar').lean();

        // Emit to both users via their rooms
        io.to(`user:${to}`).emit('message:new', populated);
        io.to(`user:${userId}`).emit('message:sent', populated);
        io.to(`user:${to}`).emit('notification:new', {
          type: 'message',
          from: userId,
          fromName: socket.fullName || 'Foydalanuvchi',
          text: text.trim().slice(0, 60),
          messageId: message._id,
          conversationKey,
        });
      } catch (e) {
        console.error('[Message] send error', e.message);
      }
    });

    socket.on('message:typing', ({ to, isTyping }) => {
      io.to(`user:${to}`).emit('message:typing', { from: userId, isTyping: !!isTyping });
    });

    socket.on('message:read', async ({ conversationKey, partnerId }) => {
      try {
        const { default: Message } = await import('../modules/messages/message.model.js');
        const key = conversationKey || [userId, partnerId].sort().join('_');
        await Message.updateMany({ conversationKey: key, to: userId, read: false }, { read: true, readAt: new Date() }).catch(()=>{});
        io.to(`user:${partnerId}`).emit('message:read', { by: userId, conversationKey: key });
      } catch {}
    });

    // Location sharing for audit
    socket.on('location:update', async ({ lat, lon, city, country }) => {
      try {
        if (lat && lon) {
          await User.findByIdAndUpdate(userId, {
            lastLocation: { lat, lon, city, country, updatedAt: new Date() }
          }, { timestamps: false }).catch(()=>{});
          await redis.set(`location:${userId}`, JSON.stringify({ lat, lon, city, country }), 'EX', 3600).catch(()=>{});
        }
      } catch {}
    });

    socket.on('disconnect', async () => {
      console.log(`[Fylo Socket] disconnected: ${userId} - ${socketId}`);
      try {
        await redis.srem(`presence:sockets:${userId}`, socketId);
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
