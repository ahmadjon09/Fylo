import User from './user.model.js';
import { AppError, throwNotFound } from '../../utils/errors.js';
import { parsePagination, buildPaginatedResponse, buildSearchFilter } from '../../utils/pagination.js';
import { cache, CACHE_KEYS, redis } from '../../config/redis.js';
import { uploadAvatar } from '../../utils/imgbb.js';
import { logAudit } from '../audit/audit.service.js';
import { ROLES } from '../../constants/roles.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isDisabled !== undefined && req.query.isDisabled !== '') filter.isDisabled = req.query.isDisabled === 'true';
    if (req.query.isOnline !== undefined && req.query.isOnline !== '') filter.isOnline = req.query.isOnline === 'true';
    if (req.query.search) Object.assign(filter, buildSearchFilter(req.query.search, ['fullName', 'phone', 'phoneNormalized']));

    const cacheKey = CACHE_KEYS.users(JSON.stringify({ ...filter, page, limit, sortBy, sortOrder }));
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const [users, total] = await Promise.all([
      User.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const paginated = buildPaginatedResponse(users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    }), total, { page, limit });

    cache.set(cacheKey, paginated, 60).catch(()=>{});
    res.json({ success: true, ...paginated });
  } catch (e) { next(e); }
};

export const getUserById = async (req, res, next) => {
  try {
    const cached = await cache.get(CACHE_KEYS.user(req.params.id));
    if (cached) return res.json({ success: true, data: cached });

    const user = await User.findById(req.params.id).lean();
    if (!user) throwNotFound('Фойдаланувчи');
    const { password, ...safe } = user;
    cache.set(CACHE_KEYS.user(req.params.id), safe, 120).catch(()=>{});
    res.json({ success: true, data: safe });
  } catch (e) { next(e); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) throwNotFound('Фойдаланувчи');
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (e) { next(e); }
};

export const updateMe = async (req, res, next) => {
  try {
    delete req.body.role;
    delete req.body.isDisabled;
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).lean();
    if (!user) throwNotFound('Фойдаланувчи');
    cache.invalidateTags(['users', 'user']).catch(()=>{});
    req.io?.emit('user:updated', { id: user._id, fullName: user.fullName });
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (e) { next(e); }
};

export const uploadMyAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Файл юкланмади', 400, 'VALIDATION_ERROR');
    const result = await uploadAvatar(req.file.buffer);
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: { url: result.url, thumb: result.thumb } }, { new: true }).lean();
    cache.invalidateTags(['users', 'user']).catch(()=>{});
    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (e) { next(e); }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, phone, password, role, telegramId } = req.body;

    // Super admin check: only super_admin can create super_admin
    if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      throw new AppError('Фақат супер админ супер админ ярата олади', 403, 'FORBIDDEN');
    }

    const tempCacheId = `temp:user:${Date.now()}`;
    cache.set(tempCacheId, { fullName, phone, role }, 30).catch(()=>{});

    let user;
    try {
      user = await User.create({ fullName, phone, password, role, telegramId });
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError('Телефон аллақачон мавжуд', 409, 'CONFLICT');
      }
      throw err;
    }

    cache.invalidateTags(['users']).catch(()=>{});
    cache.del(tempCacheId).catch(()=>{});
    redis.set('meta:hasUsers', '1', 'EX', 3600).catch(()=>{});

    const { password: _, ...safe } = user.toObject();
    req.io?.emit('user:created', safe);
    logAudit({ req, action: 'user:create', targetId: user._id, details: { fullName, phone, role } });

    res.status(201).json({ success: true, data: safe });
  } catch (e) { next(e); }
};

export const updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isSelf = targetId === req.user.id;

    const target = await User.findById(targetId).select('role').lean();
    if (!target) throwNotFound('Фойдаланувчи');

    // Super admin protection
    if (target.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      throw new AppError('Супер админни таҳрирлаб бўлмайди', 403, 'FORBIDDEN');
    }
    if (target.role === ROLES.ADMIN && !isSelf && req.user.role === ROLES.ADMIN) {
      throw new AppError('Бошқа админни таҳрирлаб бўлмайди', 403, 'FORBIDDEN');
    }

    const user = await User.findByIdAndUpdate(targetId, req.body, { new: true, runValidators: true }).lean();
    cache.invalidateTags(['users', 'user']).catch(()=>{});
    cache.del(CACHE_KEYS.user(targetId)).catch(()=>{});
    req.io?.emit('user:updated', { id: user._id });
    logAudit({ req, action: 'user:update', targetId, details: { fields: Object.keys(req.body) } });
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (e) { next(e); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) throw new AppError('Ўзингизни ўчира олмайсиз', 400, 'VALIDATION_ERROR');

    const target = await User.findById(targetId).select('role fullName').lean();
    if (!target) throwNotFound('Фойдаланувчи');

    if (target.role === ROLES.SUPER_ADMIN) {
      throw new AppError('Супер админни ўчириб бўлмайди', 403, 'FORBIDDEN');
    }
    if (target.role === ROLES.ADMIN && req.user.role === ROLES.ADMIN) {
      throw new AppError('Бошқа админни ўчириб бўлмайди', 403, 'FORBIDDEN');
    }

    User.findByIdAndDelete(targetId).catch(()=>{});
    cache.invalidateTags(['users', 'user']).catch(()=>{});
    cache.del(CACHE_KEYS.user(targetId)).catch(()=>{});
    req.io?.emit('user:deleted', { id: targetId });
    logAudit({ req, action: 'user:delete', targetId, details: { fullName: target.fullName } });
    res.json({ success: true, message: 'Фойдаланувчи ўчирилди' });
  } catch (e) { next(e); }
};

export const getOnlineUsers = async (req, res, next) => {
  try {
    const cached = await cache.get('cache:presence:online:list').catch(()=>null);
    if (cached) return res.json({ success: true, data: cached });

    const ids = await redis.smembers('presence:online').catch(()=>[]);
    if (!ids.length) return res.json({ success: true, data: [] });
    const users = await User.find({ _id: { $in: ids } }).select('fullName avatar isOnline lastActiveAt role lastLocation').lean();
    cache.set('cache:presence:online:list', users, 15).catch(()=>{});
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
};

export const getUserDevices = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('devices fullName').lean();
    if (!user) throwNotFound('Фойдаланувчи');
    res.json({ success: true, data: user.devices || [] });
  } catch (e) { next(e); }
};
