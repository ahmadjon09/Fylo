import Message from './message.model.js';
import User from '../users/user.model.js';
import { throwNotFound, AppError } from '../../utils/errors.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { to, text } = req.body;
    if (!to || !text?.trim()) throw new AppError('Қабул қилувчи ва матн керак', 400);
    if (to === req.user.id) throw new AppError('Ўзингизга хабар юбориб бўлмайди', 400);

    const recipient = await User.findById(to).select('fullName isDisabled').lean();
    if (!recipient) throwNotFound('Фойдаланувчи');
    if (recipient.isDisabled) throw new AppError('Фойдаланувчи блокланган', 403);

    const message = await Message.create({
      from: req.user.id,
      to,
      text: text.trim(),
    });

    const populated = await Message.findById(message._id).populate('from to', 'fullName avatar').lean();

    // Realtime via socket - only for messaging, not for products
    req.io?.to(`user:${to}`).emit('message:new', populated);
    req.io?.to(`user:${req.user.id}`).emit('message:sent', populated);
    // Notification for unread
    req.io?.to(`user:${to}`).emit('notification:new', {
      type: 'message',
      from: req.user.id,
      fromName: req.user.fullName,
      text: text.trim().slice(0, 50),
      messageId: message._id,
    });

    res.status(201).json({ success: true, data: populated });
  } catch (e) { next(e); }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Get all unique conversation partners with last message
    const conversations = await Message.aggregate([
      { $match: { $or: [{ from: req.user._id }, { to: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationKey',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$to', req.user._id] }, { $eq: ['$read', false] }] }, 1, 0] }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $limit: 50 },
    ]);

    // Populate user info
    const userIds = conversations.map(c => {
      const [a,b] = c._id.split('_');
      return a === userId ? b : a;
    });

    const users = await User.find({ _id: { $in: userIds } }).select('fullName avatar isOnline lastActiveAt role').lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const result = conversations.map(c => {
      const [a,b] = c._id.split('_');
      const partnerId = a === userId ? b : a;
      return {
        conversationKey: c._id,
        partner: userMap[partnerId] || null,
        partnerId,
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount,
      };
    });

    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId: partnerId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(50, parseInt(req.query.limit || '20', 10));
    const skip = (page-1)*limit;

    const conversationKey = [req.user.id, partnerId].sort().join('_');

    const [messages, total] = await Promise.all([
      Message.find({ conversationKey }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('from to', 'fullName avatar').lean(),
      Message.countDocuments({ conversationKey }),
    ]);

    // Mark as read - messages sent TO current user
    Message.updateMany({ conversationKey, to: req.user._id, read: false }, { read: true, readAt: new Date() }).catch(()=>{});
    req.io?.to(`user:${partnerId}`).emit('message:read', { by: req.user.id, conversationKey });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: { total, page, limit, pages: Math.ceil(total/limit) }
    });
  } catch (e) { next(e); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ to: req.user._id, read: false });
    const byUser = await Message.aggregate([
      { $match: { to: req.user._id, read: false } },
      { $group: { _id: '$from', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { total: count, byUser } });
  } catch (e) { next(e); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Message.updateMany({ to: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'Барча хабарлар ўқилди' });
  } catch (e) { next(e); }
};
