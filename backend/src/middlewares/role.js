import { AppError } from '../utils/errors.js';

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient role', 403, 'FORBIDDEN'));
  }
  next();
};
