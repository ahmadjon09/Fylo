import User from '../users/user.model.js';
import { AppError } from '../../utils/errors.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt.js';
import { redis, cache } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { logAudit } from '../audit/audit.service.js';

const setCookies = (res, tokens) => {
  const isProd = env.isProd;
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    let userCount = 0;
    const cachedFlag = await redis.get('meta:hasUsers').catch(()=>null);
    if (cachedFlag === '1') {
      userCount = 1;
    } else {
      userCount = await User.countDocuments();
      if (userCount > 0) await redis.set('meta:hasUsers', '1', 'EX', 3600).catch(()=>{});
    }

    if (userCount > 0) {
      throw new AppError('Рўйхатдан ўтиш ёпиқ — админ билан боғланинг. @FyloRobot', 403, 'FORBIDDEN');
    }

    const { fullName, phone, password, telegramId } = req.body;
    const exists = await User.findOne({ phone }).lean();
    if (exists) throw new AppError('Телефон рақами аллақачон рўйхатдан ўтган', 409, 'CONFLICT');

    // First user is super_admin
    const user = await User.create({ fullName, phone, password, role: 'super_admin', telegramId, loginCount: 1, lastLoginAt: new Date() });
    const tokens = generateTokenPair(user);

    redis.set(`refresh:${user._id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600).catch(()=>{});
    redis.set('meta:hasUsers', '1', 'EX', 3600).catch(()=>{});
    cache.invalidateTags(['users']).catch(()=>{});

    setCookies(res, tokens);
    logAudit({ req, action: 'user:create', targetId: user._id, user, details: { fullName, phone, role: 'super_admin', isFirst: true } });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role, avatar: user.avatar },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).select('+password +tokenVersion');
    if (!user) throw new AppError('Нотўғри логин ёки парол', 401, 'UNAUTHORIZED');
    if (user.isDisabled) throw new AppError('Аккаунт блокланган', 403, 'FORBIDDEN');

    const match = await user.comparePassword(password);
    if (!match) {
      logAudit({ req, action: 'user:login', details: { phone, success: false, reason: 'wrong_password' } });
      throw new AppError('Нотўғри логин ёки парол', 401, 'UNAUTHORIZED');
    }

    user.lastLoginAt = new Date();
    user.loginCount += 1;
    user.lastActiveAt = new Date();

    const ua = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    // Location if provided
    let locData = null;
    if (req.body.location) locData = req.body.location;
    
    user.devices.push({ 
      userAgent: ua, 
      ip, 
      lastActive: new Date(),
      location: locData ? { lat: locData.lat, lon: locData.lon, city: locData.city, country: locData.country } : undefined,
      locationString: locData ? `${locData.lat},${locData.lon}` : undefined
    });
    if (user.devices.length > 20) user.devices.shift();
    
    if (locData) {
      user.lastLocation = { lat: locData.lat, lon: locData.lon, city: locData.city, country: locData.country, updatedAt: new Date() };
    }

    const savePromise = user.save({ validateBeforeSave: false });

    const tokens = generateTokenPair(user);
    redis.set(`refresh:${user._id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600).catch(()=>{});

    setCookies(res, tokens);
    savePromise.then(()=> {
      req.io?.emit('user:login', { id: user._id, fullName: user.fullName });
    }).catch(()=>{});

    await savePromise;
    logAudit({ req, action: 'user:login', targetId: user._id, user, details: { phone, success: true }, });

    res.json({
      success: true,
      data: {
        user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role, avatar: user.avatar },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (e) { next(e); }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) throw new AppError('Токен керак', 401, 'UNAUTHORIZED');

    const payload = verifyRefreshToken(token);
    const saved = await redis.get(`refresh:${payload.id}`);
    if (!saved || saved !== token) throw new AppError('Токен нотўғри', 401, 'UNAUTHORIZED');

    const user = await User.findById(payload.id).select('+tokenVersion');
    if (!user) throw new AppError('Фойдаланувчи топилмади', 401, 'UNAUTHORIZED');
    if (payload.tokenVersion !== undefined && payload.tokenVersion !== user.tokenVersion) {
      throw new AppError('Токен эскирган', 401, 'UNAUTHORIZED');
    }

    const tokens = generateTokenPair(user);
    redis.set(`refresh:${user._id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600).catch(()=>{});
    setCookies(res, tokens);

    res.json({ success: true, data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  } catch (e) { next(e); }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      redis.del(`refresh:${userId}`).catch(()=>{});
      if (req.token) redis.set(`bl:access:${userId}:${req.token.slice(-10)}`, '1', 'EX', 900).catch(()=>{});
      User.findByIdAndUpdate(userId, { isOnline: false }).catch(()=>{});
      redis.srem('presence:online', userId).catch(()=>{});
      req.io?.emit('user:offline', { id: userId });
      logAudit({ req, action: 'user:logout', targetId: userId, user: req.user });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Чиқиш амалга оширилди' });
  } catch (e) { next(e); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new AppError('Пароллар керак', 400);
    const user = await User.findById(req.user.id).select('+password');
    const match = await user.comparePassword(currentPassword);
    if (!match) throw new AppError('Ҳозирги парол нотўғри', 400);
    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
    redis.del(`refresh:${user._id}`).catch(()=>{});
    res.json({ success: true, message: 'Парол ўзгартирилди' });
  } catch (e) { next(e); }
};
