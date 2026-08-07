import { ROLE_PERMISSIONS } from '../constants/roles.js';
import { AppError } from '../utils/errors.js';

export const requirePermission = (...perms) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  const userPerms = ROLE_PERMISSIONS[req.user.role] || [];
  const has = perms.every((p) => userPerms.includes(p));
  if (!has) return next(new AppError('Missing permission', 403, 'FORBIDDEN'));
  next();
};
