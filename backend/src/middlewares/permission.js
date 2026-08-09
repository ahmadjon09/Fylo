import { ROLE_PERMISSIONS, ROLES } from '../constants/roles.js';
import { AppError } from '../utils/errors.js';

export const requirePermission = (...perms) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Рухсат йўқ', 401, 'UNAUTHORIZED'));
  if (req.user.role === ROLES.SUPER_ADMIN) return next();
  const userPerms = ROLE_PERMISSIONS[req.user.role] || [];
  const has = perms.every((p) => userPerms.includes(p));
  if (!has) return next(new AppError('Ҳуқуқ етарли эмас', 403, 'FORBIDDEN'));
  next();
};
