import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import User from '../modules/users/user.model.js';
import { redis } from '../config/redis.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const tokenFromHeader = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const token = tokenFromHeader || req.cookies?.accessToken;
    if (!token) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

    const payload = verifyAccessToken(token);
    // check blacklist in redis (logout)
    const blacklisted = await redis.get(`bl:access:${payload.id}:${token.slice(-10)}`);
    if (blacklisted) throw new AppError('Token revoked', 401, 'UNAUTHORIZED');

    const user = await User.findById(payload.id).select('+tokenVersion').lean();
    if (!user) throw new AppError('User not found', 401, 'UNAUTHORIZED');
    if (user.isDisabled) throw new AppError('Account disabled', 403, 'FORBIDDEN');

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      phone: user.phone,
      fullName: user.fullName,
      avatar: user.avatar,
    };
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
    next(err);
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
    if (!token) return next();
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next();
  }
};
