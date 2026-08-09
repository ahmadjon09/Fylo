import { AppError } from '../utils/errors.js';
import { ROLES } from '../constants/roles.js';

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Рухсат йўқ', 401, 'UNAUTHORIZED'));
  // Super admin has all permissions
  if (req.user.role === ROLES.SUPER_ADMIN) return next();
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Тақиқланган: ҳуқуқ етарли эмас', 403, 'FORBIDDEN'));
  }
  next();
};
